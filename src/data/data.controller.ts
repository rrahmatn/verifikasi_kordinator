import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataService } from './data.service';
import { Express } from 'express';
import { AddDataDto, EditData, FilterKecamatanDto } from './dto/data.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(private readonly DataService: DataService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('masukan data excel yang valid');
    }

    try {
      const jsonData = await this.DataService.convertExcelToJson(file);
      await this.DataService.saveJsonToDatabase(jsonData);
      return { message: 'File uploaded and data saved successfully' };
    } catch (error) {
      console.error('Error processing file:', error.message);
      throw new BadRequestException('masukan data excel yang valid');
    }
  }

  @Delete()
  async deleteAll(){
    return this.DataService.deleteAll()
  }

  @Get('/page/:page')
  async getData(@Param('page') page: string) {
    return this.DataService.getData(parseInt(page));
  }
  @Get('/all')
  async getAllData() {
    return this.DataService.getAllData();
  }

  @Get('/nama/:nama/:page')
  async getDataByName(
    @Param('page') page: string,
    @Param('nama') nama: string,
  ) {
    return this.DataService.getDataByName(nama, parseInt(page));
  }
  @Get('/all/unverified')
  async getAllDataByUnverified() {
    return this.DataService.getAllDataByUnverified();
  }
  @Get('/unverified/:page')
  async getDataByUnverified(@Param('page') page: string) {
    return this.DataService.getDataByUnverified(parseInt(page));
  }
  @Get('/unverified/nama/:name/:page')
  async getDataByUnverifiedAndName(
    @Param('page') page: string,
    @Param('name') nama: string,
  ) {
    return this.DataService.getDataByUnverifiedAndName(parseInt(page), nama);
  }
  @Get('/verified/:page')
  async getDataByVerified(@Param('page') page: string) {
    return this.DataService.getDataByVerified(parseInt(page));
  }
  @Get('/all/verified')
  async getAllDataByVerified() {
    return this.DataService.getAllDataByVerified();
  }
  @Get('/verified/nama/:name/:page')
  async getDataByVerifiedAndName(
    @Param('page') page: string,
    @Param('name') nama: string,
  ) {
    return this.DataService.getDataByVerifiedAndName(parseInt(page), nama);
  }

  @Delete('/delete/:id')
  async deleteById(@Param('id') id: string) {
    return this.DataService.deleteById(parseInt(id));
  }

  @Get('/all/notallowed')
  async getAllDataByNotAllowed() {
    return this.DataService.getAllDataByNotAllowed();
  }
  @Get('/notallowed/:page')
  async getDataByNotAllowed(@Param('page') page: string) {
    return this.DataService.getDataByNotAllowed(parseInt(page));
  }
  @Get('/notallowed/nama/:name/:page')
  async getDataByNotAllowedAndName(
    @Param('page') page: string,
    @Param('name') nama: string,
  ) {
    return this.DataService.getDataByNotAllowedAndName(parseInt(page), nama);
  }

  @Get('/kabupaten/:kabupaten/all')
  async getAllKabupaten(@Param('kabupaten') kabupaten: string) {
    return this.DataService.getAllKabupaten(kabupaten);
  }
  @Get('/kabupaten/:kabupaten/page/:page')
  async getDataKabupaten(
    @Param('kabupaten') kabupaten: string,
    @Param('page') page: string,
  ) {
    return this.DataService.getByKabupaten(kabupaten, parseInt(page));
  }

  //udah
  @Get('/kabupaten/:kabupaten/kecamatan/:kecamatan/:page')
  async getDataByKecamatan(
    @Param('page') page: string,
    @Param('kecamatan') kecamatan: string,
    @Param('kabupaten') kabupaten: string,
  ) {
    return this.DataService.getDataByKecamatan(
      kabupaten,
      kecamatan,
      parseInt(page),
    );
  }

  @Get('/list/kecamatan')
  async getListKecamatan() {
    return this.DataService.getListKecamatan();
  }

  @Get('/kabupaten/:kabupaten/nama/:nama/:page')
  async getDataByKabupatenAndName(
    @Param('page') page: string,
    @Param('nama') nama: string,
    @Param('kabupaten') kabupaten: string,
  ) {
    return this.DataService.getDataByKabupatenAndName(
      kabupaten,
      nama,
      parseInt(page),
    );
  }
  //udah
  @Get('/all/kabupaten/:kabupaten/kecamatan/:kecamatan')
  async getAllKecamatan(
    @Param('kabupaten') kabupaten: string,
    @Param('kecamatan') kecamatan: string,
  ) {
    return this.DataService.getAllDataByKecamatan(kabupaten, kecamatan);
  }

  //udah
  @Get('/kabupaten/:kabupaten/kecamatan/:kecamatan/status/:status/:page')
  async getDataByKecamatanAndStatus(
    @Param('page') page: string,
    @Param('kabupaten') kabupaten: string,
    @Param('kecamatan') kecamatan: string,
    @Param('status') status: string,
  ) {
    return this.DataService.getDataByKecamatanAndStatus(
      kabupaten,
      kecamatan,
      status,
      parseInt(page),
    );
  }

  @Get('/all/kabupaten/:kabupaten/kecamatan/:kecamatan/status/:status')
  async getAllDataByKecamatanAndStatus(
    @Param('kabupaten') kabupaten: string,
    @Param('kecamatan') kecamatan: string,
    @Param('status') status: string,
  ) {
    return this.DataService.getAllDataByKecamatanAndStatus(
      kabupaten,
      kecamatan,
      status,
    );
  }
  //udah
  @Get('/kabupaten/:kabupaten/kecamatan/:kecamatan/nama/:nama/:page')
  async getDataByKecamatanAndName(
    @Param('kabupaten') kabupaten: string,
    @Param('kecamatan') kecamatan: string,
    @Param('nama') nama: string,
    @Param('page') page: string,
  ) {
    return this.DataService.getDataByKecamatanAndName(
      kabupaten,
      kecamatan,
      nama,
      parseInt(page),
    );
  }

  @Post('add')
  async addData(@Body() dto: AddDataDto) {
    return this.DataService.addData(dto);
  }

  @Get('/id/:id')
  async getDataById(@Param('id') id: string) {
    return this.DataService.getDataById(parseInt(id));
  }

  @Patch('edit/:id')
  @UseInterceptors(FileInterceptor('file'))
  async editData(
    @Param('id') id: string,
    @Body() dto: EditData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.DataService.editDataById(parseInt(id), dto, file);
  }
}
