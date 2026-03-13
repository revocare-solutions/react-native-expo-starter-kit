# Starter Kit Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Spring Boot + PostgreSQL backend with 7 modules (auth, analytics, crash reporting, notifications, tasks CRUD, i18n, sync) that serves as the real integration target for the React Native Expo Starter Kit.

**Architecture:** Modular monolith — single Spring Boot 3.3 app with self-contained modules following `controller → service → repository → dto → entity` pattern. Docker Compose for local dev with PostgreSQL 16 and LocalStack (Cognito, SNS). Spring Security with Cognito JWT validation.

**Tech Stack:** Java 17, Spring Boot 3.3, Maven, PostgreSQL 16, Spring Security (OAuth2 Resource Server), Spring Data JPA, Flyway, Docker Compose, LocalStack, Springdoc OpenAPI, Bucket4j (rate limiting)

**Spec:** `docs/superpowers/specs/2026-03-13-starter-kit-backend-design.md`

**Target repo:** `D:\revocare\repository\react-native-expo-starter-kit-backend\`

---

## File Structure

```
react-native-expo-starter-kit-backend/
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── .gitignore
├── src/main/java/com/revocare/starterkit/
│   ├── StarterKitApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   ├── OpenApiConfig.java
│   │   ├── GlobalExceptionHandler.java
│   │   └── RateLimitConfig.java
│   ├── common/
│   │   ├── dto/
│   │   │   ├── ApiErrorResponse.java
│   │   │   └── PagedResponse.java
│   │   ├── entity/
│   │   │   └── BaseEntity.java
│   │   └── exception/
│   │       ├── ResourceNotFoundException.java
│   │       ├── ForbiddenException.java
│   │       └── RateLimitExceededException.java
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controller/AuthController.java
│   │   │   ├── service/AuthService.java
│   │   │   ├── service/CognitoService.java
│   │   │   ├── repository/UserRepository.java
│   │   │   ├── dto/RegisterRequest.java
│   │   │   ├── dto/LoginRequest.java
│   │   │   ├── dto/AuthResponse.java
│   │   │   ├── dto/RefreshRequest.java
│   │   │   ├── dto/ForgotPasswordRequest.java
│   │   │   ├── dto/ConfirmResetRequest.java
│   │   │   ├── dto/VerifyEmailRequest.java
│   │   │   ├── dto/UpdateProfileRequest.java
│   │   │   ├── dto/UserProfileResponse.java
│   │   │   └── entity/User.java
│   │   ├── analytics/
│   │   │   ├── controller/AnalyticsController.java
│   │   │   ├── service/AnalyticsService.java
│   │   │   ├── repository/AnalyticsEventRepository.java
│   │   │   ├── dto/AnalyticsEventRequest.java
│   │   │   ├── dto/AnalyticsEventResponse.java
│   │   │   ├── dto/BatchAnalyticsRequest.java
│   │   │   └── entity/AnalyticsEvent.java
│   │   ├── crashreporting/
│   │   │   ├── controller/CrashReportController.java
│   │   │   ├── service/CrashReportService.java
│   │   │   ├── repository/CrashReportRepository.java
│   │   │   ├── dto/CrashReportRequest.java
│   │   │   ├── dto/CrashReportResponse.java
│   │   │   └── entity/CrashReport.java
│   │   ├── notifications/
│   │   │   ├── controller/NotificationController.java
│   │   │   ├── service/NotificationService.java
│   │   │   ├── repository/DeviceTokenRepository.java
│   │   │   ├── repository/NotificationHistoryRepository.java
│   │   │   ├── dto/RegisterTokenRequest.java
│   │   │   ├── dto/SendNotificationRequest.java
│   │   │   ├── dto/NotificationHistoryResponse.java
│   │   │   ├── entity/DeviceToken.java
│   │   │   └── entity/NotificationHistory.java
│   │   ├── resources/
│   │   │   ├── controller/TaskController.java
│   │   │   ├── service/TaskService.java
│   │   │   ├── repository/TaskRepository.java
│   │   │   ├── dto/TaskRequest.java
│   │   │   ├── dto/TaskResponse.java
│   │   │   └── entity/Task.java
│   │   ├── i18n/
│   │   │   ├── controller/I18nController.java
│   │   │   ├── service/I18nService.java
│   │   │   ├── repository/TranslationRepository.java
│   │   │   ├── dto/TranslationResponse.java
│   │   │   └── entity/Translation.java
│   │   └── sync/
│   │       ├── controller/SyncController.java
│   │       ├── service/SyncService.java
│   │       ├── repository/SyncRecordRepository.java
│   │       ├── dto/SyncPushRequest.java
│   │       ├── dto/SyncPushResponse.java
│   │       ├── dto/SyncPullResponse.java
│   │       └── entity/SyncRecord.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/
│       ├── V1__create_users_table.sql
│       ├── V2__create_analytics_events_table.sql
│       ├── V3__create_crash_reports_table.sql
│       ├── V4__create_notifications_tables.sql
│       ├── V5__create_tasks_table.sql
│       ├── V6__create_translations_table.sql
│       ├── V7__create_sync_records_table.sql
│       └── V8__seed_translations.sql
├── src/test/java/com/revocare/starterkit/
│   ├── StarterKitApplicationTests.java
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── controller/AuthControllerTest.java
│   │   │   └── service/AuthServiceTest.java
│   │   ├── analytics/
│   │   │   ├── controller/AnalyticsControllerTest.java
│   │   │   └── service/AnalyticsServiceTest.java
│   │   ├── crashreporting/
│   │   │   ├── controller/CrashReportControllerTest.java
│   │   │   └── service/CrashReportServiceTest.java
│   │   ├── notifications/
│   │   │   ├── controller/NotificationControllerTest.java
│   │   │   └── service/NotificationServiceTest.java
│   │   ├── resources/
│   │   │   ├── controller/TaskControllerTest.java
│   │   │   └── service/TaskServiceTest.java
│   │   ├── i18n/
│   │   │   ├── controller/I18nControllerTest.java
│   │   │   └── service/I18nServiceTest.java
│   │   └── sync/
│   │       ├── controller/SyncControllerTest.java
│   │       └── service/SyncServiceTest.java
│   └── config/
│       └── GlobalExceptionHandlerTest.java
└── scripts/
    └── init-localstack.sh
```

---

## Chunk 1: Project Bootstrap & Infrastructure

### Task 1: Initialize Maven Project

**Files:**
- Create: `pom.xml`
- Create: `src/main/java/com/revocare/starterkit/StarterKitApplication.java`
- Create: `.gitignore`

- [ ] **Step 1: Create the project directory, initialize git, and generate Maven wrapper**

```bash
mkdir -p D:/revocare/repository/react-native-expo-starter-kit-backend
cd D:/revocare/repository/react-native-expo-starter-kit-backend
git init
mvn wrapper:wrapper -Dmaven=3.9.9
```

Note: If `mvn` is not installed globally, download the Maven wrapper files manually from https://maven.apache.org/wrapper/ or use `mvn -N wrapper:wrapper`.

- [ ] **Step 2: Create `.gitignore`**

```gitignore
# Maven
target/

# IDE
.idea/
*.iml
.vscode/
.settings/
.project
.classpath

# OS
.DS_Store
Thumbs.db

# Environment
.env
*.log
```

- [ ] **Step 3: Create `pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.6</version>
        <relativePath/>
    </parent>

    <groupId>com.revocare</groupId>
    <artifactId>starter-kit-backend</artifactId>
    <version>0.1.0</version>
    <name>starter-kit-backend</name>
    <description>Backend for React Native Expo Starter Kit</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>

        <!-- Data -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- AWS SDK (Cognito) -->
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>cognitoidentityprovider</artifactId>
            <version>2.29.45</version>
        </dependency>
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>sns</artifactId>
            <version>2.29.45</version>
        </dependency>

        <!-- OpenAPI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.7.0</version>
        </dependency>

        <!-- Actuator -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Rate Limiting -->
        <dependency>
            <groupId>com.bucket4j</groupId>
            <artifactId>bucket4j-core</artifactId>
            <version>8.14.0</version>
        </dependency>

        <!-- Cache (for rate limit bucket eviction) -->
        <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 4: Create `StarterKitApplication.java`**

```java
// src/main/java/com/revocare/starterkit/StarterKitApplication.java
package com.revocare.starterkit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StarterKitApplication {
    public static void main(String[] args) {
        SpringApplication.run(StarterKitApplication.class, args);
    }
}
```

- [ ] **Step 5: Create `application.yml`**

```yaml
# src/main/resources/application.yml
spring:
  application:
    name: starter-kit-backend
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:starterkit}
    username: ${DB_USER:starterkit}
    password: ${DB_PASSWORD:starterkit}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${COGNITO_ISSUER_URI:http://localhost:4566}

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info

springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
```

- [ ] **Step 6: Create `application-dev.yml`**

```yaml
# src/main/resources/application-dev.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          # Dev profile uses a symmetric key for JWT validation
          # instead of Cognito JWKS (LocalStack limitations)
          issuer-uri: http://localhost:4566

# Dev-specific: disable JWKS validation, use permissive JWT decoder
app:
  security:
    dev-mode: true
    jwt-secret: dev-secret-key-for-local-testing-only-32chars!

logging:
  level:
    com.revocare: DEBUG
    org.springframework.web: DEBUG
```

- [ ] **Step 7: Create `application-prod.yml`**

```yaml
# src/main/resources/application-prod.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${COGNITO_ISSUER_URI}
          jwk-set-uri: ${COGNITO_JWKS_URI}

app:
  security:
    dev-mode: false

logging:
  level:
    com.revocare: INFO
```

- [ ] **Step 8: Create basic test**

```java
// src/test/java/com/revocare/starterkit/StarterKitApplicationTests.java
package com.revocare.starterkit;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class StarterKitApplicationTests {
    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 9: Create test application properties**

```yaml
# src/test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
  flyway:
    enabled: false
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://test-issuer.example.com

app:
  security:
    dev-mode: true
    jwt-secret: test-secret-key-for-unit-testing-only-32chars!
```

**Note:** H2 in PostgreSQL mode has limited JSONB support. Unit tests use Mockito (no DB), so this is only used for `@SpringBootTest` context loading. If JSONB issues arise in integration tests, consider using Testcontainers with PostgreSQL instead.

- [ ] **Step 10: Verify build compiles**

Run: `cd D:/revocare/repository/react-native-expo-starter-kit-backend && mvnw.cmd compile` (or `./mvnw compile` on Unix)
Expected: BUILD SUCCESS

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: initialize Spring Boot project with Maven and core dependencies"
```

---

### Task 2: Docker Compose & Dockerfile

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `scripts/init-localstack.sh`

- [ ] **Step 1: Create `Dockerfile`**

