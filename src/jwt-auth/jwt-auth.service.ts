import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}
  async generateToken(payload: any, options?: JwtSignOptions) {
    const token = await this.jwtService.sign(payload, options);
    return token;
  }
}
