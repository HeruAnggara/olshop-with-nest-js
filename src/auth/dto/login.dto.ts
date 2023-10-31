import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength, Matches } from "class-validator";

export class LoginDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)
  password: string;

}