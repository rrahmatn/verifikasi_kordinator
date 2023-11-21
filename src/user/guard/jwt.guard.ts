import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { JwtService } from '@nestjs/jwt';
  import { AuthGuard } from '@nestjs/passport';
  
  @Injectable()
  export class JwtGuard extends AuthGuard('jwt') {
    constructor(
      private jwtService: JwtService,
      private Config: ConfigService,
    ) {
      super();
    }
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
    //   console.log(token);
  
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.Config.get('JWT_SECRET'),
        });
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request['user'] = payload;
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }
  
    private extractTokenFromHeader(request: any): any | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  