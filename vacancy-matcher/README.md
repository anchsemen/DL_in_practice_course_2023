### Инструкция по развертыванию
#### Telegram Gateway
Перед запуском заполнить файл .env в папке telegram-gateway:
```
BOT_PORT=<Порт бота, по умолчанию 3000>
BOT_TOKEN=<Токен созданного бота из Bot Father>
ML_HOST_URL=<Адрес эндпоинта ML-сервиса, по умолчанию: http://localhost:8000/detection-response>

```

Далее в этой же папке нужно выполнить следующий набор команд 
```
npm i
npm run dev
```

#### ML Service (в отдельном терминале)
```
uvicorn main:app --port 8000
```

После всего нужно зайти в бота в телеграме и отправить ему pdf-файл вакансии.

**Более подробный отчет о проделанной работе доступен в директории под названием report.md**

<a href="https://drive.google.com/drive/folders/1axNEKzSzN3GnZfIaerYji0VFf2v2rN2_?usp=drive_link">Ссылка на векторизованные данные</a>
