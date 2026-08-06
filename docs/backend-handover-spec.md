# Linkit 카테고리·인수인계 백엔드 구현 명세

> 대상: Codex 구현 작업용
> 상태: Frontend prototype contract v1
> 기준 프론트엔드: `frontend/src/handover/`

## 1. 목표와 범위

프론트엔드의 카테고리 및 인수인계 CRUD를 Spring Boot API와 PostgreSQL/H2 영속화로 연결한다.

이번 구현에 포함한다.

- 로그인 사용자별 카테고리 조회·추가·수정·삭제
- 로그인 사용자별 인수인계 조회·추가·수정·삭제
- 카테고리별 인수인계 조회와 제목/담당자 검색
- 낙관적 잠금으로 동시 수정 충돌 방지
- 모든 읽기와 쓰기에서 소유권 검증
- Flyway 마이그레이션과 통합 테스트

이번 구현에서는 제외한다.

- 조직, 임기, 부서, 역할 기반 권한 모델
- 첨부 파일, 댓글, 버전 이력, 자동 저장
- 카테고리/문서 순서 변경
- 휴지통과 복구 UI

현재 백엔드에는 조직 모델이 없으므로 v1은 `owner_id = AuthenticatedUser.id()`로 데이터를 격리한다. 조직 기능이 추가되면 API 경로와 응답 형태를 유지한 채 소유권 조건을 `organization_id + membership` 검사로 교체한다.

## 2. 기존 코드와 구현 위치

현재 규칙을 그대로 따른다.

- Java 21, Spring Boot 4.1, Spring MVC, Spring Data JPA
- 세션 인증 principal: `kr.ac.mju.linkit.auth.AuthenticatedUser`
- 공통 오류 응답: `kr.ac.mju.linkit.common.ApiExceptionHandler.ApiError`
- 마이그레이션: `backend/src/main/resources/db/migration/`

추가할 패키지와 파일의 권장 최소 구조:

```text
backend/src/main/java/kr/ac/mju/linkit/handover/
├── HandoverCategory.java
├── Handover.java
├── HandoverSectionItem.java
├── HandoverStatus.java
├── HandoverSectionType.java
├── HandoverCategoryRepository.java
├── HandoverRepository.java
├── HandoverController.java
├── HandoverService.java
├── HandoverRequests.java
├── HandoverResponses.java
└── HandoverExceptions.java
```

파일이 250줄을 넘으면 요청/응답 또는 엔티티 단위로만 분리한다. 범용 추상화, generic CRUD 서비스, 매퍼 프레임워크는 추가하지 않는다.

## 3. 데이터 모델

### 3.1 상태

```java
public enum HandoverStatus {
    DRAFT,
    REVIEW,
    COMPLETE
}
```

프론트 매핑:

| API | 화면 |
|---|---|
| `DRAFT` | 작성 중 |
| `REVIEW` | 확인 필요 |
| `COMPLETE` | 전달 완료 |

섹션 타입:

```java
public enum HandoverSectionType {
    CRITICAL_NOTE,
    RECURRING_TASK,
    CHECKLIST,
    REFERENCE,
    OPEN_QUESTION
}
```

### 3.2 테이블

Flyway 파일: `V2__create_handovers.sql`

```sql
create table handover_categories (
    id uuid primary key,
    owner_id uuid not null references users(id),
    name varchar(60) not null,
    version bigint not null default 0,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    deleted_at timestamp with time zone,
    constraint ck_handover_categories_name_not_blank
        check (char_length(trim(name)) > 0)
);

create index ix_handover_categories_owner
    on handover_categories(owner_id, deleted_at, created_at);

create table handovers (
    id uuid primary key,
    owner_id uuid not null references users(id),
    category_id uuid not null references handover_categories(id),
    title varchar(120) not null,
    owner_name varchar(100) not null,
    status varchar(20) not null,
    summary varchar(2000) not null,
    version bigint not null default 0,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    deleted_at timestamp with time zone,
    constraint ck_handovers_title_not_blank
        check (char_length(trim(title)) > 0),
    constraint ck_handovers_status
        check (status in ('DRAFT', 'REVIEW', 'COMPLETE'))
);

create index ix_handovers_owner_category
    on handovers(owner_id, category_id, deleted_at, updated_at);

create table handover_section_items (
    id uuid primary key,
    handover_id uuid not null references handovers(id) on delete cascade,
    section_type varchar(30) not null,
    content varchar(1000) not null,
    sort_order integer not null,
    constraint ck_handover_section_type check (
        section_type in (
            'CRITICAL_NOTE', 'RECURRING_TASK', 'CHECKLIST',
            'REFERENCE', 'OPEN_QUESTION'
        )
    ),
    constraint ck_handover_section_content_not_blank
        check (char_length(trim(content)) > 0),
    constraint uk_handover_section_order
        unique (handover_id, section_type, sort_order)
);
```

엔티티 규칙:

