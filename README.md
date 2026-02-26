# ChoiseIN

Веб-приложение для прохождения теста и определения морального типа личности.

## Требования

- Java 21
- Maven
- PostgreSQL (при запуске без Docker)

## Запуск через Docker (рекомендуется)

Убедитесь, что установлены [Docker](https://docs.docker.com/get-docker/) и [Docker Compose](https://docs.docker.com/compose/install/).

### 1. Клонировать репозиторий и перейти в папку проекта

```bash
git clone <URL вашего репозитория>
cd ChoiseIN-main
```

### 2. Собрать образ и запустить приложение с базой данных

```bash
docker compose up -d --build
```

- `--build` — собрать образ приложения по `Dockerfile`
- `-d` — запуск в фоне

### 3. Открыть приложение

В браузере: **http://localhost:8080**

### 4. Остановить и удалить контейнеры

```bash
docker compose down
```

Данные БД сохраняются в Docker-томе. Чтобы удалить и их:

```bash
docker compose down -v
```

---

## Полезные команды Docker

| Действие | Команда |
|----------|---------|
| Сборка образа приложения | `docker build -t choisein-app .` |
| Запуск приложения + БД | `docker compose up -d` |
| Просмотр логов приложения | `docker compose logs -f app` |
| Просмотр логов БД | `docker compose logs -f db` |
| Остановка | `docker compose down` |

---

## Запуск без Docker (локально)

1. Скопировать файл настроек:
   - из `src/main/resources/application-example.properties`
   - в `src/main/resources/application.properties`
2. В `application.properties` указать свои настройки БД (URL, логин, пароль).
3. Создать БД PostgreSQL `INchoice` и пользователя `app_user` с теми же данными, что в `application.properties`.
4. Выполнить: `./mvnw spring-boot:run`
5. Открыть: http://localhost:8080

## Тесты

```bash
./mvnw test
```
