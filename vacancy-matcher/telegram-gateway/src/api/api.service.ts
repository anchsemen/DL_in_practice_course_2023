import { Injectable } from "@nestjs/common";
import { Telegraf } from 'telegraf';
import { InjectBot } from "nestjs-telegraf";


@Injectable()
export class ApiService {
    constructor(@InjectBot() private bot: Telegraf) { 
        console.log(this.bot.telegram.sendMessage)
    }

     sendFileToDetectionModel = async (content: string, chatId: string, mode: string) => {
    const ML_HOST_URL = process.env.ML_HOST_URL;
        try {
            const formData = new FormData();
            const pdfText = "content".split('\n').join(" ");

            formData.append('text', pdfText);

            this.bot.telegram.sendMessage(chatId, 'Файл отправлен в обработку. Ожидайте ответа...');

            console.log(`${ML_HOST_URL}/${mode}/${chatId}`);

            const result = await fetch(`${ML_HOST_URL}/${mode}/${chatId}`, {
                method: "POST",
                body: formData,
            }).then((data) => data.json());

        } catch (error) {
            console.log(error);
        }
    }

    sendDetectedFileToUser(result: string, chatId: string) {
        try {
            this.bot.telegram.sendMessage(chatId, result);
            return `Ответ был отправлен пользователю. Ожидайте ответа в боте`;
        } catch (error) {
            console.log('error');
            return error;
        }

    }
}