- `HandoverCategory`와 `Handover`에 `@Version long version`을 둔다.
- 삭제는 `deletedAt`을 기록하는 소프트 삭제다.
- 조회 repository 메서드는 항상 `ownerId`와 `deletedAt is null`을 함께 조건으로 사용한다.
- `Handover`의 섹션 항목은 `@OneToMany(cascade = ALL, orphanRemoval = true)`로 관리한다.
- 수정 시 전달된 배열 순서대로 `sortOrder`를 0부터 다시 부여한다.
- category의 `ownerId`와 handover의 `ownerId`는 반드시 같아야 한다.

## 4. HTTP API

기본 경로: `/api/v1`

모든 API는 인증이 필요하다. `POST`, `PUT`, `PATCH`, `DELETE` 요청은 기존 CSRF 쿠키와 `X-XSRF-TOKEN` 헤더를 사용한다.

### 4.1 카테고리

#### 목록

```http
GET /api/v1/handover-categories
```

```json
{
  "items": [
    {
      "id": "4aac...",
      "name": "행사 및 기획",
      "handoverCount": 2,
      "version": 0
    }
  ]
}
```

정렬: `created_at asc`.

#### 추가

```http
POST /api/v1/handover-categories
Content-Type: application/json

{"name":"회계 및 예산"}
```

- `201 Created`
- `Location: /api/v1/handover-categories/{id}`
- body는 생성된 category 응답

#### 수정

```http
PATCH /api/v1/handover-categories/{categoryId}
Content-Type: application/json

{"name":"예산 및 정산","version":0}
```

응답: `200 OK`와 갱신된 category.

#### 삭제

```http
DELETE /api/v1/handover-categories/{categoryId}?version=0
```

- 해당 category와 포함된 활성 handover를 한 트랜잭션에서 소프트 삭제한다.
- 성공: `204 No Content`.
- 다른 사용자의 category도 존재하지 않는 것처럼 `404`를 반환한다.

### 4.2 인수인계

#### 목록 및 검색

```http
GET /api/v1/handovers?categoryId={uuid}&query={text}
```

`categoryId`, `query`는 선택 사항이다. `query`는 trim 후 100자 이하이며 제목 또는 담당자 이름에서 대소문자 무시 부분 일치한다.

```json
{
  "items": [
    {
      "id": "6c68...",
      "categoryId": "4aac...",
      "title": "대동제 운영 인수인계",
      "owner": "기획국 김민지",
      "status": "REVIEW",
      "updatedAt": "2026-08-05T01:24:00Z",
      "version": 3
    }
  ]
}
```

정렬: `updated_at desc, id asc`.

#### 상세

```http
GET /api/v1/handovers/{handoverId}
```

```json
{
  "id": "6c68...",
  "categoryId": "4aac...",
  "title": "대동제 운영 인수인계",
  "owner": "기획국 김민지",
  "status": "REVIEW",
  "summary": "대동제 준비부터 당일 운영까지...",
  "criticalNotes": ["운동장 사용 신청은 행사 8주 전까지 제출합니다."],
  "recurringTasks": ["D-60: 장소와 예산 확정"],
  "checklist": ["학생지원팀 대관 공문 제출"],
  "references": ["2026 대동제 최종 예산안"],
  "openQuestions": ["우천 시 대체 장소 확정 필요"],
  "createdAt": "2026-08-01T02:00:00Z",
  "updatedAt": "2026-08-05T01:24:00Z",
  "version": 3
}
```

#### 추가

```http
POST /api/v1/handovers
Content-Type: application/json

{
  "categoryId": "4aac...",
  "title": "대동제 운영 인수인계",
  "owner": "기획국 김민지",
  "status": "DRAFT",
  "summary": "행사 운영 절차",
  "criticalNotes": [],
  "recurringTasks": [],
  "checklist": [],
  "references": [],
  "openQuestions": []
}
```

- category가 현재 사용자의 활성 category여야 한다.
- `201 Created`, `Location` 헤더, 상세 응답 body.

#### 전체 수정

```http
PUT /api/v1/handovers/{handoverId}
Content-Type: application/json

{
  "categoryId": "4aac...",
  "title": "대동제 운영 인수인계",
  "owner": "기획국 김민지",
  "status": "REVIEW",
  "summary": "갱신된 요약",
  "criticalNotes": [],
  "recurringTasks": [],
  "checklist": [],
  "references": [],
  "openQuestions": [],
  "version": 3
}
```

응답: `200 OK`와 갱신된 상세 응답. 성공 시 version이 증가한다.

#### 삭제

```http
DELETE /api/v1/handovers/{handoverId}?version=3
```

성공: `204 No Content`.

## 5. 입력 검증

Jakarta Validation을 요청 record에 적용한다.

| 필드 | 규칙 |
|---|---|
| `name` | trim 후 1–60자 |
| `title` | trim 후 1–120자 |
| `owner` | trim 후 1–100자, 빈 입력은 서버에서 `담당자 미정`으로 바꾸지 말고 400 |
| `summary` | 0–2000자 |
| 각 section 배열 | 최대 50개 |
| 각 section item | trim 후 1–1000자 |
| `query` | trim 후 0–100자 |
| `version` | 0 이상 |

