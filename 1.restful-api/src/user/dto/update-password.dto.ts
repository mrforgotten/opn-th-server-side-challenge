import {
  IsString,
  IsStrongPassword,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { isStrongPasswordOptions } from 'src/util/password';

export class UserUpdatePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @IsStrongPassword(isStrongPasswordOptions)
  newPassword: string;

  @ValidateIf((o) => o.newPassword === o.confirmNewPassword)
  confirmNewPassword: string;
}
