import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { IAuthService, IJwtPayload, IAuthResponse } from './interfaces/auth.interface.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private firebaseApp: admin.app.App;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      const serviceAccount = JSON.parse(
        this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT', '{}')
      );

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      });

      this.logger.log('Firebase Admin SDK initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error.message);
    }
  }

  async validateFirebaseToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      this.logger.error('Firebase token validation failed:', error.message);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async login(loginDto: LoginDto): Promise<IAuthResponse> {
    try {
      // If Firebase token is provided, validate it
      if (loginDto.firebaseToken) {
        const decodedToken = await this.validateFirebaseToken(loginDto.firebaseToken);
        return this.createAuthResponse({
          sub: decodedToken.uid,
          email: decodedToken.email!,
          tenantId: loginDto.tenantId || 'default',
        });
      }

      // Traditional email/password authentication
      if (loginDto.email && loginDto.password) {
        // TODO: Implement actual user validation against your user database
        // This should query your User entity and validate the password hash
        const user = await this.validateEmailPassword(loginDto.email, loginDto.password);
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }

        return this.createAuthResponse({
          sub: user.id,
          email: user.email,
          tenantId: user.tenantId,
        });
      }

      throw new UnauthorizedException('Invalid login method');
    } catch (error) {
      this.logger.error('Login failed:', error.message);
      throw error;
    }
  }

  async register(registerDto: RegisterDto): Promise<IAuthResponse> {
    try {
      let userId: string;
      let email: string;

      if (registerDto.firebaseToken) {
        // Firebase registration
        const decodedToken = await this.validateFirebaseToken(registerDto.firebaseToken);
        userId = decodedToken.uid;
        email = decodedToken.email!;
      } else if (registerDto.email && registerDto.password) {
        // Traditional registration
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        
        // TODO: Implement actual user creation in your database
        // This should create a new User entity with the provided details
        // Example:
        // const user = await this.userRepository.save({
        //   id: this.generateUserId(),
        //   email: registerDto.email,
        //   passwordHash: hashedPassword,
        //   tenantId: registerDto.tenantId || 'default',
        //   firstName: registerDto.firstName,
        //   lastName: registerDto.lastName,
        // });
        
        userId = this.generateUserId();
        email = registerDto.email;
        
        this.logger.log(`User registered with email: ${email}`);
      } else {
        throw new UnauthorizedException('Invalid registration method');
      }

      return this.createAuthResponse({
        sub: userId,
        email,
        tenantId: registerDto.tenantId || 'default',
      });
    } catch (error) {
      this.logger.error('Registration failed:', error.message);
      throw error;
    }
  }

  async validateUser(payload: IJwtPayload): Promise<any> {
    // TODO: Implement actual user fetching from database
    // This should query your User entity by ID and return user details
    return {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
    };
  }

  async refreshToken(refreshToken: string): Promise<IAuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      return this.createAuthResponse({
        sub: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
      });
    } catch (error) {
      this.logger.error('Token refresh failed:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // TODO: Implement token invalidation or session cleanup
    // This might involve adding tokens to a blacklist or clearing session data
    this.logger.log(`User ${userId} logged out`);
  }

  async validateOAuthUser(provider: string, profile: any): Promise<any> {
    // Handle OAuth provider validation
    this.logger.log(`OAuth validation for provider: ${provider}`);
    return {
      id: profile.id,
      email: profile.email,
      provider,
    };
  }

  private async validateEmailPassword(email: string, password: string): Promise<any | null> {
    // TODO: Implement actual user validation against your database
    // This should query your User entity by email and validate the password hash
    // Example:
    // const user = await this.userRepository.findOne({ where: { email } });
    // if (user && await bcrypt.compare(password, user.passwordHash)) {
    //   return user;
    // }
    // return null;
    
    // Placeholder implementation for demo purposes
    if (email === 'demo@example.com' && password === 'password') {
      return {
        id: 'demo-user-id',
        email: 'demo@example.com',
        tenantId: 'demo-tenant',
      };
    }
    return null;
  }

  private createAuthResponse(payload: IJwtPayload): IAuthResponse {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1h'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      user: {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
      },
    };
  }

  private generateUserId(): string {
    // Use UUID v4 for consistent ID generation across the platform
    return uuidv4();
  }
}