서비스 계층에서 모든 문자열을 trim한 뒤 저장한다. 빈 section item은 조용히 제거하지 않고 `VALIDATION_FAILED`로 거부한다.

## 6. 오류 계약

기존 `ApiError(code, message, fieldErrors)` 형태를 유지한다.

| HTTP | code | 조건 |
|---|---|---|
| 400 | `VALIDATION_FAILED` | 요청 필드 검증 실패 |
| 404 | `HANDOVER_CATEGORY_NOT_FOUND` | category 없음, 삭제됨, 또는 다른 사용자 소유 |
| 404 | `HANDOVER_NOT_FOUND` | handover 없음, 삭제됨, 또는 다른 사용자 소유 |
| 409 | `HANDOVER_VERSION_CONFLICT` | category 또는 handover version 불일치 |
| 401 | `AUTHENTICATION_REQUIRED` | 기존 SecurityConfig 처리 |

소유권 불일치는 `403`이 아니라 `404`로 응답해 다른 사용자의 리소스 존재 여부를 노출하지 않는다.

## 7. 서비스 규칙

- controller는 `@AuthenticationPrincipal AuthenticatedUser user`를 받고 `user.id()`만 service에 전달한다.
- service의 모든 public 변경 메서드는 `@Transactional`이다.
- repository의 `findById` 단독 호출은 금지한다. `findByIdAndOwnerIdAndDeletedAtIsNull`을 사용한다.
- 시간은 새 `Clock`을 만들지 말고 기존 `Clock` bean을 주입해 `Instant.now(clock)`로 생성한다.
- ID는 `UUID.randomUUID()`로 생성한다.
- category 삭제 시 category와 child handover의 `deletedAt`을 동일한 `Instant`로 기록한다.
- `DataIntegrityViolationException`을 일반 500으로 흘리지 말고, 재현 가능한 도메인 충돌이면 명시적 예외로 변환한다.
- entity를 controller에서 직접 직렬화하지 않는다. response record로 변환한다.

## 8. 테스트 요구사항

기존 `AuthControllerIntegrationTests` 패턴을 재사용해 HTTP 통합 테스트를 작성한다.

최소 시나리오:

1. 인증된 사용자가 category를 생성하고 목록에서 조회한다.
2. 인증되지 않은 category 요청은 401이다.
3. 사용자 A는 사용자 B의 category를 조회·수정·삭제할 수 없고 모두 404다.
4. category 이름 검증 실패는 `VALIDATION_FAILED`와 `fieldErrors`를 반환한다.
5. handover 생성 후 목록과 상세 응답의 모든 섹션 순서가 유지된다.
6. `categoryId` 필터와 제목/담당자 검색이 동작한다.
7. handover 수정 시 version이 증가한다.
8. 오래된 version으로 수정/삭제하면 409 `HANDOVER_VERSION_CONFLICT`다.
9. category 삭제 시 포함된 handover도 이후 조회되지 않는다.
10. 사용자 A는 사용자 B의 category에 handover를 만들 수 없다.

각 변경 API 테스트는 먼저 `/api/v1/auth/csrf`에서 토큰을 얻고 CSRF 헤더를 포함한다. 테스트는 결과 JSON과 DB의 소유권/삭제 상태를 함께 검증한다.

검증 명령:

```bash
cd backend
./gradlew test
```

## 9. 프론트엔드 연결 계약

백엔드 구현 후 프론트에서 다음만 교체한다.

1. `frontend/src/handover/api.ts`를 만들고 category/handover 요청을 캡슐화한다.
2. `HandoverPage`의 `INITIAL_*` state를 GET 응답으로 초기화한다.
3. create/update/delete 핸들러를 API 호출 후 서버 응답으로 state에 반영한다.
4. API `DRAFT | REVIEW | COMPLETE`를 프론트 `draft | review | complete`로 경계에서 변환한다.
5. `updatedAt`은 ISO 문자열을 받아 `Intl.DateTimeFormat('ko-KR')`로 표시한다.
6. 409 충돌 시 작성 내용을 버리지 말고 “다른 사용자가 먼저 수정했습니다” 배너와 새로고침 동작을 제공한다.

프론트 모델의 표시용 `owner` 필드와 API의 `owner` 이름을 동일하게 유지한다. 사용자 ID 기반 담당자 지정은 조직/구성원 모델이 추가될 때 별도 계약으로 확장한다.

## 10. 완료 조건

- 위 endpoint와 오류 코드가 문서대로 동작한다.
- 다른 사용자의 데이터가 어떤 조회/변경 경로에서도 노출되지 않는다.
- H2 기본 프로필과 PostgreSQL 프로필 모두 V2 migration을 적용할 수 있다.
- 전체 `./gradlew test`가 통과한다.
- 프론트엔드에서 category와 handover CRUD 한 사이클을 API로 실행할 수 있다.
- 범위 밖 기능이나 새 프레임워크/라이브러리를 추가하지 않는다.
