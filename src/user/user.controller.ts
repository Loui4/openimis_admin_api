import { Controller, Get, Post, Put, Delete, Param, Body, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { LoginUserDto } from 'src/price-list/dtos/login-user.dto';


@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with username and password' })
  @ApiOkResponse({ description: 'User authenticated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  async login(@Body() dto: LoginUserDto) {
    // 1️⃣ Find user by username
    const user = await this.userService.findByUsername(dto.username)
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // 2️⃣ Verify password
    const isValid = this.userService.verifyPassword(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // 3️⃣ Return user info (or JWT if using authentication)
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isStaff: user.is_staff,
        isSuperuser: user.is_superuser,
      },
    };
  }
}
