import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsStrongPassword,
  IsString,
  IsEnum,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Address } from 'src/data-store/type/address.type';
import { Gender } from 'src/data-store/type/gender.type';
import { isStrongPasswordOptions } from 'src/util/password';

export class RegisterFormDto {
  @IsEmail()
  email: string;

  @IsStrongPassword(isStrongPasswordOptions)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @IsDateString()
  dob: string;

  @IsEnum(Gender)
  gender: Gender;

  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsBoolean()
  isSubscribe: boolean;
}
