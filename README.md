# Linkit

명지대학교 학생회를 위한 인수인계 플랫폼이다.

## 기술 스택

- Frontend: React, TypeScript, Vite, Astryx
- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA
- Database: PostgreSQL, Flyway
- Local development database: H2 PostgreSQL compatibility mode

## 로컬 실행

프론트엔드 개발 서버가 연결할 백엔드 주소는 Git에 포함되지 않는 `.env`에서 관리합니다.

```bash
cp frontend/.env.example frontend/.env
```

### 1. 백엔드

```bash
cd backend
./gradlew bootRun
```

백엔드 API는 `http://127.0.0.1:8080`에서 실행된다. 기본 프로필은 별도 설치가 필요 없는 인메모리 H2를 사용한다.

### 2. 프론트엔드

다른 터미널에서 실행한다.

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `http://127.0.0.1:5173`에서 실행되며 `/api` 요청을 로컬 Spring 서버로 프록시한다.

- 로그인: `http://127.0.0.1:5173/login`
- 회원가입: `http://127.0.0.1:5173/signup`

## PostgreSQL로 실행

```bash
cd backend
DB_URL=jdbc:postgresql://localhost:5432/linkit \
DB_USERNAME=linkit \
DB_PASSWORD=linkit \
SPRING_PROFILES_ACTIVE=postgres \
./gradlew bootRun
```

운영 환경에서는 `SESSION_COOKIE_SECURE=true`를 유지하고 HTTPS를 사용해야 한다.

## 검사

```bash
cd frontend
npm run lint
npm run build

cd ../backend
./gradlew test
```

## 인증 API

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/v1/auth/csrf` | CSRF 토큰 발급 |
| POST | `/api/v1/auth/sign-up` | 회원가입 |
| POST | `/api/v1/auth/login` | 세션 로그인 |
| POST | `/api/v1/auth/logout` | 로그아웃 |
| GET | `/api/v1/auth/me` | 로그인 사용자 조회 |

회원가입과 로그인 이메일은 서버에서 공백 제거와 소문자 변환 후 검사한다. 정확히 `@mju.ac.kr` 도메인을 사용하는 이메일만 가입할 수 있다.

## 인수인계 API

| Method | Path | 설명 |
|---|---|---|
| GET, POST | `/api/v1/handover-categories` | 카테고리 목록 조회·생성 |
| PATCH, DELETE | `/api/v1/handover-categories/{categoryId}` | 카테고리 수정·삭제 |
| GET, POST | `/api/v1/handovers` | 인수인계 목록 조회·생성 |
| PUT, DELETE | `/api/v1/handovers/{handoverId}` | 인수인계 수정·삭제 |

모든 인수인계 데이터는 로그인 사용자별로 분리되며, 상태 변경 요청에는 CSRF 토큰이 필요하다.
