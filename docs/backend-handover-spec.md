# Linkit 카테고리·인수인계 백엔드 구현 명세

> 상태: 백엔드 구현 및 인수인계 화면 연동 완료
> 기준 화면: `frontend/src/handover/`
> 기준 인증 구현: `backend/src/main/java/kr/ac/mju/linkit/auth/`
> API 기본 경로: `/api/v1`

## 1. 목적과 현재 상태

이 문서는 계획 문서가 아니라 현재 인수인계 화면이 실제로 사용하는 상태 모델과 사용자 동작을 백엔드 구현 계약으로 옮긴 것이다.

현재 백엔드는 인증과 카테고리·인수인계 CRUD를 제공하고, 인수인계 화면은 아래 계약으로 목록 조회와 변경 사항을 서버에 반영한다.

이번 범위에는 다음을 포함한다.

- 로그인 사용자별 카테고리 생성, 조회, 수정, 삭제
- 로그인 사용자별 인수인계 생성, 전체 조회, 수정, 삭제
- 카테고리 삭제 시 포함된 인수인계 삭제
- 현재 화면이 표시하는 인수인계 전체 필드의 영속화

다음은 포함하지 않는다.

- 조직·임기·부서·역할 모델
- 첨부 파일, 댓글, 문서 버전, 자동 저장
- 문서 또는 카테고리 순서 변경
- 서버 검색, 휴지통·복구, 템플릿 관리
- 다중 사용자 동시 편집과 충돌 해결 UI

조직 모델이 생기기 전에는 `AuthenticatedUser.id()`를 데이터 소유자 범위로 사용한다. 다른 사용자의 리소스는 존재 여부를 드러내지 않고 `404`로 처리한다.

## 2. 프론트엔드에서 확인한 계약

| 화면 동작                                                                                   | 백엔드 계약                                                                                                     |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 사이드바는 카테고리별로 모든 인수인계를 즉시 묶어 표시한다.                                 | 목록 조회는 요약본이 아니라 문서 화면에 필요한 전체 `Handover`를 반환한다.                                      |
| 선택한 인수인계는 별도 로딩 없이 제목, 담당자, 최근 수정, 상태, 요약과 5개 섹션을 표시한다. | `GET /handovers` 응답의 각 항목은 상세 필드를 모두 포함한다. 상세 전용 API는 이 범위에 필요하지 않다.           |
| 검색 입력은 제목 또는 담당자를 한글 로캘 소문자 비교로 현재 상태에서 필터링한다.            | 초기 범위에 `query`나 `categoryId` 검색 파라미터를 만들지 않는다. 서버는 사용자의 전체 워크스페이스를 반환한다. |
| 새 문서는 제목·카테고리만 필수이며 담당자 공란은 `담당자 미정`으로 저장한다.                | 생성·수정 요청은 이 기본값을 포함한 정규화된 값을 보낸다. 서버도 빈 담당자를 임의의 다른 값으로 바꾸지 않는다.  |
| 여러 줄 텍스트 영역은 줄별 목록으로 바뀌고 빈 줄은 제거된다.                                | 각 섹션은 순서 있는 문자열 배열로 저장·반환한다.                                                                |
| 카테고리를 삭제하면 연결된 문서도 사라진다.                                                 | 카테고리와 소속 인수인계는 한 트랜잭션에서 함께 삭제한다.                                                       |
| 삭제 확인문은 되돌릴 수 없다고 안내한다.                                                    | 복구 API와 휴지통은 제공하지 않는다.                                                                            |

프론트 모델의 상태값은 API에서도 그대로 소문자로 사용한다.

| API 값     | 화면 표시 |
| ---------- | --------- |
| `draft`    | 작성 중   |
| `review`   | 확인 필요 |
| `complete` | 전달 완료 |

## 3. 인증과 공통 규약

모든 아래 API는 기존 세션 인증을 사용한다.

- 로그인 후 받은 `JSESSIONID` 쿠키를 포함한다.
- `POST`, `PATCH`, `PUT`, `DELETE`에는 먼저 `GET /api/v1/auth/csrf`에서 받은 `headerName`과 `token`을 헤더에 넣는다.
- 비로그인 요청은 `401 AUTHENTICATION_REQUIRED`를 반환한다.
- 현재 허용 CORS origin은 Vite 개발 서버인 `http://localhost:5173` 및 `http://127.0.0.1:5173`이다.

인증 API는 현재 구현을 유지한다.

| 메서드 | 경로            | 용도                                     |
| ------ | --------------- | ---------------------------------------- |
| `GET`  | `/auth/csrf`    | 상태 변경 요청용 CSRF 헤더명과 토큰 조회 |
| `POST` | `/auth/sign-up` | `@mju.ac.kr` 계정 생성                   |
| `POST` | `/auth/login`   | 세션 로그인                              |
| `POST` | `/auth/logout`  | 현재 세션 로그아웃                       |
| `GET`  | `/auth/me`      | 로그인 사용자 조회                       |

