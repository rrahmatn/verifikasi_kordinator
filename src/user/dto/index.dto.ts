import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddUserDto{
    @IsString()
    @ApiProperty()
    @IsOptional()
    nama : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    username : string

    @IsString()
    @ApiProperty()
    @IsOptional()
    telepon : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    password : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    confPassword : string

}
export class EditUser{
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    nama : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    telepon : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    password : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    confPassword : string

}

export class Signin {
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    username : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    password : string

}