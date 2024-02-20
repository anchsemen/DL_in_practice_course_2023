import { Injectable } from "@nestjs/common";
import { Telegraf } from 'telegraf';
import { InjectBot } from "nestjs-telegraf";
import { Readable } from 'stream';
import { MemoryStoredFile } from "nestjs-form-data";

const fs = require('fs');
const streamToBlob = require('stream-to-blob')



@Injectable()
export class ApiService {
    constructor(@InjectBot() private bot: Telegraf) { }

    async sendFileToDetectionModel(stream: Readable, file: string, chatId: string, deleteFile = false) {
        try {
            const data = new FormData();
            const blob = await streamToBlob(stream);
            data.set('file', blob, 'video');

            stream.destroy();

            if (deleteFile) {
                fs.unlink(file, (error) => {
                    error && console.log(error);
                });
            }

            const ML_HOST_URL = process.env.ML_HOST_URL
                ? `${process.env.ML_HOST_URL}/${chatId}`
                : `http://localhost:${process.env.BOT_PORT}/api/detection-response/video/${chatId}`;

            const response = await fetch(ML_HOST_URL, {
                method: "POST",
                body: data,
            });

            return response.text();
        } catch (error) {
            console.log(error);
        }
    }

    sendResultToUser(file: MemoryStoredFile, chatId: string) {
        try {
            this.bot.telegram.sendVideo(chatId, { source: file.buffer, filename: file.originalName });
            return `Файл ${file.originalName} был отправлен пользователю. Ожидайте ответа в боте RoadCV Project`;
        } catch (error) {
            console.log('error');

            return error;
        }

    }
}