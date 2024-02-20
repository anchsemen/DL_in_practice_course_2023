import { Module } from '@nestjs/common';
import {
  ConfigModule
} from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    TelegrafModule.forRootAsync({
      useFactory: () => {
        return {
          token: process.env.BOT_TOKEN
        }
      },
    }),
    BotModule,
    ApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
