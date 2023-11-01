import {
    MinLength,
    MaxLength,
    IsNotEmpty,
    IsString,
    IsEmail,
    isString,
    Matches
  } from 'class-validator';
  
  export class EditDto {

    @IsNotEmpty()
    @IsString()
    nama: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/, {
      message: 'Password harus mengandung setidaknya satu huruf besar, satu angka, dan satu karakter khusus.'
    })
    oldPassword: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/, {
      message: 'Password harus mengandung setidaknya satu huruf besar, satu angka, dan satu karakter khusus.'
    })
    newPassword: string;
  }