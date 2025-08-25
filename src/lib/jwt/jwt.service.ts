import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret = 'your-secret-key';

  sign(payload: any) {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' });
  }

  verify(token: string) {
    return jwt.verify(token, this.secret);
  }
}