```dockerfile
# Dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: starterkit
      POSTGRES_USER: starterkit
      POSTGRES_PASSWORD: starterkit
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U starterkit"]
      interval: 5s
      timeout: 5s
      retries: 5

  localstack:
    image: localstack/localstack:3.8
    ports:
      - "4566:4566"
    environment:
      SERVICES: cognito-idp,sns
      DEFAULT_REGION: us-east-1
    volumes:
      - ./scripts/init-localstack.sh:/etc/localstack/init/ready.d/init.sh

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: starterkit
      DB_USER: starterkit
      DB_PASSWORD: starterkit
      COGNITO_ISSUER_URI: http://localstack:4566
      AWS_REGION: us-east-1
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      LOCALSTACK_ENDPOINT: http://localstack:4566
    depends_on:
      db:
        condition: service_healthy
      localstack:
        condition: service_started

volumes:
  pgdata:
```

- [ ] **Step 3: Create `scripts/init-localstack.sh`**

```bash
#!/bin/bash
# scripts/init-localstack.sh
# Creates Cognito resources in LocalStack on startup

echo "Creating Cognito User Pool..."
USER_POOL_ID=$(awslocal cognito-idp create-user-pool \
  --pool-name starter-kit-pool \
  --auto-verified-attributes email \
  --username-attributes email \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":false}}' \
  --query 'UserPool.Id' --output text)

echo "User Pool ID: $USER_POOL_ID"

echo "Creating App Client..."
CLIENT_ID=$(awslocal cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name starter-kit-client \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --no-generate-secret \
  --query 'UserPoolClient.ClientId' --output text)

echo "App Client ID: $CLIENT_ID"

echo "Creating SNS Platform Application..."
awslocal sns create-platform-application \
  --name starter-kit-push \
  --platform GCM \
  --attributes PlatformCredential=fake-api-key

# Write config for the app to pick up
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID" > /tmp/localstack-config.env
echo "COGNITO_CLIENT_ID=$CLIENT_ID" >> /tmp/localstack-config.env

echo "LocalStack initialization complete!"
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
```

- [ ] **Step 4: Make init script executable and verify docker-compose syntax**

Run: `cd D:/revocare/repository/react-native-expo-starter-kit-backend && docker compose config`
Expected: Valid YAML output, no errors

- [ ] **Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml scripts/init-localstack.sh
git commit -m "feat: add Docker Compose with PostgreSQL, LocalStack, and Spring Boot"
```

---

### Task 3: Common Layer (BaseEntity, DTOs, Exceptions)

**Files:**
- Create: `src/main/java/com/revocare/starterkit/common/entity/BaseEntity.java`
- Create: `src/main/java/com/revocare/starterkit/common/dto/ApiErrorResponse.java`
- Create: `src/main/java/com/revocare/starterkit/common/dto/PagedResponse.java`
- Create: `src/main/java/com/revocare/starterkit/common/exception/ResourceNotFoundException.java`
- Create: `src/main/java/com/revocare/starterkit/common/exception/ForbiddenException.java`
- Create: `src/main/java/com/revocare/starterkit/common/exception/RateLimitExceededException.java`

- [ ] **Step 1: Create `BaseEntity.java`**

```java
// src/main/java/com/revocare/starterkit/common/entity/BaseEntity.java
package com.revocare.starterkit.common.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
```

- [ ] **Step 2: Create `ApiErrorResponse.java`**

```java
// src/main/java/com/revocare/starterkit/common/dto/ApiErrorResponse.java
package com.revocare.starterkit.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
    int status,
    String error,
    String message,
    Instant timestamp,
    String path,
    List<FieldError> fieldErrors
) {
    public record FieldError(String field, String message) {}

    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(status, error, message, Instant.now(), path, null);
    }

    public static ApiErrorResponse withFieldErrors(int status, String error, String message, String path, List<FieldError> fieldErrors) {
        return new ApiErrorResponse(status, error, message, Instant.now(), path, fieldErrors);
    }
}
```

- [ ] **Step 3: Create `PagedResponse.java`**

```java
// src/main/java/com/revocare/starterkit/common/dto/PagedResponse.java
package com.revocare.starterkit.common.dto;

import java.util.List;

public record PagedResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static <T> PagedResponse<T> from(org.springframework.data.domain.Page<T> page) {
        return new PagedResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
}
```

- [ ] **Step 4: Create exception classes**

```java
// src/main/java/com/revocare/starterkit/common/exception/ResourceNotFoundException.java
package com.revocare.starterkit.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found with id: " + id);
    }
}
```

```java
// src/main/java/com/revocare/starterkit/common/exception/ForbiddenException.java
package com.revocare.starterkit.common.exception;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
```

```java
// src/main/java/com/revocare/starterkit/common/exception/RateLimitExceededException.java
package com.revocare.starterkit.common.exception;

public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException() {
        super("Rate limit exceeded. Please try again later.");
    }
}
```

- [ ] **Step 5: Verify build**

Run: `mvnw.cmd compile`
Expected: BUILD SUCCESS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/com/revocare/starterkit/common/
git commit -m "feat: add common layer with BaseEntity, DTOs, and exceptions"
```

---

### Task 4: Global Exception Handler & Config

**Files:**
- Create: `src/main/java/com/revocare/starterkit/config/GlobalExceptionHandler.java`
- Create: `src/main/java/com/revocare/starterkit/config/CorsConfig.java`
- Create: `src/main/java/com/revocare/starterkit/config/OpenApiConfig.java`
- Create: `src/main/java/com/revocare/starterkit/config/SecurityConfig.java`
- Create: `src/main/java/com/revocare/starterkit/config/RateLimitConfig.java`
- Test: `src/test/java/com/revocare/starterkit/config/GlobalExceptionHandlerTest.java`

- [ ] **Step 1: Create `GlobalExceptionHandler.java`**

```java
// src/main/java/com/revocare/starterkit/config/GlobalExceptionHandler.java
package com.revocare.starterkit.config;

import com.revocare.starterkit.common.dto.ApiErrorResponse;
import com.revocare.starterkit.common.exception.ForbiddenException;
import com.revocare.starterkit.common.exception.RateLimitExceededException;
import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiErrorResponse.of(404, "Not Found", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiErrorResponse> handleForbidden(ForbiddenException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiErrorResponse.of(403, "Forbidden", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleRateLimit(RateLimitExceededException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(ApiErrorResponse.of(429, "Too Many Requests", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ApiErrorResponse.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> new ApiErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
            .toList();
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ApiErrorResponse.withFieldErrors(422, "Validation Error", "Validation failed", request.getRequestURI(), fieldErrors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneral(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiErrorResponse.of(500, "Internal Server Error", "An unexpected error occurred", request.getRequestURI()));
    }
}
```

- [ ] **Step 2: Create `CorsConfig.java`**

```java
// src/main/java/com/revocare/starterkit/config/CorsConfig.java
package com.revocare.starterkit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

- [ ] **Step 3: Create `SecurityConfig.java`**

```java
// src/main/java/com/revocare/starterkit/config/SecurityConfig.java
package com.revocare.starterkit.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.security.dev-mode:false}")
    private boolean devMode;

    @Value("${app.security.jwt-secret:}")
    private String jwtSecret;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;

    private final CorsConfigurationSource corsConfigurationSource;
    private final OncePerRequestFilter rateLimitFilter;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource,
                          @org.springframework.beans.factory.annotation.Qualifier("rateLimitFilter") OncePerRequestFilter rateLimitFilter) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterAfter(rateLimitFilter,
                org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/api/auth/forgot-password",
                    "/api/auth/confirm-reset",
                    "/api/auth/verify-email",
                    "/api/i18n/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/actuator/health"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        if (devMode && !jwtSecret.isEmpty()) {
            // Dev mode: use symmetric key for testing
            SecretKeySpec key = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
            return NimbusJwtDecoder.withSecretKey(key).build();
        }
        // Production: use JWKS endpoint from Cognito
        if (!jwkSetUri.isEmpty()) {
            return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        }
        // Fallback: use issuer URI to discover JWKS
        return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
    }
}
```

- [ ] **Step 4: Create `OpenApiConfig.java`**

```java
// src/main/java/com/revocare/starterkit/config/OpenApiConfig.java
package com.revocare.starterkit.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Starter Kit Backend API")
                .version("0.1.0")
                .description("Backend API for React Native Expo Starter Kit"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer"))
            .components(new Components()
                .addSecuritySchemes("Bearer", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}
```

- [ ] **Step 5: Create `RateLimitConfig.java`**

```java
// src/main/java/com/revocare/starterkit/config/RateLimitConfig.java
package com.revocare.starterkit.config;

import com.revocare.starterkit.common.exception.RateLimitExceededException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
public class RateLimitConfig {

    // Caffeine cache with 5-minute TTL to prevent unbounded growth
    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .maximumSize(10_000)
        .build();

    /**
     * Rate limit filter bean. Must be registered AFTER Spring Security
     * filter chain so that SecurityContext is populated.
     * Register in SecurityConfig: http.addFilterAfter(rateLimitFilter, BearerTokenAuthenticationFilter.class)
     */
    @Bean
    public OncePerRequestFilter rateLimitFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                    throws ServletException, IOException {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                    chain.doFilter(request, response);
                    return;
                }

                String userId = auth.getName();
                String path = request.getRequestURI();
                String method = request.getMethod();
                int limit = resolveLimit(path, method);

                // Normalize path to pattern for consistent bucketing
                String normalizedPath = normalizePath(path);
                String bucketKey = userId + ":" + normalizedPath + ":" + method;
                Bucket bucket = buckets.get(bucketKey, k -> Bucket.builder()
                    .addLimit(Bandwidth.simple(limit, Duration.ofMinutes(1)))
                    .build());

                ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
                if (probe.isConsumed()) {
                    response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
                    response.setHeader("X-RateLimit-Reset", String.valueOf(
                        TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill())));
                    chain.doFilter(request, response);
                } else {
                    response.setHeader("X-RateLimit-Reset", String.valueOf(
                        TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill())));
                    throw new RateLimitExceededException();
                }
            }

            private String normalizePath(String path) {
                // Normalize UUID segments to pattern: /api/tasks/123e4567... -> /api/tasks/{id}
                return path.replaceAll("/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", "/{id}");
            }

            private int resolveLimit(String path, String method) {
                if (path.startsWith("/api/notifications/send") && "POST".equals(method)) return 10;
                if (path.startsWith("/api/analytics/events/batch") && "POST".equals(method)) return 30;
                if (path.equals("/api/crash-reports") && "POST".equals(method)) return 30;
                if (path.startsWith("/api/sync/push") && "POST".equals(method)) return 30;
                return 100;
            }
        };
    }
}
```

- [ ] **Step 6: Write test for GlobalExceptionHandler**

```java
// src/test/java/com/revocare/starterkit/config/GlobalExceptionHandlerTest.java
package com.revocare.starterkit.config;

