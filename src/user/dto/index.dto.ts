import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddUserDto{
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    nama : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    email : string

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
    email : string

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    password : string

}