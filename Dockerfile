FROM node:22-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /workspace/backend
COPY backend/ ./
COPY --from=frontend-build /workspace/frontend/dist/ src/main/resources/static/
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S linkit && adduser -S linkit -G linkit
WORKDIR /app
COPY --from=backend-build /workspace/backend/build/libs/*.jar app.jar
USER linkit
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
