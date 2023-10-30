import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthGuard as AuthGuardPassport } from '@nestjs/passport';

export class AuthGuard extends AuthGuardPassport('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, akun, info) {
    if (err || !akun) {
      throw err || new UnauthorizedException();
    }
    return akun;
  }
}