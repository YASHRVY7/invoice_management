import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';



@Injectable()
export class AuthService {

    constructor(@InjectRepository(User)
    private userRepository:Repository<User>,
    private jwtService: JwtService, 
    ){}


    async signup(username: string, email: string, password: string):Promise<User>{
        const existingUser=await this.userRepository.findOne({ where: [{ username }, { email }] });

        if(existingUser){
            throw new ConflictException('Username or Email already exists');
        }
        const hashedPassword=await bcrypt.hash(password,12);
        const newUser=this.userRepository.create({
            username,
            email,
            password:hashedPassword,
        })
        return this.userRepository.save(newUser)
    }

    async login(user:User){
        const payload={
            username: user.username,
            sub: user.id,
            role: user.role,
            isActive: user.isActive
        }
        return{
            access_token: this.jwtService.sign(payload),
        }
    }

    async validateUser(username: string, pass: string):Promise<User>{
        const user=await this.userRepository.findOne({where: { username }});
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');
        return user;    
    }
}
