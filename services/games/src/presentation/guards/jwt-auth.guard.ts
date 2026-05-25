import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private client: jwksClient.JwksClient;

  constructor() {
    this.client = jwksClient({
      jwksUri: 'http://keycloak:8080/realms/crash-game/protocol/openid-connect/certs'
    });
  }

  private getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
    this.client.getSigningKey(header.kid, (err, key) => {
      if (err || !key) {
        return callback(err || new Error('No signing key found'));
      }
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await new Promise<jwt.JwtPayload>((resolve, reject) => {
        jwt.verify(token, this.getKey, { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded as jwt.JwtPayload);
        });
      });
      
      if (!payload.sub) {
        throw new UnauthorizedException('Token does not contain a subject (sub) claim');
      }

      request.user = { id: payload.sub };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }
}
