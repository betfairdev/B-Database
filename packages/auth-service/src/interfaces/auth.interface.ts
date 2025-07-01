import { LoginDto, RegisterDto } from '../dto/auth.dto.js';

export interface IJwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    tenantId: string;
  };
}

export interface IAuthService {
  login(loginDto: LoginDto): Promise<IAuthResponse>;
  register(registerDto: RegisterDto): Promise<IAuthResponse>;
  validateUser(payload: IJwtPayload): Promise<any>;
  refreshToken(refreshToken: string): Promise<IAuthResponse>;
  logout(userId: string): Promise<void>;
  validateOAuthUser(provider: string, profile: any): Promise<any>;
}

export interface IUser {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date;
}