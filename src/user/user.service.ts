import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { ResponseHandler } from 'src/common/utils/response-handler.utils';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtAuthService
  ) { }

  async create(createUserDto: CreateUserDto) {
    console.log('api hit')
    const { email, contactNumber, name, password } = createUserDto
    const checkUserExits = await this.userRepository.findOne({
      where: {
        email: email
      }
    })

    if (checkUserExits) throw new BadRequestException('User already exists')

    // hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword
    })

    const newUser = await this.userRepository.save(user)
    console.log(newUser)

    return new ResponseHandler('User created successfully', 201, true, newUser)
  }

  async login(loginUserDto: LoginDto) {
    const { email, password } = loginUserDto

    const user = await this.userRepository.findOne({
      where: { email: email },
    })

    if (!user) throw new BadRequestException('Invalid credentials')

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) throw new BadRequestException('Invalid credentials')

    const accessToken = await this.jwtService.generateToken({ id: user.id }, {
      expiresIn: '5d'
    })

    console.log(accessToken)
    return new ResponseHandler('Login successful', 200, true, { ...user, accessToken })
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
     where : {
      id
     } 
    })

    if(!user) throw new NotFoundException('User not found')

    return new ResponseHandler('User found', 200, true, user)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const {email, contactNumber} = updateUserDto
    const checkEmailOrContactNumber = await this.userRepository.findOne({
      where : [
        {email},
        {contactNumber}
      ]
    })

    if(checkEmailOrContactNumber) throw new ConflictException('Email or contact number already exists')

    const updateUser = await this.userRepository.update(id, updateUserDto)

    return new ResponseHandler('User updated successfully', 200, true, updateUser)
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
