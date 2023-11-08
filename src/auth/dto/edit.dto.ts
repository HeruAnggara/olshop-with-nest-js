import {
    MinLength,
    MaxLength,
    IsNotEmpty,
    IsString,
    IsEmail,
    Matches,
    IsInt,
  } from 'class-validator';
  
  export class EditDto {

    @IsNotEmpty()
    @IsString()
    nama: string;

    @IsNotEmpty()
    no_wa: string

    @IsNotEmpty()
    alamat: string

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
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/, {
      message: 'Password harus mengandung setidaknya satu huruf besar, satu angka, dan satu karakter khusus.'
    })
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/, {
      message: 'Password harus mengandung setidaknya satu huruf besar, satu angka, dan satu karakter khusus.'
    })
    newPassword: string;
  }