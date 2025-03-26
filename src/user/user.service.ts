import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { ResponseHandler } from "src/common/utils/response-handler.utils";
import { JwtAuthService } from "src/jwt-auth/jwt-auth.service";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { isLocalEnv } from "@/common/utils/constants";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtAuthService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const checkUserExits = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (checkUserExits) throw new BadRequestException("User already exists");

    // hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password, ...rest } = await this.userRepository.save(user);

    return new ResponseHandler("User created successfully", 201, true, rest);
  }

  async login(loginUserDto: LoginDto, res: Response) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!user) throw new BadRequestException("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new BadRequestException("Invalid credentials");

    const accessToken = await this.jwtService.generateToken(
      { id: user.id },
      {
        expiresIn: "5d",
      }
    );

    this.CookieResponse(res, accessToken);

    const { password: _, ...rest } = user;

    return new ResponseHandler("Login successful", 200, true, {
      ...rest,
    });
  }

  async logout(res: Response) {
    this.CookieResponse(res, "");

    return new ResponseHandler("Logout successful", 200, true, {});
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException("User not found");

    return new ResponseHandler("User found", 200, true, user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { email, contactNumber } = updateUserDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { contactNumber }],
    });

    if (existingUser && existingUser.id !== id) {
      throw new ConflictException("Email or contact number already exists");
    }

    await this.userRepository.update(id, updateUserDto);

    const data = await this.userRepository.findOne({
      where: { id },
      select: [
        "id",
        "name",
        "email",
        "contactNumber",
        "createdAt",
        "updatedAt",
      ],
    });

    return new ResponseHandler("User updated successfully", 200, true, data);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  CookieResponse(response: Response, value: string): void {
    response.cookie("token", value, {
      httpOnly: true, // Prevents client-side access to the cookie
      secure: !isLocalEnv(), // Use secure cookies in production
      maxAge: 60 * 60 * 1000, // 1 hour expiration,
      // domain: envConfig<string>("APP_BASE_URL"),
      sameSite: "strict",
    });
  }
}
