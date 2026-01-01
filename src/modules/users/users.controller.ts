import { Controller, Get, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Lister tous les utilisateurs (Admin/Manager)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.usersService.findAll(),
      this.usersService.getUserStats(),
    ]);
    
    return {
      data: users,
      meta: {
        total: total.totalUsers,
        page,
        limit,
        totalPages: Math.ceil(total.totalUsers / limit),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les informations d\'un utilisateur' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  // @Roles('ADMIN')
  @ApiOperation({ summary: 'Désactiver un utilisateur (Admin)' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('stats/overview')
  // @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Obtenir les statistiques des utilisateurs' })
  async getStats() {
    return this.usersService.getUserStats();
  }
}