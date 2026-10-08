import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import { CredentialsDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly jwt: JwtService,
  ) {}

  async register({ email, password }: CredentialsDto) {
    if (await this.users.exists({ email: email.toLowerCase() })) {
      throw new ConflictException('Email already registered');
    }
    const user = await this.users.create({ email, passwordHash: await bcrypt.hash(password, 10) });
    return { id: user.id, email: user.email, role: user.role };
  }

  async login({ email, password }: CredentialsDto) {
    const user = await this.users.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { accessToken };
  }
}