import com.revocare.starterkit.common.exception.ForbiddenException;
import com.revocare.starterkit.common.exception.RateLimitExceededException;
import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    // Test controller to trigger exceptions — defined as inner class for test isolation
    @RestController
    static class TestExceptionController {
        @GetMapping("/test/not-found")
        public void notFound() { throw new ResourceNotFoundException("Item", 1); }

        @GetMapping("/test/forbidden")
        public void forbidden() { throw new ForbiddenException("Access denied"); }

        @GetMapping("/test/rate-limit")
        public void rateLimit() { throw new RateLimitExceededException(); }
    }

    @Test
    void notFoundReturns404() throws Exception {
        mockMvc.perform(get("/test/not-found").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void forbiddenReturns403() throws Exception {
        mockMvc.perform(get("/test/forbidden").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    void rateLimitReturns429() throws Exception {
        mockMvc.perform(get("/test/rate-limit").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.status").value(429));
    }
}
```

- [ ] **Step 7: Run tests**

Run: `mvnw.cmd test`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/revocare/starterkit/config/ src/test/java/com/revocare/starterkit/config/
git commit -m "feat: add security config, CORS, OpenAPI, rate limiting, and exception handling"
```

---

### Task 5: Flyway Database Migrations

**Files:**
- Create: `src/main/resources/db/migration/V1__create_users_table.sql`
- Create: `src/main/resources/db/migration/V2__create_analytics_events_table.sql`
- Create: `src/main/resources/db/migration/V3__create_crash_reports_table.sql`
- Create: `src/main/resources/db/migration/V4__create_notifications_tables.sql`
- Create: `src/main/resources/db/migration/V5__create_tasks_table.sql`
- Create: `src/main/resources/db/migration/V6__create_translations_table.sql`
- Create: `src/main/resources/db/migration/V7__create_sync_records_table.sql`
- Create: `src/main/resources/db/migration/V8__seed_translations.sql`

- [ ] **Step 1: Create V1 — users table**

```sql
-- src/main/resources/db/migration/V1__create_users_table.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cognito_sub VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 2: Create V2 — analytics_events table**

```sql
-- src/main/resources/db/migration/V2__create_analytics_events_table.sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100),
    properties JSONB,
    screen_name VARCHAR(255),
    session_id VARCHAR(255),
    device_info JSONB,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_timestamp ON analytics_events(user_id, timestamp);
```

- [ ] **Step 3: Create V3 — crash_reports table**

```sql
-- src/main/resources/db/migration/V3__create_crash_reports_table.sql
CREATE TABLE crash_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    error_message VARCHAR(1000) NOT NULL,
    stack_trace TEXT,
    breadcrumbs JSONB,
    context JSONB,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('fatal', 'error', 'warning')),
    app_version VARCHAR(50),
    device_info JSONB,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crash_reports_user_created ON crash_reports(user_id, created_at);
```

- [ ] **Step 4: Create V4 — notifications tables**

```sql
-- src/main/resources/db/migration/V4__create_notifications_tables.sql
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, token)
);

CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);

CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_history_user_created ON notification_history(user_id, created_at);
```

- [ ] **Step 5: Create V5 — tasks table**

```sql
-- src/main/resources/db/migration/V5__create_tasks_table.sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

- [ ] **Step 6: Create V6 — translations table**

```sql
-- src/main/resources/db/migration/V6__create_translations_table.sql
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locale VARCHAR(10) NOT NULL,
    namespace VARCHAR(100) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (locale, namespace, key)
);
```

- [ ] **Step 7: Create V7 — sync_records table**

```sql
-- src/main/resources/db/migration/V7__create_sync_records_table.sql
CREATE TABLE sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_key VARCHAR(255) NOT NULL,
    value JSONB,
    version BIGINT NOT NULL DEFAULT 1,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, store_key)
);

CREATE INDEX idx_sync_records_user_version ON sync_records(user_id, version);
```

- [ ] **Step 8: Create V8 — seed translations**

```sql
-- src/main/resources/db/migration/V8__seed_translations.sql
-- English translations
INSERT INTO translations (locale, namespace, key, value) VALUES
('en', 'common', 'app.name', 'Starter Kit'),
('en', 'common', 'welcome', 'Welcome'),
('en', 'common', 'loading', 'Loading...'),
('en', 'common', 'error', 'Something went wrong'),
('en', 'common', 'retry', 'Retry'),
('en', 'common', 'cancel', 'Cancel'),
('en', 'common', 'save', 'Save'),
('en', 'common', 'delete', 'Delete'),
('en', 'auth', 'login', 'Sign In'),
('en', 'auth', 'register', 'Sign Up'),
('en', 'auth', 'logout', 'Sign Out'),
('en', 'auth', 'email', 'Email'),
('en', 'auth', 'password', 'Password'),
('en', 'auth', 'forgot_password', 'Forgot Password?'),
('en', 'tasks', 'title', 'Tasks'),
('en', 'tasks', 'add', 'Add Task'),
('en', 'tasks', 'status.todo', 'To Do'),
('en', 'tasks', 'status.in_progress', 'In Progress'),
('en', 'tasks', 'status.done', 'Done');

-- Spanish translations
INSERT INTO translations (locale, namespace, key, value) VALUES
('es', 'common', 'app.name', 'Kit de Inicio'),
('es', 'common', 'welcome', 'Bienvenido'),
('es', 'common', 'loading', 'Cargando...'),
('es', 'common', 'error', 'Algo salió mal'),
('es', 'common', 'retry', 'Reintentar'),
('es', 'common', 'cancel', 'Cancelar'),
('es', 'common', 'save', 'Guardar'),
('es', 'common', 'delete', 'Eliminar'),
('es', 'auth', 'login', 'Iniciar Sesión'),
('es', 'auth', 'register', 'Registrarse'),
('es', 'auth', 'logout', 'Cerrar Sesión'),
('es', 'auth', 'email', 'Correo Electrónico'),
('es', 'auth', 'password', 'Contraseña'),
('es', 'auth', 'forgot_password', '¿Olvidaste tu contraseña?'),
('es', 'tasks', 'title', 'Tareas'),
('es', 'tasks', 'add', 'Agregar Tarea'),
('es', 'tasks', 'status.todo', 'Por Hacer'),
('es', 'tasks', 'status.in_progress', 'En Progreso'),
('es', 'tasks', 'status.done', 'Completado');
```

- [ ] **Step 9: Verify build**

Run: `mvnw.cmd compile`
Expected: BUILD SUCCESS

- [ ] **Step 10: Commit**

```bash
git add src/main/resources/db/
git commit -m "feat: add Flyway migrations for all 7 module tables with indexes and seed data"
```

---

## Chunk 2: Auth Module

### Task 6: Auth Entity & Repository

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/auth/entity/User.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/repository/UserRepository.java`

- [ ] **Step 1: Create `User.java`**

```java
// src/main/java/com/revocare/starterkit/modules/auth/entity/User.java
package com.revocare.starterkit.modules.auth.entity;

import com.revocare.starterkit.common.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "cognito_sub", nullable = false, unique = true)
    private String cognitoSub;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    public User() {}

    public User(String cognitoSub, String email) {
        this.cognitoSub = cognitoSub;
        this.email = email;
    }

    public String getCognitoSub() { return cognitoSub; }
    public void setCognitoSub(String cognitoSub) { this.cognitoSub = cognitoSub; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
```

- [ ] **Step 2: Create `UserRepository.java`**

```java
// src/main/java/com/revocare/starterkit/modules/auth/repository/UserRepository.java
package com.revocare.starterkit.modules.auth.repository;

import com.revocare.starterkit.modules.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByCognitoSub(String cognitoSub);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

- [ ] **Step 3: Verify build**

Run: `mvnw.cmd compile`
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
git add src/main/java/com/revocare/starterkit/modules/auth/
git commit -m "feat: add User entity and repository"
```

---

### Task 7: Auth DTOs

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/RegisterRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/LoginRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/AuthResponse.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/RefreshRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/ForgotPasswordRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/ConfirmResetRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/VerifyEmailRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/UpdateProfileRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/dto/UserProfileResponse.java`

- [ ] **Step 1: Create all auth DTOs**

```java
// RegisterRequest.java
package com.revocare.starterkit.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password,
    String displayName
) {}
```

```java
// LoginRequest.java
package com.revocare.starterkit.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
```

```java
// AuthResponse.java
package com.revocare.starterkit.modules.auth.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String idToken,
    int expiresIn
) {}
```

```java
// RefreshRequest.java
package com.revocare.starterkit.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank String refreshToken) {}
```

```java
// ForgotPasswordRequest.java
package com.revocare.starterkit.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(@NotBlank @Email String email) {}
```

```java
// ConfirmResetRequest.java
package com.revocare.starterkit.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmResetRequest(
    @NotBlank @Email String email,
    @NotBlank String code,
    @NotBlank @Size(min = 8) String newPassword
) {}
```

```java
// VerifyEmailRequest.java
package com.revocare.starterkit.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(
    @NotBlank @Email String email,
    @NotBlank String code
) {}
```

```java
// UpdateProfileRequest.java
package com.revocare.starterkit.modules.auth.dto;

public record UpdateProfileRequest(
    String displayName,
    String avatarUrl
) {}
```

```java
// UserProfileResponse.java
package com.revocare.starterkit.modules.auth.dto;

import com.revocare.starterkit.modules.auth.entity.User;
import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String email,
    String displayName,
    String avatarUrl,
    Instant createdAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getCreatedAt()
        );
    }
}
```

- [ ] **Step 2: Verify build**

Run: `mvnw.cmd compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/revocare/starterkit/modules/auth/dto/
git commit -m "feat: add auth DTOs with validation"
```

---

### Task 8: Cognito Service

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/auth/service/CognitoService.java`
- Test: `src/test/java/com/revocare/starterkit/modules/auth/service/CognitoServiceTest.java`

- [ ] **Step 1: Create `CognitoService.java`**

```java
// src/main/java/com/revocare/starterkit/modules/auth/service/CognitoService.java
package com.revocare.starterkit.modules.auth.service;

import com.revocare.starterkit.modules.auth.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.net.URI;
import java.util.Map;

@Service
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;
    private final String userPoolId;
    private final String clientId;

    public CognitoService(
            @Value("${aws.cognito.user-pool-id:}") String userPoolId,
            @Value("${aws.cognito.client-id:}") String clientId,
            @Value("${aws.region:us-east-1}") String region,
            @Value("${localstack.endpoint:}") String localstackEndpoint) {

        this.userPoolId = userPoolId;
        this.clientId = clientId;

        var builder = CognitoIdentityProviderClient.builder()
            .region(Region.of(region));

        if (!localstackEndpoint.isEmpty()) {
            builder.endpointOverride(URI.create(localstackEndpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create("test", "test")));
        }

        this.cognitoClient = builder.build();
    }

    public SignUpResponse register(String email, String password) {
        return cognitoClient.signUp(SignUpRequest.builder()
            .clientId(clientId)
            .username(email)
            .password(password)
            .userAttributes(
                AttributeType.builder().name("email").value(email).build()
            )
            .build());
    }

    public void confirmEmail(String email, String code) {
        cognitoClient.confirmSignUp(ConfirmSignUpRequest.builder()
            .clientId(clientId)
            .username(email)
            .confirmationCode(code)
            .build());
    }

    public AuthResponse login(String email, String password) {
        InitiateAuthResponse response = cognitoClient.initiateAuth(InitiateAuthRequest.builder()
            .authFlow(AuthFlowType.USER_PASSWORD_AUTH)
            .clientId(clientId)
            .authParameters(Map.of(
                "USERNAME", email,
                "PASSWORD", password
            ))
            .build());

        AuthenticationResultType result = response.authenticationResult();
        return new AuthResponse(
            result.accessToken(),
            result.refreshToken(),
            result.idToken(),
            result.expiresIn()
        );
    }

    public AuthResponse refreshToken(String refreshToken) {
        InitiateAuthResponse response = cognitoClient.initiateAuth(InitiateAuthRequest.builder()
            .authFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
            .clientId(clientId)
            .authParameters(Map.of("REFRESH_TOKEN", refreshToken))
            .build());

        AuthenticationResultType result = response.authenticationResult();
        return new AuthResponse(
            result.accessToken(),
            null,
            result.idToken(),
            result.expiresIn()
        );
    }

    public void forgotPassword(String email) {
        cognitoClient.forgotPassword(ForgotPasswordRequest.builder()
            .clientId(clientId)
            .username(email)
            .build());
    }

    public void confirmForgotPassword(String email, String code, String newPassword) {
        cognitoClient.confirmForgotPassword(ConfirmForgotPasswordRequest.builder()
            .clientId(clientId)
            .username(email)
            .confirmationCode(code)
            .password(newPassword)
            .build());
    }

    public void globalSignOut(String accessToken) {
        cognitoClient.globalSignOut(GlobalSignOutRequest.builder()
            .accessToken(accessToken)
            .build());
    }

    public void deleteUser(String accessToken) {
        cognitoClient.deleteUser(DeleteUserRequest.builder()
            .accessToken(accessToken)
            .build());
    }

    public String getUserSub(String accessToken) {
        GetUserResponse response = cognitoClient.getUser(GetUserRequest.builder()
            .accessToken(accessToken)
            .build());
        return response.userAttributes().stream()
            .filter(attr -> "sub".equals(attr.name()))
            .findFirst()
            .map(AttributeType::value)
            .orElseThrow(() -> new RuntimeException("Could not get user sub from Cognito"));
    }
}
```

- [ ] **Step 2: Verify build**

Run: `mvnw.cmd compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add src/main/java/com/revocare/starterkit/modules/auth/service/CognitoService.java
git commit -m "feat: add CognitoService for AWS Cognito integration"
```

---

### Task 9: Auth Service & Controller

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/auth/service/AuthService.java`
- Create: `src/main/java/com/revocare/starterkit/modules/auth/controller/AuthController.java`
- Test: `src/test/java/com/revocare/starterkit/modules/auth/service/AuthServiceTest.java`
- Test: `src/test/java/com/revocare/starterkit/modules/auth/controller/AuthControllerTest.java`

