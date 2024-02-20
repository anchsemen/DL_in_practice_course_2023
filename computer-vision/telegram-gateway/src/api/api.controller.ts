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

    @Post("/detection-request/video/:chatId")
    @UseInterceptors(FileInterceptor('file'))
    processVideo(@UploadedFile() file: Express.Multer.File, @Param('chatId') chatId: string) {
        const uploadedFileStream = Readable.from(file.buffer);
        return this.service.sendFileToDetectionModel(uploadedFileStream, file.originalname, chatId);
    }

    @Post("/detection-response/video/:chatId")
    @FormDataRequest()
    receiveDetectedVideo(@Body('file') file: MemoryStoredFile, @Param('chatId') chatId: string) {
        return this.service.sendResultToUser(file, chatId);
    }
}