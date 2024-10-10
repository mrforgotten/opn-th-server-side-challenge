import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUserDataDto } from '../dto';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUserDataDto =>
    ctx.switchToHttp().getRequest().user,
);
