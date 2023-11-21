import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataService } from './data.service';
import { Express } from 'express';
import { AddDataDto, EditData } from './dto/data.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/user/guard/jwt.guard';

@ApiTags('data')
@Controller('data')
@ApiBearerAuth()
export class DataController {
  constructor(private readonly DataService: DataService) {}

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Delete()
  async deleteAll() {
    return this.DataService.deleteAll();
  }

  @UseGuards(JwtGuard)
  @Get('/page/:page')
  async getData(@Param('page') page: string) {
    return this.DataService.getData(parseInt(page));
  }

  @UseGuards(JwtGuard)
  @Get('/all')
  async getAllData() {
    return this.DataService.getAllData();
  }

  @UseGuards(JwtGuard)
  @Get('/nama/:nama/:page')
  async getDataByName(
    @Param('page') page: string,
    @Param('nama') nama: string,
  ) {
    return this.DataService.getDataByName(nama, parseInt(page));
  }

  @UseGuards(JwtGuard)
  @Get('/all/unverified')
  async getAllDataByUnverified() {
    return this.DataService.getAllDataByUnverified();
  }

  @UseGuards(JwtGuard)
  @Get('/unverified/:page')
  async getDataByUnverified(@Param('page') page: string) {
    return this.DataService.getDataByUnverified(parseInt(page));
  }

  @UseGuards(JwtGuard)
  @Get('/unverified/nama/:name/:page')
  async getDataByUnverifiedAndName(
    @Param('page') page: string,
    @Param('name') nama: string,
  ) {
    return this.DataService.getDataByUnverifiedAndName(parseInt(page), nama);
  }

  @UseGuards(JwtGuard)
  @Get('/verified/:page')
  async getDataByVerified(@Param('page') page: string) {
    return this.DataService.getDataByVerified(parseInt(page));
  }

  @UseGuards(JwtGuard)
  @Get('/all/verified')
  async getAllDataByVerified() {
    return this.DataService.getAllDataByVerified();
  }

  @UseGuards(JwtGuard)
  @Get('/verified/nama/:name/:page')
  async getDataByVerifiedAndName(
    @Param('page') page: string,
    @Param('name') nama: string,
  ) {
    return this.DataService.getDataByVerifiedAndName(parseInt(page), nama);
  }

  @UseGuards(JwtGuard)
  @Get('/all/notallowed')
  async getAllDataByNotAllowed() {
    return this.DataService.getAllDataByNotAllowed();
  }

  @UseGuards(JwtGuard)
  @Get('/notallowed/:page')
  async getDataByNotAllowed(@Param('page') page: string) {
    return this.DataService.getDataByNotAllowed(parseInt(page));
  }

  @UseGuards(JwtGuard)
  @Get('/notallowed/nama/:name/:page')
  async getDataByNotAllowedAndName(
    @Param('page') page: string,
    @Param('name') nama: string,
  ) {
    return this.DataService.getDataByNotAllowedAndName(parseInt(page), nama);
  }

  @UseGuards(JwtGuard)
  @Get('/kabupaten/:kabupaten/all')
  async getAllKabupaten(@Param('kabupaten') kabupaten: string) {
    return this.DataService.getAllKabupaten(kabupaten);
  }

  @UseGuards(JwtGuard)
  @Get('/kabupaten/:kabupaten/page/:page')
  async getDataKabupaten(
    @Param('kabupaten') kabupaten: string,
    @Param('page') page: string,
  ) {
    return this.DataService.getByKabupaten(kabupaten, parseInt(page));
  }

  //udah
  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Get('/list/kecamatan')
  async getListKecamatan() {
    return this.DataService.getListKecamatan();
  }

  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
  @Get('/all/kabupaten/:kabupaten/kecamatan/:kecamatan')
  async getAllKecamatan(
    @Param('kabupaten') kabupaten: string,
    @Param('kecamatan') kecamatan: string,
  ) {
    return this.DataService.getAllDataByKecamatan(kabupaten, kecamatan);
  }

  //udah
  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Post('add')
  async addData(@Body() dto: AddDataDto) {
    return this.DataService.addData(dto);
  }

  @UseGuards(JwtGuard)
  @Get('/id/:id')
  async getDataById(@Param('id') id: string) {
    return this.DataService.getDataById(parseInt(id));
  }

  @UseGuards(JwtGuard)
  @Patch('edit/:id')
  @UseInterceptors(FileInterceptor('file'))
  async editData(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: EditData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.DataService.editDataById(parseInt(id), dto, file, req);
  }

  @UseGuards(JwtGuard)
  @Patch('/delete/:id')
  async deleteById(@Param('id') id: string, @Request() req: any) {
    return this.DataService.deleteById(parseInt(id), req);
  }
}