- [ ] **Step 1: Create `AuthService.java`**

```java
// src/main/java/com/revocare/starterkit/modules/auth/service/AuthService.java
package com.revocare.starterkit.modules.auth.service;

import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import com.revocare.starterkit.modules.auth.dto.*;
import com.revocare.starterkit.modules.auth.entity.User;
import com.revocare.starterkit.modules.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final CognitoService cognitoService;
    private final UserRepository userRepository;

    public AuthService(CognitoService cognitoService, UserRepository userRepository) {
        this.cognitoService = cognitoService;
        this.userRepository = userRepository;
    }

    @Transactional
    public void register(RegisterRequest request) {
        var response = cognitoService.register(request.email(), request.password());
        User user = new User(response.userSub(), request.email());
        user.setDisplayName(request.displayName());
        userRepository.save(user);
    }

    public void verifyEmail(VerifyEmailRequest request) {
        cognitoService.confirmEmail(request.email(), request.code());
    }

    public AuthResponse login(LoginRequest request) {
        return cognitoService.login(request.email(), request.password());
    }

    public AuthResponse refresh(RefreshRequest request) {
        return cognitoService.refreshToken(request.refreshToken());
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        cognitoService.forgotPassword(request.email());
    }

    public void confirmReset(ConfirmResetRequest request) {
        cognitoService.confirmForgotPassword(request.email(), request.code(), request.newPassword());
    }

    public void logout(String accessToken) {
        cognitoService.globalSignOut(accessToken);
    }

    public UserProfileResponse getProfile(String cognitoSub) {
        User user = userRepository.findByCognitoSub(cognitoSub)
            .orElseThrow(() -> new ResourceNotFoundException("User", cognitoSub));
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String cognitoSub, UpdateProfileRequest request) {
        User user = userRepository.findByCognitoSub(cognitoSub)
            .orElseThrow(() -> new ResourceNotFoundException("User", cognitoSub));
        if (request.displayName() != null) user.setDisplayName(request.displayName());
        if (request.avatarUrl() != null) user.setAvatarUrl(request.avatarUrl());
        return UserProfileResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteAccount(String cognitoSub, String accessToken) {
        cognitoService.deleteUser(accessToken);
        userRepository.findByCognitoSub(cognitoSub)
            .ifPresent(userRepository::delete);
    }

    /**
     * Resolve internal user ID from Cognito sub.
     * Used by other modules to avoid cross-module repository access.
     */
    public UUID getUserIdByCognitoSub(String cognitoSub) {
        return userRepository.findByCognitoSub(cognitoSub)
            .orElseThrow(() -> new ResourceNotFoundException("User", cognitoSub))
            .getId();
    }
}
```

- [ ] **Step 2: Create `AuthController.java`**

```java
// src/main/java/com/revocare/starterkit/modules/auth/controller/AuthController.java
package com.revocare.starterkit.modules.auth.controller;

import com.revocare.starterkit.modules.auth.dto.*;
import com.revocare.starterkit.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm-reset")
    public ResponseEntity<Void> confirmReset(@Valid @RequestBody ConfirmResetRequest request) {
        authService.confirmReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Jwt jwt) {
        authService.logout(jwt.getTokenValue());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(authService.getProfile(jwt.getSubject()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(jwt.getSubject(), request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal Jwt jwt) {
        authService.deleteAccount(jwt.getSubject(), jwt.getTokenValue());
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 3: Write `AuthServiceTest.java`**

```java
// src/test/java/com/revocare/starterkit/modules/auth/service/AuthServiceTest.java
package com.revocare.starterkit.modules.auth.service;

