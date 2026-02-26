# Сборка приложения
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Копируем pom и загружаем зависимости
COPY pom.xml .
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -B

# Копируем исходный код и собираем (без тестов в образе для ускорения; тесты запускаются отдельно)
COPY src ./src
RUN mvn package -DskipTests -B

# Финальный образ для запуска
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Создаём непривилегированного пользователя
RUN adduser -D -u 1000 appuser
USER appuser

# Копируем собранный jar из стадии build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
