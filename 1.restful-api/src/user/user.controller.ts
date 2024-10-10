import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserUpdateDto, UserUpdatePasswordDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import {
  BLANK_UPDATE,
  NEW_AND_CONFIRM_PASSWORD_NOT_MATCH,
  NOT_FOUND,
  PASSWORD_MISMATCH,
  PASSWORD_NOT_STRONG,
} from 'src/data-store/constant/store-error-message';

@UsePipes(ValidationPipe)
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  errorHandling(e: Error) {
    switch (e.message) {
      case NOT_FOUND:
      case BLANK_UPDATE:
      case PASSWORD_NOT_STRONG:
      case NEW_AND_CONFIRM_PASSWORD_NOT_MATCH:
        throw new BadRequestException(e.message);
      case PASSWORD_MISMATCH:
        throw new UnauthorizedException();
    }
  }

  @Get('/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    try {
      const data = await this.userService.findById(id);
      return data;
    } catch (e) {
      this.errorHandling(e);
    }
  }

  @Post('/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UserUpdateDto,
  ) {
    try {
      const updated = await this.userService.update(id, updateData);
      return updated;
    } catch (e) {
      this.errorHandling(e);
    }
  }

  @Post('/update-password/:id')
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UserUpdatePasswordDto,
  ) {
    try {
      const updated = await this.userService.updatePassword(id, updateData);
      return updated;
    } catch (e) {
      this.errorHandling(e);
    }
  }

  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      const deleted = await this.userService.delete(id);
      return deleted;
    } catch (e) {
      this.errorHandling(e);
    }
  }
}
