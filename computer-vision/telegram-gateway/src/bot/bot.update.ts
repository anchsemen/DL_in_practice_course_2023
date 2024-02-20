import { Inject } from "@nestjs/common";
import {
  Update,
  Ctx,
  Start,
  On,
} from 'nestjs-telegraf';
import https from 'https';
const fs = require("fs");

import { ApiService } from "../api/api.service";

@Update()
export class BotUpdate {
  constructor(@Inject(ApiService) private readonly service: ApiService) { }
  @Start()
  async onStart(@Ctx() ctx) {
    await ctx.reply('Бот работает! Отправьте следующим видео для детекции дорожных знаков.');
  }

  @On('document')
  async onVideoUpload(@Ctx() ctx) {
    try {
      const { file_id: fileId } = ctx.update.message.document;
      const chatId = ctx.update.message.from.id;

      const fileLink = await ctx.telegram.getFileLink(fileId);
      const fileName = `${__dirname}/uploaded_file`;

      const writeStream = fs.createWriteStream(fileName);

      const pipeHandler = this.service.sendFileToDetectionModel.bind(this);

      https.get(fileLink, function (response) {
        response.pipe(writeStream);
        writeStream.on("finish", () => {
          writeStream.close();
          const readStream = fs.createReadStream(fileName);
          return pipeHandler(readStream, fileName, chatId, true)
        });
      });
    } catch (error) {
      console.log(error);
    }

  }
}