import { Inject } from "@nestjs/common";
import {
  Update,
  Ctx,
  Start,
  On,
} from 'nestjs-telegraf';
import https from 'https';
const fs = require("fs");
const pdf = require('pdf-parse');

import { ApiService } from "../api/api.service";

@Update()
export class BotUpdate {
  constructor(@Inject(ApiService) private readonly service: ApiService) { }
  @Start()
  async onStart(@Ctx() ctx) {
    await ctx.reply('Бот работает! Отправьте следующим резюме или вакансию в формате pdf. Если вы хотите получить подходящие резюме - файл должен называться vacancy.pdf, если вакансии - cv.pdf.');
  }

  @On('document')
  async onVideoUpload(@Ctx() ctx) {
    try {
      const { file_id: fileId, file_name } = ctx.update.message.document;
      const chatId = ctx.update.message.from.id;

      const documentName = file_name as string;

      const mode = documentName.toLocaleLowerCase().includes('vacancy') ? 'vacancy' : 'cv';

      const fileLink = await ctx.telegram.getFileLink(fileId);
      const fileName = `${__dirname}/uploaded_file`;

      const writeStream = fs.createWriteStream(fileName);

      const pipeHandler = this.service.sendFileToDetectionModel.bind(this);

      https.get(fileLink, function (response) {
        response.pipe(writeStream);

        writeStream.on("finish", () => {
          writeStream.close();

          let dataBuffer = fs.readFileSync(fileName);
          pdf(dataBuffer).then(async function( data) {
            const response = await pipeHandler(data.text, chatId, mode);

            if (response) {
              const answer: Record<string, string> = response['vac_matches']['Ищет работу на должность:'];
              const result = Object.values(answer).join("\n")
  
              await ctx.reply(`Вам подходят следующие вакансии:\n${result}`);
            }

          
          });
        });
      });
    } catch (error) {
      console.log(error);
    }

  }
}