import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import com.revocare.starterkit.modules.auth.dto.*;
import com.revocare.starterkit.modules.auth.entity.User;
import com.revocare.starterkit.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private CognitoService cognitoService;
    @Mock private UserRepository userRepository;
    @InjectMocks private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("cognito-sub-123", "test@example.com");
        testUser.setDisplayName("Test User");
    }

    @Test
    void register_createsUserInDbAfterCognitoSignUp() {
        when(cognitoService.register("test@example.com", "Password1"))
            .thenReturn(SignUpResponse.builder().userSub("cognito-sub-123").build());
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        authService.register(new RegisterRequest("test@example.com", "Password1", "Test User"));

        verify(cognitoService).register("test@example.com", "Password1");
        verify(userRepository).save(argThat(user ->
            user.getCognitoSub().equals("cognito-sub-123") &&
            user.getEmail().equals("test@example.com")
        ));
    }

    @Test
    void login_delegatesToCognito() {
        AuthResponse expected = new AuthResponse("access", "refresh", "id", 3600);
        when(cognitoService.login("test@example.com", "Password1")).thenReturn(expected);

        AuthResponse result = authService.login(new LoginRequest("test@example.com", "Password1"));

        assertEquals(expected, result);
    }

    @Test
    void getProfile_returnsUserProfile() {
        when(userRepository.findByCognitoSub("cognito-sub-123")).thenReturn(Optional.of(testUser));

        UserProfileResponse profile = authService.getProfile("cognito-sub-123");

        assertEquals("test@example.com", profile.email());
        assertEquals("Test User", profile.displayName());
    }

    @Test
    void getProfile_throwsWhenNotFound() {
        when(userRepository.findByCognitoSub("nonexistent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getProfile("nonexistent"));
    }

    @Test
    void updateProfile_updatesFields() {
        when(userRepository.findByCognitoSub("cognito-sub-123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        authService.updateProfile("cognito-sub-123", new UpdateProfileRequest("New Name", null));

        assertEquals("New Name", testUser.getDisplayName());
    }

    @Test
    void deleteAccount_deletesBothCognitoAndDb() {
        when(userRepository.findByCognitoSub("cognito-sub-123")).thenReturn(Optional.of(testUser));

        authService.deleteAccount("cognito-sub-123", "access-token");

        verify(cognitoService).deleteUser("access-token");
        verify(userRepository).delete(testUser);
    }
}
```

- [ ] **Step 4: Run tests**

Run: `mvnw.cmd test -pl . -Dtest=AuthServiceTest`
Expected: All 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/main/java/com/revocare/starterkit/modules/auth/service/AuthService.java \
  src/main/java/com/revocare/starterkit/modules/auth/controller/AuthController.java \
  src/test/java/com/revocare/starterkit/modules/auth/
git commit -m "feat: add auth service and controller with Cognito integration"
```

---

## Chunk 3: Feature Modules (Analytics, Crash Reporting, Notifications)

### Task 10: Analytics Module

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/analytics/entity/AnalyticsEvent.java`
- Create: `src/main/java/com/revocare/starterkit/modules/analytics/repository/AnalyticsEventRepository.java`
- Create: `src/main/java/com/revocare/starterkit/modules/analytics/dto/AnalyticsEventRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/analytics/dto/AnalyticsEventResponse.java`
- Create: `src/main/java/com/revocare/starterkit/modules/analytics/dto/BatchAnalyticsRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/analytics/service/AnalyticsService.java`
- Create: `src/main/java/com/revocare/starterkit/modules/analytics/controller/AnalyticsController.java`
- Test: `src/test/java/com/revocare/starterkit/modules/analytics/service/AnalyticsServiceTest.java`

- [ ] **Step 1: Create `AnalyticsEvent.java` entity**

```java
// src/main/java/com/revocare/starterkit/modules/analytics/entity/AnalyticsEvent.java
package com.revocare.starterkit.modules.analytics.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "analytics_events")
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "event_category")
    private String eventCategory;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> properties;

    @Column(name = "screen_name")
    private String screenName;

    @Column(name = "session_id")
    private String sessionId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "device_info")
    private Map<String, Object> deviceInfo;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() { createdAt = Instant.now(); }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public String getEventCategory() { return eventCategory; }
    public void setEventCategory(String eventCategory) { this.eventCategory = eventCategory; }
    public Map<String, Object> getProperties() { return properties; }
    public void setProperties(Map<String, Object> properties) { this.properties = properties; }
    public String getScreenName() { return screenName; }
    public void setScreenName(String screenName) { this.screenName = screenName; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Map<String, Object> getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(Map<String, Object> deviceInfo) { this.deviceInfo = deviceInfo; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public Instant getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 2: Create repository**

```java
// src/main/java/com/revocare/starterkit/modules/analytics/repository/AnalyticsEventRepository.java
package com.revocare.starterkit.modules.analytics.repository;

import com.revocare.starterkit.modules.analytics.entity.AnalyticsEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, UUID> {

    @Query("SELECT e FROM AnalyticsEvent e WHERE e.userId = :userId " +
           "AND (:eventName IS NULL OR e.eventName = :eventName) " +
           "AND (:category IS NULL OR e.eventCategory = :category) " +
           "AND (:startDate IS NULL OR e.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR e.timestamp <= :endDate)")
    Page<AnalyticsEvent> findByFilters(
        @Param("userId") UUID userId,
        @Param("eventName") String eventName,
        @Param("category") String category,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate,
        Pageable pageable);
}
```

- [ ] **Step 3: Create DTOs**

```java
// AnalyticsEventRequest.java
package com.revocare.starterkit.modules.analytics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Map;

public record AnalyticsEventRequest(
    @NotBlank String eventName,
    String eventCategory,
    Map<String, Object> properties,
    String screenName,
    String sessionId,
    Map<String, Object> deviceInfo,
    @NotNull Instant timestamp
) {}
```

```java
// BatchAnalyticsRequest.java
package com.revocare.starterkit.modules.analytics.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BatchAnalyticsRequest(
    @NotEmpty @Size(max = 100) List<@Valid AnalyticsEventRequest> events
) {}
```

```java
// AnalyticsEventResponse.java
package com.revocare.starterkit.modules.analytics.dto;

import com.revocare.starterkit.modules.analytics.entity.AnalyticsEvent;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AnalyticsEventResponse(
    UUID id,
    String eventName,
    String eventCategory,
    Map<String, Object> properties,
    String screenName,
    String sessionId,
    Map<String, Object> deviceInfo,
    Instant timestamp,
    Instant createdAt
) {
    public static AnalyticsEventResponse from(AnalyticsEvent event) {
        return new AnalyticsEventResponse(
            event.getId(), event.getEventName(), event.getEventCategory(),
            event.getProperties(), event.getScreenName(), event.getSessionId(),
            event.getDeviceInfo(), event.getTimestamp(), event.getCreatedAt()
        );
    }
}
```

- [ ] **Step 4: Create service**

```java
// src/main/java/com/revocare/starterkit/modules/analytics/service/AnalyticsService.java
package com.revocare.starterkit.modules.analytics.service;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.modules.analytics.dto.*;
import com.revocare.starterkit.modules.analytics.entity.AnalyticsEvent;
import com.revocare.starterkit.modules.analytics.repository.AnalyticsEventRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AnalyticsService {

    private final AnalyticsEventRepository repository;

    public AnalyticsService(AnalyticsEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public AnalyticsEventResponse createEvent(UUID userId, AnalyticsEventRequest request) {
        AnalyticsEvent event = mapToEntity(userId, request);
        return AnalyticsEventResponse.from(repository.save(event));
    }

    @Transactional
    public List<AnalyticsEventResponse> createBatch(UUID userId, BatchAnalyticsRequest request) {
        List<AnalyticsEvent> events = request.events().stream()
            .map(req -> mapToEntity(userId, req))
            .toList();
        return repository.saveAll(events).stream()
            .map(AnalyticsEventResponse::from)
            .toList();
    }

    public PagedResponse<AnalyticsEventResponse> getEvents(
            UUID userId, String eventName, String category,
            Instant startDate, Instant endDate, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        var result = repository.findByFilters(userId, eventName, category, startDate, endDate, pageable);
        return PagedResponse.from(result.map(AnalyticsEventResponse::from));
    }

    private AnalyticsEvent mapToEntity(UUID userId, AnalyticsEventRequest request) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setUserId(userId);
        event.setEventName(request.eventName());
        event.setEventCategory(request.eventCategory());
        event.setProperties(request.properties());
        event.setScreenName(request.screenName());
        event.setSessionId(request.sessionId());
        event.setDeviceInfo(request.deviceInfo());
        event.setTimestamp(request.timestamp());
        return event;
    }
}
```

- [ ] **Step 5: Create controller**

```java
// src/main/java/com/revocare/starterkit/modules/analytics/controller/AnalyticsController.java
package com.revocare.starterkit.modules.analytics.controller;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.modules.analytics.dto.*;
import com.revocare.starterkit.modules.analytics.service.AnalyticsService;
import com.revocare.starterkit.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AuthService authService;

    public AnalyticsController(AnalyticsService analyticsService, AuthService authService) {
        this.analyticsService = analyticsService;
        this.authService = authService;
    }

    @PostMapping("/events")
    public ResponseEntity<AnalyticsEventResponse> createEvent(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AnalyticsEventRequest request) {
        UUID userId = getUserId(jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(analyticsService.createEvent(userId, request));
    }

    @PostMapping("/events/batch")
    public ResponseEntity<List<AnalyticsEventResponse>> createBatch(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody BatchAnalyticsRequest request) {
        UUID userId = getUserId(jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(analyticsService.createBatch(userId, request));
    }

    @GetMapping("/events")
    public ResponseEntity<PagedResponse<AnalyticsEventResponse>> getEvents(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String eventName,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = getUserId(jwt);
        return ResponseEntity.ok(analyticsService.getEvents(userId, eventName, category, startDate, endDate, page, size));
    }

    private UUID getUserId(Jwt jwt) {
        return authService.getUserIdByCognitoSub(jwt.getSubject());
    }
}
```

- [ ] **Step 6: Write service test**

```java
// src/test/java/com/revocare/starterkit/modules/analytics/service/AnalyticsServiceTest.java
package com.revocare.starterkit.modules.analytics.service;

import com.revocare.starterkit.modules.analytics.dto.AnalyticsEventRequest;
import com.revocare.starterkit.modules.analytics.dto.AnalyticsEventResponse;
import com.revocare.starterkit.modules.analytics.dto.BatchAnalyticsRequest;
import com.revocare.starterkit.modules.analytics.entity.AnalyticsEvent;
import com.revocare.starterkit.modules.analytics.repository.AnalyticsEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock private AnalyticsEventRepository repository;
    @InjectMocks private AnalyticsService service;

    @Test
    void createEvent_savesAndReturnsResponse() {
        UUID userId = UUID.randomUUID();
        var request = new AnalyticsEventRequest("page_view", "navigation", null, "HomeScreen", null, null, Instant.now());

        when(repository.save(any(AnalyticsEvent.class))).thenAnswer(inv -> {
            AnalyticsEvent e = inv.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });

        AnalyticsEventResponse response = service.createEvent(userId, request);

        assertNotNull(response);
        assertEquals("page_view", response.eventName());
        verify(repository).save(any(AnalyticsEvent.class));
    }

    @Test
    void createBatch_savesAllEvents() {
        UUID userId = UUID.randomUUID();
        var req1 = new AnalyticsEventRequest("event1", null, null, null, null, null, Instant.now());
        var req2 = new AnalyticsEventRequest("event2", null, null, null, null, null, Instant.now());
        var batch = new BatchAnalyticsRequest(List.of(req1, req2));

        when(repository.saveAll(anyList())).thenAnswer(inv -> {
            List<AnalyticsEvent> events = inv.getArgument(0);
            events.forEach(e -> e.setId(UUID.randomUUID()));
            return events;
        });

        List<AnalyticsEventResponse> responses = service.createBatch(userId, batch);

        assertEquals(2, responses.size());
        verify(repository).saveAll(argThat(list -> ((List<?>) list).size() == 2));
    }
}
```

- [ ] **Step 7: Run tests**

Run: `mvnw.cmd test -Dtest=AnalyticsServiceTest`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add src/main/java/com/revocare/starterkit/modules/analytics/ \
  src/test/java/com/revocare/starterkit/modules/analytics/
git commit -m "feat: add analytics module with event ingestion and query endpoints"
```

---

### Task 11: Crash Reporting Module

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/crashreporting/entity/CrashReport.java`
- Create: `src/main/java/com/revocare/starterkit/modules/crashreporting/repository/CrashReportRepository.java`
- Create: `src/main/java/com/revocare/starterkit/modules/crashreporting/dto/CrashReportRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/crashreporting/dto/CrashReportResponse.java`
- Create: `src/main/java/com/revocare/starterkit/modules/crashreporting/service/CrashReportService.java`
- Create: `src/main/java/com/revocare/starterkit/modules/crashreporting/controller/CrashReportController.java`
- Test: `src/test/java/com/revocare/starterkit/modules/crashreporting/service/CrashReportServiceTest.java`

- [ ] **Step 1: Create `CrashReport.java` entity**

```java
package com.revocare.starterkit.modules.crashreporting.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "crash_reports")
public class CrashReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "error_message", nullable = false, length = 1000)
    private String errorMessage;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> breadcrumbs;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> context;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(name = "app_version", length = 50)
    private String appVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "device_info")
    private Map<String, Object> deviceInfo;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() { createdAt = Instant.now(); }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
    public List<Map<String, Object>> getBreadcrumbs() { return breadcrumbs; }
    public void setBreadcrumbs(List<Map<String, Object>> breadcrumbs) { this.breadcrumbs = breadcrumbs; }
    public Map<String, Object> getContext() { return context; }
    public void setContext(Map<String, Object> context) { this.context = context; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getAppVersion() { return appVersion; }
    public void setAppVersion(String appVersion) { this.appVersion = appVersion; }
    public Map<String, Object> getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(Map<String, Object> deviceInfo) { this.deviceInfo = deviceInfo; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public Instant getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 2: Create repository**

```java
package com.revocare.starterkit.modules.crashreporting.repository;

import com.revocare.starterkit.modules.crashreporting.entity.CrashReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CrashReportRepository extends JpaRepository<CrashReport, UUID> {
    Page<CrashReport> findByUserIdOrderByTimestampDesc(UUID userId, Pageable pageable);
    Optional<CrashReport> findByIdAndUserId(UUID id, UUID userId);
}
```

- [ ] **Step 3: Create DTOs**

```java
package com.revocare.starterkit.modules.crashreporting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record CrashReportRequest(
    @NotBlank String errorMessage,
    String stackTrace,
    List<Map<String, Object>> breadcrumbs,
    Map<String, Object> context,
    @NotBlank String severity,
    String appVersion,
    Map<String, Object> deviceInfo,
    @NotNull Instant timestamp
) {}
```

```java
package com.revocare.starterkit.modules.crashreporting.dto;

import com.revocare.starterkit.modules.crashreporting.entity.CrashReport;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CrashReportResponse(
    UUID id, String errorMessage, String stackTrace,
    List<Map<String, Object>> breadcrumbs, Map<String, Object> context,
    String severity, String appVersion, Map<String, Object> deviceInfo,
    Instant timestamp, Instant createdAt
) {
    public static CrashReportResponse from(CrashReport r) {
        return new CrashReportResponse(r.getId(), r.getErrorMessage(), r.getStackTrace(),
            r.getBreadcrumbs(), r.getContext(), r.getSeverity(), r.getAppVersion(),
            r.getDeviceInfo(), r.getTimestamp(), r.getCreatedAt());
    }
}
```

- [ ] **Step 4: Create service**

```java
package com.revocare.starterkit.modules.crashreporting.service;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.common.exception.ForbiddenException;
import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import com.revocare.starterkit.modules.crashreporting.dto.*;
import com.revocare.starterkit.modules.crashreporting.entity.CrashReport;
import com.revocare.starterkit.modules.crashreporting.repository.CrashReportRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CrashReportService {

    private final CrashReportRepository repository;

    public CrashReportService(CrashReportRepository repository) {
        this.repository = repository;
    }

    public CrashReportResponse create(UUID userId, CrashReportRequest request) {
        CrashReport report = new CrashReport();
        report.setUserId(userId);
        report.setErrorMessage(request.errorMessage());
        report.setStackTrace(request.stackTrace());
        report.setBreadcrumbs(request.breadcrumbs());
        report.setContext(request.context());
        report.setSeverity(request.severity());
        report.setAppVersion(request.appVersion());
        report.setDeviceInfo(request.deviceInfo());
        report.setTimestamp(request.timestamp());
        return CrashReportResponse.from(repository.save(report));
    }

    public PagedResponse<CrashReportResponse> list(UUID userId, int page, int size) {
        var result = repository.findByUserIdOrderByTimestampDesc(userId, PageRequest.of(page, size));
        return PagedResponse.from(result.map(CrashReportResponse::from));
    }

    public CrashReportResponse getById(UUID userId, UUID id) {
        CrashReport report = repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("CrashReport", id));
        return CrashReportResponse.from(report);
    }
}
```

- [ ] **Step 5: Create controller**

```java
package com.revocare.starterkit.modules.crashreporting.controller;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.modules.auth.service.AuthService;
import com.revocare.starterkit.modules.crashreporting.dto.*;
import com.revocare.starterkit.modules.crashreporting.service.CrashReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/crash-reports")
public class CrashReportController {

    private final CrashReportService crashReportService;
    private final AuthService authService;

    public CrashReportController(CrashReportService crashReportService, AuthService authService) {
        this.crashReportService = crashReportService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<CrashReportResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CrashReportRequest request) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(crashReportService.create(userId, request));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<CrashReportResponse>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.ok(crashReportService.list(userId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrashReportResponse> getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.ok(crashReportService.getById(userId, id));
    }
}
```

- [ ] **Step 6: Write service test**

```java
package com.revocare.starterkit.modules.crashreporting.service;

import com.revocare.starterkit.modules.crashreporting.dto.CrashReportRequest;
import com.revocare.starterkit.modules.crashreporting.dto.CrashReportResponse;
import com.revocare.starterkit.modules.crashreporting.entity.CrashReport;
import com.revocare.starterkit.modules.crashreporting.repository.CrashReportRepository;
import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CrashReportServiceTest {

    @Mock private CrashReportRepository repository;
    @InjectMocks private CrashReportService service;

    @Test
    void create_savesAndReturnsResponse() {
        UUID userId = UUID.randomUUID();
        var request = new CrashReportRequest("NPE", "stack...", null, null, "error", "1.0", null, Instant.now());
        when(repository.save(any(CrashReport.class))).thenAnswer(inv -> {
            CrashReport r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        CrashReportResponse response = service.create(userId, request);
        assertNotNull(response);
        assertEquals("NPE", response.errorMessage());
    }

    @Test
    void getById_throwsWhenNotFound() {
        UUID userId = UUID.randomUUID();
        UUID id = UUID.randomUUID();
        when(repository.findByIdAndUserId(id, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getById(userId, id));
    }
}
```

- [ ] **Step 7: Run tests and commit**

Run: `mvnw.cmd test -Dtest=CrashReportServiceTest`
Expected: All tests pass

```bash
git add src/main/java/com/revocare/starterkit/modules/crashreporting/ \
  src/test/java/com/revocare/starterkit/modules/crashreporting/
git commit -m "feat: add crash reporting module with submit and query endpoints"
```

---

### Task 12: Notifications Module

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/entity/DeviceToken.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/entity/NotificationHistory.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/repository/DeviceTokenRepository.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/repository/NotificationHistoryRepository.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/dto/RegisterTokenRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/dto/SendNotificationRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/dto/NotificationHistoryResponse.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/service/NotificationService.java`
- Create: `src/main/java/com/revocare/starterkit/modules/notifications/controller/NotificationController.java`
- Test: `src/test/java/com/revocare/starterkit/modules/notifications/service/NotificationServiceTest.java`

- [ ] **Step 1: Create entities**

```java
package com.revocare.starterkit.modules.notifications.entity;

import com.revocare.starterkit.common.entity.BaseEntity;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "device_tokens", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "token"}))
public class DeviceToken extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 500)
    private String token;

    @Column(nullable = false, length = 20)
    private String platform;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
}
```

```java
package com.revocare.starterkit.modules.notifications.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "notification_history")
public class NotificationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> data;

    @Column(nullable = false, length = 20)
    private String status = "pending";

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = Instant.now(); updatedAt = Instant.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = Instant.now(); }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
```

- [ ] **Step 2: Create repositories**

```java
package com.revocare.starterkit.modules.notifications.repository;

import com.revocare.starterkit.modules.notifications.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {
    Optional<DeviceToken> findByUserIdAndToken(UUID userId, String token);
    List<DeviceToken> findByUserId(UUID userId);
    void deleteByUserIdAndToken(UUID userId, String token);
}
```

```java
package com.revocare.starterkit.modules.notifications.repository;

import com.revocare.starterkit.modules.notifications.entity.NotificationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;

public interface NotificationHistoryRepository extends JpaRepository<NotificationHistory, UUID> {
    @Query("SELECT n FROM NotificationHistory n WHERE n.userId = :userId ORDER BY n.sentAt DESC NULLS LAST")
    Page<NotificationHistory> findByUserIdOrderBySentAt(@Param("userId") UUID userId, Pageable pageable);
}
```

- [ ] **Step 3: Create DTOs**

```java
package com.revocare.starterkit.modules.notifications.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterTokenRequest(
    @NotBlank String token,
    @NotBlank String platform
) {}
```

```java
package com.revocare.starterkit.modules.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public record SendNotificationRequest(
    @NotBlank String title,
    String body,
    Map<String, Object> data
) {}
```

```java
package com.revocare.starterkit.modules.notifications.dto;

import com.revocare.starterkit.modules.notifications.entity.NotificationHistory;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record NotificationHistoryResponse(
    UUID id, String title, String body, Map<String, Object> data,
    String status, Instant sentAt, Instant createdAt
) {
    public static NotificationHistoryResponse from(NotificationHistory n) {
        return new NotificationHistoryResponse(n.getId(), n.getTitle(), n.getBody(),
            n.getData(), n.getStatus(), n.getSentAt(), n.getCreatedAt());
    }
}
```

- [ ] **Step 4: Create service**

```java
package com.revocare.starterkit.modules.notifications.service;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.modules.notifications.dto.*;
import com.revocare.starterkit.modules.notifications.entity.DeviceToken;
import com.revocare.starterkit.modules.notifications.entity.NotificationHistory;
import com.revocare.starterkit.modules.notifications.repository.DeviceTokenRepository;
import com.revocare.starterkit.modules.notifications.repository.NotificationHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final DeviceTokenRepository tokenRepository;
    private final NotificationHistoryRepository historyRepository;

    public NotificationService(DeviceTokenRepository tokenRepository, NotificationHistoryRepository historyRepository) {
        this.tokenRepository = tokenRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional
    public void registerToken(UUID userId, RegisterTokenRequest request) {
        tokenRepository.findByUserIdAndToken(userId, request.token())
            .ifPresentOrElse(
                existing -> { /* updated_at auto-updates via @PreUpdate */ tokenRepository.save(existing); },
                () -> {
                    DeviceToken token = new DeviceToken();
                    token.setUserId(userId);
                    token.setToken(request.token());
                    token.setPlatform(request.platform());
                    tokenRepository.save(token);
                });
    }

    @Transactional
    public void unregisterToken(UUID userId, String token) {
        tokenRepository.deleteByUserIdAndToken(userId, token);
    }

    @Transactional
    public NotificationHistoryResponse sendToSelf(UUID userId, SendNotificationRequest request) {
        NotificationHistory history = new NotificationHistory();
        history.setUserId(userId);
        history.setTitle(request.title());
        history.setBody(request.body());
        history.setData(request.data());
        history.setStatus("pending");
        history = historyRepository.save(history);

        List<DeviceToken> tokens = tokenRepository.findByUserId(userId);
        if (tokens.isEmpty()) {
            log.warn("No device tokens found for user {}", userId);
            history.setStatus("failed");
        } else {
            for (DeviceToken token : tokens) {
                log.info("Sending notification to token {} (platform: {}): {}", token.getToken(), token.getPlatform(), request.title());
            }
            history.setStatus("sent");
            history.setSentAt(Instant.now());
        }
        return NotificationHistoryResponse.from(historyRepository.save(history));
    }

    public PagedResponse<NotificationHistoryResponse> getHistory(UUID userId, int page, int size) {
        var result = historyRepository.findByUserIdOrderBySentAt(userId, PageRequest.of(page, size));
        return PagedResponse.from(result.map(NotificationHistoryResponse::from));
    }
}
```

- [ ] **Step 5: Create controller**

```java
package com.revocare.starterkit.modules.notifications.controller;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.modules.auth.service.AuthService;
import com.revocare.starterkit.modules.notifications.dto.*;
import com.revocare.starterkit.modules.notifications.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @PostMapping("/tokens")
    public ResponseEntity<Void> registerToken(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody RegisterTokenRequest request) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        notificationService.registerToken(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/tokens/{token}")
    public ResponseEntity<Void> unregisterToken(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String token) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        notificationService.unregisterToken(userId, token);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/send")
    public ResponseEntity<NotificationHistoryResponse> send(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SendNotificationRequest request) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.ok(notificationService.sendToSelf(userId, request));
    }

    @GetMapping("/history")
    public ResponseEntity<PagedResponse<NotificationHistoryResponse>> getHistory(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.ok(notificationService.getHistory(userId, page, size));
    }
}
```

- [ ] **Step 6: Write service test**

```java
package com.revocare.starterkit.modules.notifications.service;

import com.revocare.starterkit.modules.notifications.dto.RegisterTokenRequest;
import com.revocare.starterkit.modules.notifications.dto.SendNotificationRequest;
import com.revocare.starterkit.modules.notifications.entity.DeviceToken;
import com.revocare.starterkit.modules.notifications.entity.NotificationHistory;
import com.revocare.starterkit.modules.notifications.repository.DeviceTokenRepository;
import com.revocare.starterkit.modules.notifications.repository.NotificationHistoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private DeviceTokenRepository tokenRepository;
    @Mock private NotificationHistoryRepository historyRepository;
    @InjectMocks private NotificationService service;

    @Test
    void registerToken_createsNewToken() {
        UUID userId = UUID.randomUUID();
        when(tokenRepository.findByUserIdAndToken(userId, "token123")).thenReturn(Optional.empty());
        when(tokenRepository.save(any())).thenReturn(new DeviceToken());

        service.registerToken(userId, new RegisterTokenRequest("token123", "android"));

        verify(tokenRepository).save(argThat(t -> t.getToken().equals("token123")));
    }

    @Test
    void sendToSelf_createsHistoryAndSends() {
        UUID userId = UUID.randomUUID();
        DeviceToken token = new DeviceToken();
        token.setToken("token123");
        token.setPlatform("android");
        when(tokenRepository.findByUserId(userId)).thenReturn(List.of(token));
        when(historyRepository.save(any())).thenAnswer(inv -> {
            NotificationHistory h = inv.getArgument(0);
            h.setId(UUID.randomUUID());
            return h;
        });

        var response = service.sendToSelf(userId, new SendNotificationRequest("Test", "Body", null));

        assertNotNull(response);
        assertEquals("sent", response.status());
    }

    @Test
    void sendToSelf_failsWhenNoTokens() {
        UUID userId = UUID.randomUUID();
        when(tokenRepository.findByUserId(userId)).thenReturn(List.of());
        when(historyRepository.save(any())).thenAnswer(inv -> {
            NotificationHistory h = inv.getArgument(0);
            h.setId(UUID.randomUUID());
            return h;
        });

        var response = service.sendToSelf(userId, new SendNotificationRequest("Test", "Body", null));

        assertEquals("failed", response.status());
    }
}
```

- [ ] **Step 7: Run tests and commit**

Run: `mvnw.cmd test -Dtest=NotificationServiceTest`
Expected: All tests pass

```bash
git add src/main/java/com/revocare/starterkit/modules/notifications/ \
  src/test/java/com/revocare/starterkit/modules/notifications/
git commit -m "feat: add notifications module with token management and send endpoint"
```

---

## Chunk 4: Feature Modules (Tasks, i18n, Sync)

### Task 13: Tasks CRUD Module

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/resources/entity/Task.java`
- Create: `src/main/java/com/revocare/starterkit/modules/resources/repository/TaskRepository.java`
- Create: `src/main/java/com/revocare/starterkit/modules/resources/dto/TaskRequest.java`
- Create: `src/main/java/com/revocare/starterkit/modules/resources/dto/TaskResponse.java`
- Create: `src/main/java/com/revocare/starterkit/modules/resources/service/TaskService.java`
- Create: `src/main/java/com/revocare/starterkit/modules/resources/controller/TaskController.java`
- Test: `src/test/java/com/revocare/starterkit/modules/resources/service/TaskServiceTest.java`

- [ ] **Step 1: Create entity**

```java
package com.revocare.starterkit.modules.resources.entity;

import com.revocare.starterkit.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String status = "todo";

    @Column(nullable = false, length = 20)
    private String priority = "medium";

    @Column(name = "due_date")
    private LocalDate dueDate;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
```

- [ ] **Step 2: Create repository**

```java
package com.revocare.starterkit.modules.resources.repository;

import com.revocare.starterkit.modules.resources.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    @Query("SELECT t FROM Task t WHERE t.userId = :userId " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Task> findByFilters(@Param("userId") UUID userId,
        @Param("status") String status, @Param("priority") String priority, Pageable pageable);

    Optional<Task> findByIdAndUserId(UUID id, UUID userId);
}
```

- [ ] **Step 3: Create DTOs**

```java
package com.revocare.starterkit.modules.resources.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record TaskRequest(
    @NotBlank @Size(max = 255) String title,
    String description,
    String status,
    String priority,
    LocalDate dueDate
) {}
```

```java
package com.revocare.starterkit.modules.resources.dto;

import com.revocare.starterkit.modules.resources.entity.Task;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
    UUID id, String title, String description, String status,
    String priority, LocalDate dueDate, Instant createdAt, Instant updatedAt
) {
    public static TaskResponse from(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(),
            t.getStatus(), t.getPriority(), t.getDueDate(), t.getCreatedAt(), t.getUpdatedAt());
    }
}
```

- [ ] **Step 4: Create service**

```java
package com.revocare.starterkit.modules.resources.service;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import com.revocare.starterkit.modules.resources.dto.*;
import com.revocare.starterkit.modules.resources.entity.Task;
import com.revocare.starterkit.modules.resources.repository.TaskRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
public class TaskService {

    private static final Set<String> VALID_STATUSES = Set.of("todo", "in_progress", "done");
    private static final Set<String> VALID_PRIORITIES = Set.of("low", "medium", "high");

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public TaskResponse create(UUID userId, TaskRequest request) {
        Task task = new Task();
        task.setUserId(userId);
        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.status() != null) {
            validateEnum(request.status(), VALID_STATUSES, "status");
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            validateEnum(request.priority(), VALID_PRIORITIES, "priority");
            task.setPriority(request.priority());
        }
        task.setDueDate(request.dueDate());
        return TaskResponse.from(repository.save(task));
    }

    public PagedResponse<TaskResponse> list(UUID userId, String status, String priority, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = repository.findByFilters(userId, status, priority, pageable);
        return PagedResponse.from(result.map(TaskResponse::from));
    }

    public TaskResponse getById(UUID userId, UUID id) {
        Task task = repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse update(UUID userId, UUID id, TaskRequest request) {
        Task task = repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.status() != null) {
            validateEnum(request.status(), VALID_STATUSES, "status");
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            validateEnum(request.priority(), VALID_PRIORITIES, "priority");
            task.setPriority(request.priority());
        }
        task.setDueDate(request.dueDate());
        return TaskResponse.from(repository.save(task));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Task task = repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        repository.delete(task);
    }

    private void validateEnum(String value, Set<String> valid, String field) {
        if (!valid.contains(value)) {
            throw new IllegalArgumentException("Invalid " + field + ": " + value);
        }
    }
}
```

- [ ] **Step 5: Create controller**

```java
package com.revocare.starterkit.modules.resources.controller;

import com.revocare.starterkit.common.dto.PagedResponse;
import com.revocare.starterkit.modules.auth.service.AuthService;
import com.revocare.starterkit.modules.resources.dto.*;
import com.revocare.starterkit.modules.resources.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final AuthService authService;

    public TaskController(TaskService taskService, AuthService authService) {
        this.taskService = taskService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TaskResponse>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.ok(taskService.list(userId, status, priority, page, size));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TaskRequest request) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.create(userId, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.ok(taskService.getById(userId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody TaskRequest request) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        return ResponseEntity.ok(taskService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = authService.getUserIdByCognitoSub(jwt.getSubject());
        taskService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 6: Write service test**

```java
package com.revocare.starterkit.modules.resources.service;

import com.revocare.starterkit.common.exception.ResourceNotFoundException;
import com.revocare.starterkit.modules.resources.dto.TaskRequest;
import com.revocare.starterkit.modules.resources.dto.TaskResponse;
import com.revocare.starterkit.modules.resources.entity.Task;
import com.revocare.starterkit.modules.resources.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository repository;
    @InjectMocks private TaskService service;

    @Test
    void create_savesAndReturnsResponse() {
        UUID userId = UUID.randomUUID();
        var request = new TaskRequest("Buy milk", null, "todo", "low", null);
        when(repository.save(any(Task.class))).thenAnswer(inv -> {
            Task t = inv.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        TaskResponse response = service.create(userId, request);
        assertEquals("Buy milk", response.title());
        assertEquals("todo", response.status());
    }

    @Test
    void create_rejectsInvalidStatus() {
        UUID userId = UUID.randomUUID();
        var request = new TaskRequest("Test", null, "invalid", null, null);
        assertThrows(IllegalArgumentException.class, () -> service.create(userId, request));
    }

    @Test
    void getById_throwsWhenNotFound() {
        UUID userId = UUID.randomUUID();
        UUID id = UUID.randomUUID();
        when(repository.findByIdAndUserId(id, userId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getById(userId, id));
    }

    @Test
    void delete_removesTask() {
        UUID userId = UUID.randomUUID();
        UUID id = UUID.randomUUID();
        Task task = new Task();
        task.setId(id);
        when(repository.findByIdAndUserId(id, userId)).thenReturn(Optional.of(task));

        service.delete(userId, id);
        verify(repository).delete(task);
    }
}
```

- [ ] **Step 7: Run tests and commit**

Run: `mvnw.cmd test -Dtest=TaskServiceTest`
Expected: All tests pass

```bash
git add src/main/java/com/revocare/starterkit/modules/resources/ \
  src/test/java/com/revocare/starterkit/modules/resources/
git commit -m "feat: add tasks CRUD module with validation and filtering"
```

---

### Task 14: i18n Module

**Files:**
- Create: `src/main/java/com/revocare/starterkit/modules/i18n/entity/Translation.java`
- Create: `src/main/java/com/revocare/starterkit/modules/i18n/repository/TranslationRepository.java`
- Create: `src/main/java/com/revocare/starterkit/modules/i18n/dto/TranslationResponse.java`
- Create: `src/main/java/com/revocare/starterkit/modules/i18n/service/I18nService.java`
- Create: `src/main/java/com/revocare/starterkit/modules/i18n/controller/I18nController.java`
- Test: `src/test/java/com/revocare/starterkit/modules/i18n/service/I18nServiceTest.java`

- [ ] **Step 1: Create entity**

```java
package com.revocare.starterkit.modules.i18n.entity;

import com.revocare.starterkit.common.entity.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "translations", uniqueConstraints = @UniqueConstraint(columnNames = {"locale", "namespace", "key"}))
public class Translation extends BaseEntity {

    @Column(nullable = false, length = 10)
    private String locale;

    @Column(nullable = false, length = 100)
    private String namespace;

    @Column(name = "key", nullable = false)
    private String key;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String value;

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }
    public String getNamespace() { return namespace; }
    public void setNamespace(String namespace) { this.namespace = namespace; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
}
```

- [ ] **Step 2: Create repository**

```java
package com.revocare.starterkit.modules.i18n.repository;

import com.revocare.starterkit.modules.i18n.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface TranslationRepository extends JpaRepository<Translation, UUID> {
    List<Translation> findByLocale(String locale);

    @Query("SELECT DISTINCT t.locale FROM Translation t")
    List<String> findDistinctLocales();
}
```

- [ ] **Step 3: Create DTO**

```java
package com.revocare.starterkit.modules.i18n.dto;

import com.revocare.starterkit.modules.i18n.entity.Translation;

public record TranslationResponse(String namespace, String key, String value) {
    public static TranslationResponse from(Translation t) {
        return new TranslationResponse(t.getNamespace(), t.getKey(), t.getValue());
    }
}
```

- [ ] **Step 4: Create service**

```java
package com.revocare.starterkit.modules.i18n.service;

import com.revocare.starterkit.modules.i18n.dto.TranslationResponse;
import com.revocare.starterkit.modules.i18n.repository.TranslationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class I18nService {

    private final TranslationRepository repository;

    public I18nService(TranslationRepository repository) {
        this.repository = repository;
    }

    public List<TranslationResponse> getTranslations(String locale) {
        return repository.findByLocale(locale).stream()
            .map(TranslationResponse::from)
            .toList();
    }

    public List<String> getLocales() {
        return repository.findDistinctLocales();
    }
}
```

- [ ] **Step 5: Create controller**

```java
package com.revocare.starterkit.modules.i18n.controller;

import com.revocare.starterkit.modules.i18n.dto.TranslationResponse;
import com.revocare.starterkit.modules.i18n.service.I18nService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/i18n")
public class I18nController {

    private final I18nService i18nService;

    public I18nController(I18nService i18nService) {
        this.i18nService = i18nService;
    }

    @GetMapping("/{locale}")
    public ResponseEntity<List<TranslationResponse>> getTranslations(@PathVariable String locale) {
        return ResponseEntity.ok(i18nService.getTranslations(locale));
    }

    @GetMapping("/locales")
    public ResponseEntity<List<String>> getLocales() {
        return ResponseEntity.ok(i18nService.getLocales());
    }
}
```

- [ ] **Step 6: Write service test**

```java
package com.revocare.starterkit.modules.i18n.service;

import com.revocare.starterkit.modules.i18n.dto.TranslationResponse;
import com.revocare.starterkit.modules.i18n.entity.Translation;
import com.revocare.starterkit.modules.i18n.repository.TranslationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class I18nServiceTest {

    @Mock private TranslationRepository repository;
    @InjectMocks private I18nService service;

    @Test
    void getTranslations_returnsTranslationsForLocale() {
        Translation t = new Translation();
        t.setLocale("en");
        t.setNamespace("common");
        t.setKey("welcome");
        t.setValue("Welcome");
        when(repository.findByLocale("en")).thenReturn(List.of(t));

        List<TranslationResponse> result = service.getTranslations("en");
        assertEquals(1, result.size());
        assertEquals("Welcome", result.get(0).value());
    }

    @Test
    void getLocales_returnsDistinctLocales() {
        when(repository.findDistinctLocales()).thenReturn(List.of("en", "es"));

        List<String> locales = service.getLocales();
        assertEquals(2, locales.size());
        assertTrue(locales.contains("en"));
        assertTrue(locales.contains("es"));
    }
}
```

- [ ] **Step 7: Run tests and commit**

Run: `mvnw.cmd test -Dtest=I18nServiceTest`
Expected: All tests pass

```bash
git add src/main/java/com/revocare/starterkit/modules/i18n/ \
  src/test/java/com/revocare/starterkit/modules/i18n/
git commit -m "feat: add i18n module with translation endpoints"
```

---

### Task 15: Sync Module

**Files:** Entity, repository, DTOs, service, controller, test.

- [ ] **Step 1: Create `SyncRecord.java` entity extending BaseEntity**

Fields: userId, storeKey, value (JSONB), version, deleted.

- [ ] **Step 2: Create `SyncRecordRepository`**

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<SyncRecord> findByUserIdAndStoreKey(UUID userId, String storeKey);

List<SyncRecord> findByUserIdAndVersionGreaterThanOrderByVersionAsc(UUID userId, long sinceVersion);

@Query("SELECT COALESCE(MAX(s.version), 0) FROM SyncRecord s WHERE s.userId = :userId")
long findMaxVersionByUserId(@Param("userId") UUID userId);
```

- [ ] **Step 3: Create DTOs**

```java
// SyncPushRequest
public record SyncPushRequest(
    @NotEmpty List<SyncPushItem> items
) {
    public record SyncPushItem(
        @NotBlank String key,
        Object value,
        long version,
        boolean deleted
    ) {}
}

// SyncPushResponse
public record SyncPushResponse(
    List<AcceptedItem> accepted,
    List<ConflictItem> conflicts
) {
    public record AcceptedItem(String key, long version) {}
    public record ConflictItem(String key, long serverVersion, Object serverValue, long clientVersion) {}
}

// SyncPullResponse
public record SyncPullResponse(List<SyncRecordItem> records) {
    public record SyncRecordItem(String key, Object value, long version, boolean deleted) {}
}
```

- [ ] **Step 4: Create service**

`SyncService`:
- `push(userId, request)` — for each item: lock row, compare versions, accept or reject. Return partial success response.
- `pull(userId, sinceVersion)` — return all records with version > since, sorted by version ASC.

Key logic for push:
```java
@Transactional
public SyncPushResponse push(UUID userId, SyncPushRequest request) {
    List<SyncPushResponse.AcceptedItem> accepted = new ArrayList<>();
    List<SyncPushResponse.ConflictItem> conflicts = new ArrayList<>();
    long currentMaxVersion = repository.findMaxVersionByUserId(userId);

    for (var item : request.items()) {
        Optional<SyncRecord> existing = repository.findByUserIdAndStoreKey(userId, item.key());
        if (existing.isPresent()) {
            SyncRecord record = existing.get();
            if (item.version() >= record.getVersion()) {
                long newVersion = ++currentMaxVersion;
                record.setValue(item.value());
                record.setVersion(newVersion);
                record.setDeleted(item.deleted());
                repository.save(record);
                accepted.add(new SyncPushResponse.AcceptedItem(item.key(), newVersion));
            } else {
                conflicts.add(new SyncPushResponse.ConflictItem(
                    item.key(), record.getVersion(), record.getValue(), item.version()));
            }
        } else {
            long newVersion = ++currentMaxVersion;
            SyncRecord record = new SyncRecord();
            record.setUserId(userId);
            record.setStoreKey(item.key());
            record.setValue(item.value());
            record.setVersion(newVersion);
            repository.save(record);
            accepted.add(new SyncPushResponse.AcceptedItem(item.key(), newVersion));
        }
    }
    return new SyncPushResponse(accepted, conflicts);
}
```

- [ ] **Step 5: Create controller**

POST `/api/sync/push`, GET `/api/sync/pull?since=0`

- [ ] **Step 6: Write comprehensive test**

Test: push new records, push with conflict, push with valid version update, pull since version, pull all (since=0).

- [ ] **Step 7: Run tests and commit**

```bash
git add src/main/java/com/revocare/starterkit/modules/sync/ \
  src/test/java/com/revocare/starterkit/modules/sync/
git commit -m "feat: add sync module with push/pull and conflict resolution"
```

---

## Chunk 5: Integration Testing & Final Verification

### Task 16: Integration Test Setup

**Files:**
- Create: `src/test/java/com/revocare/starterkit/IntegrationTestBase.java`

- [ ] **Step 1: Create integration test base class**

```java
// src/test/java/com/revocare/starterkit/IntegrationTestBase.java
package com.revocare.starterkit;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    private static final String JWT_SECRET = "test-secret-key-for-unit-testing-only-32chars!";

    protected String generateTestJwt(String subject) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
            .subject(subject)
            .issuedAt(Date.from(Instant.now()))
            .expiration(Date.from(Instant.now().plusSeconds(3600)))
            .signWith(key)
            .compact();
    }
}
```

Note: Add `io.jsonwebtoken:jjwt-api`, `io.jsonwebtoken:jjwt-impl`, `io.jsonwebtoken:jjwt-jackson` as test dependencies in `pom.xml`.

- [ ] **Step 2: Add jjwt test dependencies to pom.xml**

Add to `<dependencies>` section:
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>test</scope>
</dependency>
```

- [ ] **Step 3: Commit**

```bash
git add pom.xml src/test/java/com/revocare/starterkit/IntegrationTestBase.java
git commit -m "feat: add integration test base with JWT token generation"
```

---

### Task 17: Controller Integration Tests

**Files:**
- Create: `src/test/java/com/revocare/starterkit/modules/resources/controller/TaskControllerTest.java`
- Create: `src/test/java/com/revocare/starterkit/modules/analytics/controller/AnalyticsControllerTest.java`

- [ ] **Step 1: Write `TaskControllerTest`**

Test full CRUD flow via MockMvc:
1. Create task (POST) — expect 201
2. List tasks (GET) — expect task in list
3. Get task by id (GET) — expect correct task
4. Update task (PUT) — expect updated fields
5. Delete task (DELETE) — expect 204
6. Get deleted task — expect 404
7. Unauthenticated request — expect 401

- [ ] **Step 2: Write `AnalyticsControllerTest`**

Test event submission and query via MockMvc:
1. Submit event (POST) — expect 201
2. Submit batch (POST) — expect 201, correct count
3. Query events (GET) — expect events in response
4. Unauthenticated request — expect 401

- [ ] **Step 3: Run all tests**

Run: `mvnw.cmd test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/test/java/com/revocare/starterkit/modules/
git commit -m "feat: add controller integration tests for tasks and analytics"
```

---

### Task 18: Final Verification & Docker Test

- [ ] **Step 1: Run full test suite**

Run: `mvnw.cmd clean verify`
Expected: BUILD SUCCESS, all tests pass

- [ ] **Step 2: Build Docker image**

Run: `docker compose build app`
Expected: Image builds successfully

- [ ] **Step 3: Start full stack**

Run: `docker compose up -d`
Expected: All 3 services start (db, localstack, app)

- [ ] **Step 4: Verify health endpoint**

Run: `curl http://localhost:8080/actuator/health`
Expected: `{"status":"UP"}`

- [ ] **Step 5: Verify Swagger UI loads**

Open: `http://localhost:8080/swagger-ui.html`
Expected: Swagger UI with all endpoints documented

- [ ] **Step 6: Stop containers**

Run: `docker compose down`

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: final verification — all tests pass, Docker stack works"
```
