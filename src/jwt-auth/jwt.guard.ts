import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { envConfig } from "@/common/config/env";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers["authorization"];
    if (!token) throw new UnauthorizedException("Unauthorized Access");

    // verify the tokens
    const verify = await this.verifyToken(token as string);
    // decode the token and save in request object
    if (verify) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const user = await this.jwtService.decode(token.split(" ")[1]);
      request.user = user;
      return true;
    }
    return false;
  }

  async verifyToken(token: string) {
    // check for bearer mark
    const checkBearer = token.split(" ")[0];
    if (checkBearer !== "Bearer")
      throw new UnauthorizedException("Unauthorized Access");

    // check for token
    const checkToken = token.split(" ")[1];
    if (!checkToken) throw new UnauthorizedException("Unauthorized Access");

    // verify the token
    const verify = await this.jwtService.verifyAsync(checkToken, {
      secret: envConfig("JWT_SECRET"),
    });
    if (!verify) throw new UnauthorizedException("Unauthorized Access");
    return true;
  }
}
