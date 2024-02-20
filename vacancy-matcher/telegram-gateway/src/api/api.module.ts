import { Module } from "@nestjs/common";

import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";
import { NestjsFormDataModule } from "nestjs-form-data";

@Module({
    imports: [NestjsFormDataModule],
    controllers: [ApiController],
    providers: [ApiService],
    exports: [ApiService]
})
export class ApiModule { }