import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Em produção, isso deve ser a chave pública (RS256) do Realm do Keycloak
      // Lida a partir do process.env.KEYCLOAK_PUBLIC_KEY
      const secretOrPublicKey = process.env.KEYCLOAK_PUBLIC_KEY || 'development-secret-key';
      
      // O método verify valida a assinatura criptográfica e a expiração do token
      const payload = jwt.verify(token, secretOrPublicKey, {
        algorithms: process.env.KEYCLOAK_PUBLIC_KEY ? ['RS256'] : ['HS256', 'RS256'],
      }) as jwt.JwtPayload;
      
      if (!payload.sub) {
        throw new UnauthorizedException('Token does not contain a subject (sub) claim');
      }

      // Injeta o ID do usuário (sub) no objeto da requisição
      request.user = { id: payload.sub };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }
}
