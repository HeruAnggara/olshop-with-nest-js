import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, Matches, IsInt } from "class-validator";

export class RegisterDto {
  
  id: string;

  akun_id: string;

  @IsNotEmpty()
  @IsInt()
  kecamatan_id: number;

  @IsNotEmpty()
  @IsInt()
  kota_id: number;

  @IsNotEmpty()
  @IsInt()
  provinsi_id: number;

  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  no_wa: string;

  @IsString()
  alamat:string

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)
  password: string;

}