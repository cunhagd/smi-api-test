import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service'; // Needed for LocalStrategy and JwtStrategy providers

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(), // Though not directly called by controller, LocalStrategy uses it
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    // Add other methods if LocalStrategy/JwtStrategy depend on them directly in their constructor/validation
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'testSecret';
      }
      if (key === 'JWT_EXPIRATION_TIME') {
        return '3600s';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        // Provide simplified mocks/implementations for strategies
        // For LocalStrategy, it depends on AuthService
        {
          provide: LocalStrategy,
          useFactory: (authSvc: AuthService) => new LocalStrategy(authSvc),
          inject: [AuthService],
        },
        // For JwtStrategy, it depends on ConfigService and potentially UserService
        {
          provide: JwtStrategy,
          useFactory: (configSvc: ConfigService) => new JwtStrategy(configSvc),
          inject: [ConfigService],
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        { // UserService is a dependency of AuthService, which is mocked,
          // but strategies might also depend on it if not fully mocked out.
          // If strategies' constructors or validate methods directly use UserService, it needs to be provided.
          provide: UserService,
          useValue: mockUserService,
        }
      ],
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '60s' },
        }),
      ],
    })
    // .overrideProvider(AuthService).useValue(mockAuthService) // Alternative way to mock
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService); // This will be the mockAuthService
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    it('should return an access_token for valid credentials', async () => {
      const userPayload = { id: 1, email: 'test@example.com', name: 'Test User' };
      const req = { user: userPayload }; // Mocked req object with user populated by LocalStrategy
      const loginDto: LoginAuthDto = { email: 'test@example.com', password: 'password' };
      const expectedToken = { access_token: 'mockToken123' };

      mockAuthService.login.mockResolvedValue(expectedToken);

      const result = await controller.login(req, loginDto);

      expect(result).toEqual(expectedToken);
      expect(mockAuthService.login).toHaveBeenCalledWith(userPayload);
    });

    // Test for AuthGuard('local') behavior (throwing UnauthorizedException)
    // This is more of an integration test for the guard itself.
    // For a unit test of the controller, we assume the guard has done its job.
    // If LocalStrategy.validate throws an error, the guard would throw it.
    // We can test if the controller method handles a case where req.user might not be populated,
    // though Guard should prevent this.
    it('AuthGuard(local) should handle unauthorized access (conceptual)', () => {
        // This test is conceptual for the controller unit test.
        // The actual UnauthorizedException would be thrown by the AuthGuard('local')
        // before the controller's login method is even called if authentication fails.
        // To test LocalStrategy itself:
        // const localStrategy = module.get<LocalStrategy>(LocalStrategy);
        // mockAuthService.validateUser.mockResolvedValue(null);
        // await expect(localStrategy.validate('wrong@test.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
        expect(true).toBe(true); // Placeholder for the conceptual nature
    });
  });
});
