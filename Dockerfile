FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY target/dynamic-mongo-crud-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
