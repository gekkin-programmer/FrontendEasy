import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private prisma: PrismaService) {
    super();
  }

  serializeUser(user: any, done: CallableFunction) {
    done(null, { id: user.id });
  }

  async deserializeUser(payload: any, done: CallableFunction) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          accountType: true,
          emailVerified: true,
        },
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
