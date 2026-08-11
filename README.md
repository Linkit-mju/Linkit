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

루트 디렉터리에서 로컬 PostgreSQL을 실행한다.

```bash
docker compose up -d postgres
```

PostgreSQL이 준비되면 백엔드를 `postgres` 프로필로 실행한다.

```bash
cd backend
DB_URL=jdbc:postgresql://localhost:5432/linkit \
DB_USERNAME=linkit \
DB_PASSWORD=linkit-local \
SPRING_PROFILES_ACTIVE=postgres \
./gradlew bootRun
```

운영 환경에서는 `SESSION_COOKIE_SECURE=true`를 유지하고 HTTPS를 사용해야 한다.

로컬 데이터는 `linkit-postgres-data` Docker 볼륨에 보존된다. 컨테이너만 중지하려면 다음 명령을 사용한다.

```bash
docker compose stop postgres
```

## AWS 배포 시 데이터베이스

운영 데이터베이스는 Amazon RDS for PostgreSQL을 사용한다.

- RDS와 백엔드를 같은 VPC의 private subnet에 배치한다.
- RDS 보안 그룹은 백엔드 보안 그룹에서 오는 PostgreSQL 연결만 허용한다.
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`는 배포 환경 변수 또는 AWS Secrets Manager로 주입한다.
- `DB_URL`에는 RDS endpoint와 데이터베이스 이름을 사용한다.
- 운영 연결에는 SSL/TLS를 적용한다.
- 자동 백업과 삭제 방지 기능을 활성화한다.
- 운영 가용성 요구가 확정되면 Multi-AZ를 적용한다.

```text
DB_URL=jdbc:postgresql://<rds-endpoint>:5432/linkit?sslmode=require
DB_USERNAME=<database-user>
DB_PASSWORD=<secret>
SPRING_PROFILES_ACTIVE=postgres
SESSION_COOKIE_SECURE=true
```

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
