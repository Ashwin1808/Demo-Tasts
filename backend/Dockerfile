# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN groupadd --system appgroup && \
    useradd --system --gid appgroup appuser
COPY --from=build /app/target/task-manager-1.0.0.jar app.jar
RUN chown -R appuser:appgroup /app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
