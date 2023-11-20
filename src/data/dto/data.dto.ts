import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';

export class FilterKecamatanDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  kecamatan?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  status?:
    | 'belum terverifikasi'
    | 'verifikasi disetujui'
    | 'verifikasi ditolak'
    | '';
}

export class EditData {
  @ApiProperty()
  @IsOptional()
  @IsString()
  nik?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber('ID', {
    message: 'Telepon harus berupa nomor telepon Indonesia',
  })
  telepon?: string;


  @ApiProperty()
  @IsOptional()
  @IsString()
  kabupaten?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  kecamatan?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  desa?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rw?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tps?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status? =
    'belum terverifikasi' || 'verifikasi disetujui' || 'verifikasi ditolak';


  @IsOptional()
  foto_ktp?: string | {}

  @ApiProperty()
  @IsOptional()
  @IsString()
  alasan?: string;
}
export class AddDataDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  nik?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber('ID', {
    message: 'Telepon harus berupa nomor telepon Indonesia',
  })
  telepon?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  kabupaten?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  kecamatan?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  desa?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rw?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  tps?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status =
    'belum terverifikasi' || 'verifikasi disetujui' || 'verifikasi ditolak';

  @ApiProperty()
  @IsOptional()
  @IsString()
  alasan?: string;
}
