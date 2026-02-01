import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplyCreatorFundDto } from './dto/apply-creator-fund.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class CreatorFundService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: string, dto: ApplyCreatorFundDto) {
    // Check if already applied
    const existing = await this.prisma.creatorApplication.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (existing) {
      throw new BadRequestException('You already have a pending application.');
    }

    return this.prisma.creatorApplication.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getMyApplication(userId: string) {
    return this.prisma.creatorApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllApplications() {
    return this.prisma.creatorApplication.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.creatorApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.creatorApplication.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedAt: new Date(),
        // In a real app, capture admin ID here
      },
    });
  }
}