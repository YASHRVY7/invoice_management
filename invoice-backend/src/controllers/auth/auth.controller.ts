import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from 'src/dto/login.dto';
import { SignupDto } from 'src/dto/signup.dto';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto.username, signupDto.email, signupDto.password)
    }


    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        return this.authService.login(user);
    }
}
