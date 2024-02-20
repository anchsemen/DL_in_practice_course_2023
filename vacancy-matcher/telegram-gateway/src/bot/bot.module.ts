import { Module } from "@nestjs/common";

import { ApiModule } from "../api/api.module";

import { BotUpdate } from "./bot.update";

@Module({
    imports: [ApiModule],
    providers: [BotUpdate],
})
export class BotModule { }