## 4. 리소스 형태

서버 ID는 UUID 문자열을 사용한다. 프론트엔드 프로토타입의 `category-{timestamp}`, `handover-{timestamp}` 형식은 로컬 상태 전용이므로 API에 유지하지 않는다.

```json
{
  "id": "6c68b971-f7bb-4d6e-8d8c-78c4e03ee236",
  "categoryId": "4aac8fd1-3a44-4a7e-8740-c9dd76c5a0d2",
  "title": "대동제 운영 인수인계",
  "owner": "기획국 김민지",
  "status": "review",
  "summary": "대동제 준비부터 당일 운영까지 필요한 절차입니다.",
  "criticalNotes": ["운동장 사용 신청은 행사 8주 전까지 제출합니다."],
  "recurringTasks": ["D-60: 장소와 예산 확정"],
  "checklist": ["학생지원팀 대관 공문 제출"],
  "references": ["2026 대동제 최종 예산안"],
  "openQuestions": ["우천 시 대체 장소 확정 필요"],
  "updatedAt": "2026-08-08T01:24:00Z"
}
```

`updatedAt`은 UTC ISO-8601 문자열이다. 현재 프로토타입은 표시용 문자열을 그대로 렌더링하므로, API 연결 시 프론트 API 경계에서 `ko-KR` 표시 문자열로 변환한다. 서버가 `오늘 오전 10:24` 같은 화면 문구를 만들지 않는다.

카테고리 응답은 화면 모델과 동일하게 ID와 이름만 가진다.

```json
{
  "id": "4aac8fd1-3a44-4a7e-8740-c9dd76c5a0d2",
  "name": "행사 및 기획"
}
```

## 5. HTTP API

### 5.1 카테고리

#### 목록

```http
GET /api/v1/handover-categories
```

```json
{
  "items": [
    { "id": "4aac8fd1-3a44-4a7e-8740-c9dd76c5a0d2", "name": "행사 및 기획" }
  ]
}
```

응답 순서는 생성 순서 오름차순이다. 프론트엔드는 이 순서로 사이드바 카테고리를 렌더링한다.

#### 생성

```http
POST /api/v1/handover-categories
Content-Type: application/json
{csrfHeaderName}: {csrfToken}

{"name":"회계 및 예산"}
```

성공 시 `201 Created`와 생성된 카테고리를 반환한다. `Location`은 생성된 리소스 경로를 가리킨다.

#### 이름 수정

```http
PATCH /api/v1/handover-categories/{categoryId}
Content-Type: application/json
{csrfHeaderName}: {csrfToken}

{"name":"예산 및 정산"}
```

성공 시 `200 OK`와 수정된 카테고리를 반환한다.

#### 삭제

```http
DELETE /api/v1/handover-categories/{categoryId}
{csrfHeaderName}: {csrfToken}
```

성공 시 `204 No Content`를 반환한다. 해당 카테고리에 속한 모든 인수인계도 함께 삭제한다.

### 5.2 인수인계

#### 전체 조회

```http
GET /api/v1/handovers
```

