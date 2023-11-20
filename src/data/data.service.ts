// upload.service.ts

import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';
import { AddDataDto, EditData, FilterKecamatanDto } from './dto/data.dto';
import { join } from 'path';
import { createWriteStream, readFileSync } from 'fs';
import { readFile } from 'fs/promises';

@Injectable()
export class DataService {
  private readonly prisma = new PrismaClient();

  async deleteAll() {
    const response = await this.prisma.verifikasi_koordinator.deleteMany();

    return response;
  }

  async deleteById(id: number) {
    const user = await this.prisma.verifikasi_koordinator.delete({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('data user tidak ditemukan');
    }

    return {
      message: `data ${user.nama} berhasil di hapus`,
      user,
    };
  }

  async convertExcelToJson(file: Express.Multer.File): Promise<any[]> {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      let jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Hapus kolom "NO" dan ubah kunci menjadi huruf kecil
      jsonData = jsonData.map((data) => {
        // Hapus nilai dan baris dari kolom "NO"

        if (data['NO']) {
          delete data['NO'];
        }
        if (data['no']) {
          delete data['no'];
        }
        if (data['no.']) {
          delete data['no.'];
        }
        if (data['No.']) {
          delete data['No.'];
        }

        // Ubah semua kunci menjadi huruf kecil
        const newData = {};
        Object.keys(data).forEach((key) => {
          newData[key.toLowerCase()] = data[key];
        });

        // Ubah nilai dari kolom "tps", "rt", "rw", dan "nik" menjadi string
        newData['tps'] = String(newData['tps']);
        newData['rt'] = String(newData['rt']);
        newData['rw'] = String(newData['rw']);
        if (newData['nik']) {
          newData['nik'] = String(newData['nik']);
        }

        // Gantikan kunci "No. Hp" dengan "telepon" dan ubah nilainya menjadi string
        if (newData['no. hp']) {
          newData['telepon'] = String(newData['no. hp']);
          delete newData['no. hp'];
        }
        if (newData['no.']) {
          delete newData['no.'];
        }
        if (newData['kec']) {
          newData['kecamatan'] = String(newData['kec']);
          delete newData['kec'];
        }

        return newData;
      });

      return jsonData;
    } catch (error) {
      throw new Error('Error converting Excel to JSON');
    }
  }

  async saveJsonToDatabase(jsonData: any[]) {
    await this.connectPrisma();

    try {
      // Iterasi setiap data JSON
      // Iterasi setiap data JSON

      let sameNik: string[] = [];
      for (const data of jsonData) {
        // Cek apakah data dengan NIK tersebut sudah ada di database

        if (data.nik) {
          const existingData =
            await this.prisma.verifikasi_koordinator.findFirst({
              where: { nik: data.nik },
            });

          // Jika data belum ada, simpan data baru
          if (!existingData) {
            await this.prisma.verifikasi_koordinator.create({
              data,
            });
          } else {
            sameNik.push(existingData.nik);
          }
        } else {
          await this.prisma.verifikasi_koordinator.create({
            data,
          });
        }
      }

      return {
        message: 'berhasil menambahkan file ke database',
        status: 200,
        error: sameNik,
      };
    } catch (error) {
      throw new Error('Error saving data to database');
    } finally {
      await this.disconnectPrisma();
    }
  }

  private async connectPrisma(): Promise<void> {
    try {
      await this.prisma.$connect();
    } catch (error) {
      throw new Error('Error connecting to Prisma');
    }
  }

