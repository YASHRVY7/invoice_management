import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext, ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles=this.reflector.get<Role[]>('roles',context.getHandler());
    if(!requiredRoles||requiredRoles.length===0)return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && requiredRoles.includes(user.role);
  }
}
