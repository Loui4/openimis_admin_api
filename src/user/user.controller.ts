import { Public } from './public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, Put, Delete, UnauthorizedException, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginUserDto } from 'src/price-list/dtos/login-user.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return JWT token' })
  async login(@Body() dto: LoginUserDto) {
    const user = await this.userService.findByUsername(dto.username);
    if (!user) throw new UnauthorizedException('Invalid username or password');

    const isValid = this.userService.verifyPassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid username or password');

    const payload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isStaff: user.is_staff,
        isSuperuser: user.is_superuser,
      },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return req.user;
  }
}
