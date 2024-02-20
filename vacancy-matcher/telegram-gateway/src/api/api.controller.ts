import { Controller, Get, Post, UseInterceptors, UploadedFile, Inject, Body, Param } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Readable } from 'stream';

import { ApiService } from "./api.service";
import { FormDataRequest, MemoryStoredFile } from "nestjs-form-data";

@Controller()
export class ApiController {
    constructor(@Inject(ApiService) private readonly service: ApiService) { }

    @Get("/healthcheck")
    getHealthCheck() {
        return "pong";
    }

    @Post("/detection-response/cv/:chatId")
    @FormDataRequest()
    processCv(@Body() result: Record<string, string>, @Param('chatId') chatId: string) {
        try {
            console.log(result);
            const vc = result['cv_matches']['vacancy_name'];

            const formatted = Object.values(vc).join(`\n`);
            this.service.sendDetectedFileToUser(`Результат обработки: \n${formatted}`, chatId);
        } catch (error) {
            console.error(error);
        }
    }

    @Post("/detection-response/vacancy/:chatId")
    @FormDataRequest()
    processVacancy(@Body() result: Record<string, string>, @Param('chatId') chatId: string) {
        try {
            console.log(result);
            const vc = result['vac_matches']['Ищет работу на должность:'];

            const formatted = Object.values(vc).join(`\n`);
            this.service.sendDetectedFileToUser(`Результат обработки: \n${formatted}`, chatId);
        } catch (error) {
            console.error(error);
        }
    }
}