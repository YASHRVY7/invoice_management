import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from 'src/controllers/auth/auth.controller';
import { AuthService } from 'src/services/auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/jwt.strategy';



@Module({

    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: (config.get<string | number>('JWT_EXPIRATION') ?? '1h') as any },
            }), 
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],

})
export class AuthModule {

}
