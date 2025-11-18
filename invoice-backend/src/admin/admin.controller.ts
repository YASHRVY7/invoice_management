import { Controller, Delete, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './decorator/roles.decorator';
import { Role } from './enum/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }


    @Get('users')
    @Roles(Role.Admin)
    async getUsers() {
        const [users, total] = await Promise.all([
            this.adminService.getAllUsers(),
            this.adminService.getUserCount(),
        ]);
        return { total, users };
    }

    @Get('logs')
    @Roles(Role.Admin)
    async getLogs() {
      return { logs: await this.adminService.getLogs() };
    }

    @Delete('users/:id')
    @Roles(Role.Admin)
    async removeUser(@Param('id', ParseIntPipe) userId: number) {
        await this.adminService.removeUser(userId);
        return { success: true };
    }
}
