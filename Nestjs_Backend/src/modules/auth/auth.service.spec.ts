import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../common/providers/email/email.service';
import { BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService - MVP Tests', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    otpVerification: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    workspace: {
      create: jest.fn(),
    },
    workspaceMember: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
      return null;
    }),
  };

  const mockEmailService = {
    sendOtp: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      code: '123456',
    };

    it('should register new user with valid data', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 10000);
      
      mockPrismaService.otpVerification.findUnique.mockResolvedValue({
        email: registerDto.email,
        code: registerDto.code,
        expiresAt: future,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue({ id: 'user-123', ...registerDto });
      mockPrismaService.workspace.create.mockResolvedValue({ id: 'ws-123' });
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.workspace.create).toHaveBeenCalled();
    });

    it('should reject duplicate email', async () => {
      const future = new Date(Date.now() + 10000);
      mockPrismaService.otpVerification.findUnique.mockResolvedValue({
        email: registerDto.email,
        code: registerDto.code,
        expiresAt: future,
      });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should hash password before storing', async () => {
       const future = new Date(Date.now() + 10000);
       mockPrismaService.otpVerification.findUnique.mockResolvedValue({
         email: registerDto.email,
         code: registerDto.code,
         expiresAt: future,
       });
       mockPrismaService.user.findUnique.mockResolvedValue(null);
       (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
       mockPrismaService.user.create.mockResolvedValue({ id: 'user-123', ...registerDto });
       
       await service.register(registerDto);
       
       expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login with correct credentials', async () => {
      const user = { id: 'user-123', email: loginDto.email, password: 'hashedPassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('rtHash');
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login(loginDto, '127.0.0.1', 'test-agent');

      expect(result).toHaveProperty('accessToken');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, 'hashedPassword');
    });

    it('should reject invalid password', async () => {
      const user = { id: 'user-123', email: loginDto.email, password: 'hashedPassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto, '127.0.0.1', 'test-agent')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('tokens', () => {
    const user = { id: 'user-123', email: 'test@example.com', accountType: 'PERSONAL' };

    it('should generate valid JWT token', async () => {
      mockJwtService.signAsync.mockResolvedValue('token');
      
      const result = await service.generateTokens(user);
      
      expect(result.accessToken).toBe('token');
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should validate JWT token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: user.id });
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      
      const result = await service.validateUserByToken('valid-token');
      
      expect(result).toEqual(user);
    });

    it('should reject expired JWT', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Expired'));
      
      const result = await service.validateUserByToken('expired-token');
      
      expect(result).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh expired token', async () => {
      const oldRefreshToken = 'old-rt';
      const user = { id: 'user-123', email: 'test@example.com' };
      const session = { id: 'sess-123', refreshToken: 'hashed-old-rt' };

      mockJwtService.verifyAsync.mockResolvedValue({ sub: user.id });
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.session.findMany.mockResolvedValue([session]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-rt-hash');
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refreshToken(oldRefreshToken, '127.0.0.1', 'test-agent');

      expect(result).toHaveProperty('accessToken');
      expect(mockPrismaService.session.delete).toHaveBeenCalledWith({ where: { id: session.id } });
      expect(mockPrismaService.session.create).toHaveBeenCalled();
    });
  });

  describe('googleAuth', () => {
    it('should handle Google OAuth flow', async () => {
      const googleProfile = {
        googleId: 'g-123',
        email: 'google@example.com',
        firstName: 'Google',
        lastName: 'User',
        picture: 'pic-url',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ id: 'g-user-123', ...googleProfile });
      mockJwtService.signAsync.mockResolvedValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('rt-hash');

      const result = await service.validateGoogleUser(googleProfile);

      expect(result).toHaveProperty('accessToken');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });
  });
});
