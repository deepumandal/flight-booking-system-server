import { Controller, Get, Post, Body, Patch, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("sign-up")
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("login")
  async login(@Body() loginUserDto: LoginDto, @Res() res: Response) {
    return res.send(await this.userService.login(loginUserDto, res));
  }
  @Post("logout")
  async logout(@Res() res: Response) {
    return res.send(await this.userService.logout(res));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