응답은 각 항목이 [4절](#4-리소스-형태)의 모든 필드를 포함하는 목록이다.

```json
{
  "items": [
    {
      "id": "6c68b971-f7bb-4d6e-8d8c-78c4e03ee236",
      "categoryId": "4aac8fd1-3a44-4a7e-8740-c9dd76c5a0d2",
      "title": "대동제 운영 인수인계",
      "owner": "기획국 김민지",
      "status": "review",
      "summary": "대동제 준비부터 당일 운영까지 필요한 절차입니다.",
      "criticalNotes": [],
      "recurringTasks": [],
      "checklist": [],
      "references": [],
      "openQuestions": [],
      "updatedAt": "2026-08-08T01:24:00Z"
    }
  ]
}
```

정렬은 `updated_at desc, id asc`이다. 새로 생성하거나 수정한 문서가 목록의 앞에 보인다.

#### 생성

```http
POST /api/v1/handovers
Content-Type: application/json
{csrfHeaderName}: {csrfToken}

{
  "categoryId": "4aac8fd1-3a44-4a7e-8740-c9dd76c5a0d2",
  "title": "대동제 운영 인수인계",
  "owner": "기획국 김민지",
  "status": "draft",
  "summary": "행사 운영 절차",
  "criticalNotes": [],
  "recurringTasks": [],
  "checklist": [],
  "references": [],
  "openQuestions": []
}
```

`201 Created`와 전체 인수인계 응답을 반환한다. `categoryId`는 현재 사용자의 카테고리여야 한다.

#### 수정

```http
PUT /api/v1/handovers/{handoverId}
Content-Type: application/json
{csrfHeaderName}: {csrfToken}

{
  "categoryId": "4aac8fd1-3a44-4a7e-8740-c9dd76c5a0d2",
  "title": "대동제 운영 인수인계",
  "owner": "기획국 김민지",
  "status": "review",
  "summary": "갱신된 요약",
  "criticalNotes": [],
  "recurringTasks": [],
  "checklist": [],
  "references": [],
  "openQuestions": []
}
```

`200 OK`와 갱신된 전체 인수인계 응답을 반환한다. 카테고리 변경도 이 요청으로 처리한다.

#### 삭제

```http
DELETE /api/v1/handovers/{handoverId}
{csrfHeaderName}: {csrfToken}
```

성공 시 `204 No Content`를 반환한다.

## 6. 입력 정규화와 오류

클라이언트 검증은 사용자 경험을 위한 것이며 서버 검증을 대체하지 않는다.

| 입력             | 서버 규칙                                                              | 프론트엔드 근거                                    |
| ---------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| 카테고리 `name`  | trim 후 비어 있으면 `400 VALIDATION_FAILED`                            | 카테고리 대화상자가 공백 이름을 막는다.            |
| 인수인계 `title` | trim 후 비어 있으면 `400 VALIDATION_FAILED`                            | 제목은 유일한 필수 텍스트 입력이다.                |
| `categoryId`     | 현재 사용자의 활성 카테고리가 아니면 `404 HANDOVER_CATEGORY_NOT_FOUND` | 선택기에는 현재 상태의 카테고리만 표시된다.        |
| `owner`          | trim 후 빈 값은 `담당자 미정`으로 정규화해 저장                        | 저장 전 프론트가 같은 값으로 바꾼다.               |
| `status`         | `draft`, `review`, `complete`만 허용                                   | 선택기의 세 가지 값과 일치해야 한다.               |
| `summary`        | 빈 문자열 허용                                                         | 문서 화면은 빈 요약의 안내 문구를 제공한다.        |
| 5개 섹션 배열    | 순서 유지, 각 항목 trim, 빈 항목 제거                                  | 텍스트 영역을 줄 배열로 바꿀 때 동일하게 처리한다. |

오류 본문은 기존 `ApiError(code, message, fieldErrors)` 모양을 유지한다.

| HTTP | 코드                          | 조건                                 |
| ---: | ----------------------------- | ------------------------------------ |
|  400 | `VALIDATION_FAILED`           | 위 입력 규칙 위반                    |
|  401 | `AUTHENTICATION_REQUIRED`     | 로그인 세션 없음                     |
|  403 | Spring Security 기본 응답     | CSRF 토큰 누락 또는 불일치           |
|  404 | `HANDOVER_CATEGORY_NOT_FOUND` | 카테고리가 없거나 다른 사용자의 소유 |
|  404 | `HANDOVER_NOT_FOUND`          | 인수인계가 없거나 다른 사용자의 소유 |

## 7. 구현과 연결 상태

백엔드는 현재 인증 모듈의 세션 principal과 공통 오류 응답을 재사용한다. 조직 모델이 없으므로 모든 repository 조회·변경에는 `owner_id` 조건을 포함한다.

프론트엔드는 다음 방식으로 연결되어 있다.

1. `frontend/src/handover/api.ts`에서 위 API를 호출하고 CSRF 처리를 인증 API와 같은 방식으로 캡슐화한다.
2. `HandoverPage`의 초기 상수 대신 카테고리와 전체 인수인계 목록을 불러온다.
3. 생성·수정·삭제 뒤에는 서버 응답을 상태에 반영한다.
4. `updatedAt` ISO 값을 현재 UI의 한국어 표시 문자열로 변환한다.

`HandoverPage`는 목록 조회가 `401`이면 `/login`으로 이동한다. 로그인 성공 후 `/`로 이동하는 인증 화면 동작은 이 인수인계 API 연결 범위에 포함하지 않는다.

## 8. 완료 검증

최소 통합 테스트는 다음을 증명한다.

1. 로그인 사용자가 카테고리를 생성·수정·목록 조회·삭제할 수 있다.
2. 카테고리 삭제 후 소속 인수인계도 목록에 없다.
3. 인수인계 목록의 한 항목만으로 프론트 문서 화면의 모든 필드와 5개 섹션을 렌더링할 수 있다.
4. 빈 요약과 빈 섹션 배열을 저장·조회할 수 있고, 배열 순서는 유지된다.
5. 생성·수정된 문서의 `updatedAt`은 ISO-8601 UTC 문자열이며 목록의 최신순 정렬에 반영된다.
6. 사용자 A는 사용자 B의 카테고리·인수인계를 조회, 수정, 삭제할 수 없고 `404`를 받는다.
7. 모든 상태 변경 요청은 CSRF 토큰 없이는 실패한다.

검증 명령:

```bash
cd backend
./gradlew test
```
