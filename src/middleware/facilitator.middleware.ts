import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../lib/jwt/jwt.service';

interface TokenPayload {
  id: number;
  role: string;
}

@Injectable()
export class FacilitatorMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) throw new UnauthorizedException('No token provided');

      const token = authHeader.split(' ')[1];

      const payload = this.jwtService.verify(token) as TokenPayload;

      if (payload.role !== 'Facilitator') {
        throw new UnauthorizedException('Access denied: Facilitators only');
      }

      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
