# ---- Build stage ----
# Uses the official Maven image (not the committed Maven Wrapper) so the
# build doesn't need network access to fetch the wrapper's own Maven
# distribution — only dependency downloads, which are cached in their own
# layer below.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Dependencies first, in their own layer, so `docker build` skips re-downloading
# them when only application source changes.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
# Tests are real integration tests that require a live PostgreSQL instance
# (see README) — not available during an image build, so they're skipped
# here and must be run separately (`./mvnw test`) before building the image.
RUN mvn -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r app && useradd -r -g app -s /usr/sbin/nologin app

WORKDIR /app
COPY --from=build /build/target/portfolio-backend.jar app.jar
RUN chown app:app app.jar
USER app

EXPOSE 8080

# Uses SERVER_PORT (defaults to 8080, same as the app itself) so the check
# still works if the container is run with a different port.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f "http://localhost:${SERVER_PORT:-8080}/api/health" || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
