# Linkit

명지대학교 학생회를 위한 인수인계 플랫폼이다.

## 기술 스택

- Frontend: React, TypeScript, Vite, Astryx
- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA
- Database: PostgreSQL, Flyway
- Local development database: H2 PostgreSQL compatibility mode

## 로컬 실행

### 1. 백엔드

```bash
cd backend
./gradlew bootRun
```


### 2. 프론트엔드

다른 터미널에서 실행한다.

```bash
cd frontend
npm install
npm run dev
```


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
