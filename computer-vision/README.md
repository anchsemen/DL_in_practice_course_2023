## Руководство по развертыванию
### telegram-gateway
<a href="https://www.postman.com/spaceflight-astronomer-59057042/workspace/deep-learning-course-2023/collection/15087583-d9db710c-8b02-4c12-8db6-c297ff247b51">Ссылка на Postman</a>

Перед запуском необходимо создать файл `.env` в корне репозитория и заполнить согласно `.env.sample`.

Далее выполнить следующие команды:
```
make pull
make prod
```

#### Для CV-команды
Переменная `ML_HOST_URL` в `.env` должна указывать на ваш сервис.

При этом стоит помнить, что если ваш `ML_HOST_URL`, например, равен `http://localhost:8080/api/get_video`,

телеграм-сервис отправит видео пользователя по адресу `http://localhost:8080/api/get_video/:telegramId`,

где `telegramId` - айди этого пользователя в мессенджере.


После обработки изображения итоговое видео должно быть отправлено обратно в телеграм-сервис по адресу `localhost:<BOT_PORT>/api/detection-response/video/:telegramId` с тем же telegramId, что вы получили на свой `ML_HOST_URL`. 