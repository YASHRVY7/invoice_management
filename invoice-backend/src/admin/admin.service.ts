import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class AdminService {
    constructor(@InjectRepository(User)
    private userRepository: Repository<User>) {}


    async getUserCount():Promise<number>{
        return this.userRepository.count();
    }

    async getAllUsers():Promise<User[]>{
        return this.userRepository.find({ select: ['id', 'username', 'email', 'role', 'isActive'] });
    }

    async getLogs(limit = 15): Promise<any[]> {
        const recentUsers = await this.userRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
            select: ['id', 'username', 'email', 'role', 'createdAt'],
        });

        return recentUsers.map((user) => ({
            id: user.id,
            action: 'User created',
            user: user.username,
            email: user.email,
            role: user.role,
            date: user.createdAt,
        }));
      }

    async removeUser(userId: number): Promise<void> {
        const result = await this.userRepository.delete(userId);
        if (!result.affected) {
            throw new NotFoundException('User not found');
        }
    }

}

