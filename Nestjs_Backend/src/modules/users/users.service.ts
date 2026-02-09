import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { AppEventsGateway } from '../app-events/app-events.gateway';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: AppEventsGateway,
  ) {}

  async findAll(skip: number = 0, take: number = 10) {
    return this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        accountType: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        accountType: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = createUserDto.password 
      ? await bcrypt.hash(createUserDto.password, 10)
      : null;

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        phone: createUserDto.phone,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        avatar: createUserDto.avatar,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        accountType: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateData: any = { ...updateUserDto };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        accountType: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
        updatedAt: true,
      },
    });

    // Notify user-specific room
    this.eventsGateway.sendToUser(id, 'user_updated', updatedUser);

    // Broadcast to all workspaces the user belongs to
    const memberships = await this.prisma.workspaceMember.findMany({
        where: { userId: id },
        select: { workspaceId: true }
    });

    for (const m of memberships) {
        this.eventsGateway.sendToWorkspace(m.workspaceId, 'user_updated', updatedUser);
    }

    return updatedUser;
  }

  async delete(id: string) {
    // Soft delete by setting status to INACTIVE
    return this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { status: 'ACTIVE' },
    });
    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return { 
      totalUsers, 
      activeUsers, 
      newUsersThisMonth,
      inactiveUsers: totalUsers - activeUsers,
    };
  }

  async upgradeToPro(id: string, planType: string = 'PROFESSIONAL') {
    return this.prisma.user.update({
      where: { id },
      data: { planType: planType as any },
      select: { id: true, email: true, planType: true },
    });
  }

  async setPlan(id: string, planType: any) {
    return this.prisma.user.update({
      where: { id },
      data: { planType },
      select: { id: true, email: true, planType: true },
    });
  }
}