  private async disconnectPrisma(): Promise<void> {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      throw new Error('Error disconnecting from Prisma');
    }
  }

  async getData(page: number) {
    const pages = page * 100;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        orderBy: {
          created_at: 'desc',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
          jumlah: belumTerverifikasi + disetujui + ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }
  async getAllData() {
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        orderBy: {
          status: 'desc',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
          jumlah: belumTerverifikasi + disetujui + ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getDataByName(nama: string, page: number) {
    const pages = page * 100;
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              nama: {
                contains: nama.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              nama: {
                contains: nama,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('tidak menemukan data');
      }

      return {
        message: `berhasil mendapatkan ${response.length} data yang serupa`,
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak menemukan data');
    }
  }

  async getDataByUnverified(page: number) {
    const pages: number = page * 100;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          status: 'belum terverifikasi',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }
  async getAllDataByUnverified() {
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        where: {
          status: 'belum terverifikasi',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }
  async getDataByUnverifiedAndName(page: number, nama: string) {
    const pages: number = page * 100;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              nama: {
                contains: nama.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              nama: {
                contains: nama,
                mode: 'insensitive',
              },
            },
          ],

          status: 'belum terverifikasi',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getDataByVerified(page: number) {
    const pages: number = 100 * page;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }
  async getAllDataByVerified() {
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }
  async getDataByVerifiedAndName(page: number, nama: string) {
    const pages: number = 100 * page;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              nama: {
                contains: nama.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              nama: {
                contains: nama,
                mode: 'insensitive',
              },
            },
          ],
          status: 'verifikasi disetujui',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getDataByNotAllowed(page: number) {
    const pages: number = 100 * page;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          status: 'verifikasi ditolak',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }
  async getAllDataByNotAllowed() {
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        where: {
          status: 'verifikasi ditolak',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }
  async getDataByNotAllowedAndName(page: number, nama: string) {
    const pages: number = 100 * page;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              nama: {
                contains: nama.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              nama: {
                contains: nama,
                mode: 'insensitive',
              },
            },
          ],

          status: 'verifikasi ditolak',
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            status: 'belum terverifikasi',
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi disetujui',
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          status: 'verifikasi ditolak',
        },
      });

      return {
        message: 'berhasil mendapatkan data',
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getByKabupaten(kabupaten: string, page: number) {
    const pages: number = 100 * page;
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          status: 'desc',
        },
      });
      const jumlah = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
            ],
          },
        },
      );
      const verifikasiDisetujui =
        await this.prisma.verifikasi_koordinator.count({
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                status: 'verifikasi disetujui',
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
                status: 'verifikasi disetujui',
              },
            ],
          },
        });
      const verifikasiDitolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
          ],
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('tidak ada data ditemukan');
      }

      return {
        message: `berhasil mendapatkan ${response.length} data`,
        response,
        jumlah: {
          jumlah,
          belumTerverifikasi,
          disetujui: verifikasiDisetujui,
          ditolak: verifikasiDitolak,
        },
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getAllKabupaten(kabupaten: string) {
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          status: 'desc',
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('tidak ada data ditemukan');
      }

      return {
        message: `berhasil mendapatkan ${response.length} data`,
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  private cleanAndFilterKecamatan(entries : any) {
    return entries
      .map((entry : any) => entry.kecamatan)
      .filter((kecamatan : string | undefined) => kecamatan !== undefined && kecamatan.trim() !== '' && kecamatan.trim() !== "undefined");
  }

  async getListKecamatan() {
    const uniqueKecamatans = await this.prisma.verifikasi_koordinator.findMany({
      distinct: ['kecamatan'],
    });

    const paraKecamatan = this.cleanAndFilterKecamatan(uniqueKecamatans);

    if (paraKecamatan.length < 1) {
      throw new NotFoundException('Tidak ada data kecamatan yang terdaftar di database');
    }

    const uniqGarut = await this.prisma.verifikasi_koordinator.findMany({
      where: {
        OR: [
          {
            kabupaten: {
              contains: "kabupaten garut",
              mode: 'insensitive',
            },
          },
          {
            kabupaten: {
              contains: "kabupatengarut",
              mode: 'insensitive',
            },
          },
        ],
      },
      distinct: ['kecamatan'],
    });

    const paraKecamatanGarut = this.cleanAndFilterKecamatan(uniqGarut);

    const uniqTasik = await this.prisma.verifikasi_koordinator.findMany({
      where: {
        OR: [
          {
            kabupaten: {
              contains: "kabupaten tasikmalaya",
              mode: 'insensitive',
            },
          },
          {
            kabupaten: {
              contains: "kabupatentasikmalaya",
              mode: 'insensitive',
            },
          },
        ],
      },
      distinct: ['kecamatan'],
    });

    const paraKecamatanTasik = this.cleanAndFilterKecamatan(uniqTasik);

    const uniqKotaTasik = await this.prisma.verifikasi_koordinator.findMany({
      where: {
        OR: [
          {
            kabupaten: {
              contains: "kota tasikmalaya",
              mode: 'insensitive',
            },
          },
          {
            kabupaten: {
              contains: "kotatasikmalaya",
              mode: 'insensitive',
            },
          },
        ],
      },
      distinct: ['kecamatan'],
    });

    const paraKecamatanKotaTasik = this.cleanAndFilterKecamatan(uniqKotaTasik);

    return {
      message: `Berhasil mendapatkan ${paraKecamatan.length} data kecamatan`,
      kecamatan: {
        semua: paraKecamatan,
        kabupatenGarut: paraKecamatanGarut,
        kabupatenTasik: paraKecamatanTasik,
        kotaTasik: paraKecamatanKotaTasik,
      },
    };
  }



  async getDataByKecamatan(kabupaten: string, kecamatan: string, page: number) {
    const pages: number = 100 * page;
    try {
      const uniqueKecamatans =
        await this.prisma.verifikasi_koordinator.findMany({
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
              },
            ],
          },

          distinct: ['kecamatan'],
        });

      const paraKecamatan = uniqueKecamatans.map((entry) => entry.kecamatan);

      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          status: 'desc',
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('Data tidak ditemukan');
      }

      const length = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan,
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
            ],
          },
        },
      );

      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi disetujui',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: 'verifikasi disetujui',
            },
          ],
        },
      });

      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
          ],
        },
      });

      return {
        message: `Berhasil mendapatkan ${response.length} dari ${length} data`,
        jumlah: {
          jumlah : length,
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        paraKecamatan, // Menambahkan nilai-nilai unik kecamatan ke respons
        response,
      };
    } catch (error) {
      throw new NotFoundException('Tidak ada data ditemukan');
    }
  }

  async getDataByKabupatenAndName(
    kabupaten: string,
    nama: string,
    page: number,
  ) {
    const pages: number = 100 * page;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              nama: {
                contains: nama.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              nama: {
                contains: nama,
                mode: 'insensitive',
              },
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('data tidak ditemukan');
      }
      const length = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
            ],
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi disetujui',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },

              status: 'verifikasi disetujui',
            },
          ],
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
          ],
        },
      });

      return {
        message: `berhasil mendapatkan ${response.length} dari ${length} data`,
        jumlah: {
          jumlah: length,
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getAllDataByKecamatan(kabupaten: string, kecamatan: string) {
    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('data tidak ditemukan');
      }
      const length = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      return {
        message: `berhasil mendapatkan ${response.length} dari ${length} data`,
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        length,
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getDataByKecamatanAndStatus(
    kabupaten: string,
    kecamatan: string,
    status: string,
    page: number,
  ) {
    const pages: number = 100 * page;

    let inistatus: string;

    if (status.toLowerCase() === '') {
      inistatus = '';
    } else if (status.toLowerCase() === 'unverified') {
      inistatus = 'belum terverifikasi';
    } else if (status.toLowerCase() === 'verified') {
      inistatus = 'verifikasi disetujui';
    } else if (status.toLowerCase() === 'notverified') {
      inistatus = 'verifikasi ditolak';
    }

    try {
      const uniqueKecamatans =
        await this.prisma.verifikasi_koordinator.findMany({
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
              },
            ],
          },
          distinct: ['kecamatan'],
        });

      const paraKecamatan = uniqueKecamatans.map((entry) => entry.kecamatan);
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: inistatus,
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: inistatus,
            },
          ],
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('data tidak ditemukan');
      }
      const length = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: inistatus,
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: inistatus,
            },
          ],
        },
      });

      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan,
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
            ],
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi disetujui',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: 'verifikasi disetujui',
            },
          ],
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
          ],
        },
      });

      return {
        message: `berhasil mendapatkan ${response.length} dari ${length} data`,
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        paraKecamatan,
        length,
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async getDataByKecamatanAndName(
    kabupaten: string,
    kecamatan: string,
    nama: string,
    page: number,
  ) {
    const pages: number = 100 * page;

    try {
      const response = await this.prisma.verifikasi_koordinator.findMany({
        skip: pages,
        take: 100,
        where: {
          OR: [
            {
              nama: {
                contains: nama.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              nama: {
                contains: nama,
                mode: 'insensitive',
              },
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      if (response.length < 1) {
        throw new NotFoundException('data tidak ditemukan');
      }
      const length = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      const belumTerverifikasi = await this.prisma.verifikasi_koordinator.count(
        {
          where: {
            OR: [
              {
                kabupaten: {
                  contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
              {
                kabupaten: {
                  contains: kabupaten,
                  mode: 'insensitive',
                },
                kecamatan: {
                  contains: kecamatan,
                  mode: 'insensitive',
                },
                status: 'belum terverifikasi',
              },
            ],
          },
        },
      );
      const disetujui = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi disetujui',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: 'verifikasi disetujui',
            },
          ],
        },
      });
      const ditolak = await this.prisma.verifikasi_koordinator.count({
        where: {
          OR: [
            {
              kabupaten: {
                contains: kabupaten.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan.toLowerCase().replace(/\s/g, ''),
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
            {
              kabupaten: {
                contains: kabupaten,
                mode: 'insensitive',
              },
              kecamatan: {
                contains: kecamatan,
                mode: 'insensitive',
              },
              status: 'verifikasi ditolak',
            },
          ],
        },
      });

      return {
        message: `berhasil mendapatkan ${response.length} dari ${length} data`,
        jumlah: {
          belumTerverifikasi,
          disetujui,
          ditolak,
        },
        length,
        response,
      };
    } catch (error) {
      throw new NotFoundException('tidak ada data ditemukan');
    }
  }

  async addData(dto: AddDataDto) {
    try {
      const response = await this.prisma.verifikasi_koordinator.create({
        data: {
          ...dto,
        },
      });

      if (!response) {
        throw new BadRequestException('data tidak valid');
      }

      return {
        message: 'berhasil menambahkan data',
        response,
      };
    } catch (error) {
      throw new BadGatewayException('data tidak valid');
    }
  }

  async getDataById(id: number) {
    try {
      const response = await this.prisma.verifikasi_koordinator.findUnique({
        where: {
          id: id,
        },
      });

      if (!response) {
        throw new BadRequestException('Data tidak ditemukan');
      }

      return {
        message: 'Berhasil mendapatkan data',
        response,
        status: 200,
      };
    } catch (error) {
      throw new BadRequestException('Data tidak valid');
    }
  }

  async arrayBufferToBase64(buffer: Buffer): Promise<string> {
    return buffer.toString('base64');
  }

  async editDataById(id: number, dto: EditData, foto_ktp: Express.Multer.File) {
    try {
      const base64String = foto_ktp
        ? await this.arrayBufferToBase64(foto_ktp.buffer)
        : '';

      const response = await this.prisma.verifikasi_koordinator.update({
        where: {
          id,
        },
        data: {
          image64: base64String,
          ...dto,
        },
      });

      if (!response) {
        throw new BadGatewayException('Gagal mengedit data');
      }

      return {
        message: `Berhasil mengedit ${response.nama}`,
        response,
        base64String,
      };
    } catch (error) {
      throw new BadRequestException('Data tidak valid');
    }
  }
}
