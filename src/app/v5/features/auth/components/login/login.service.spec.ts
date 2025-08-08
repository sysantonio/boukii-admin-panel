import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthV5Service, CheckUserResponse } from '../../../../core/services/auth-v5.service';
import { TokenV5Service } from '../../../../core/services/token-v5.service';
import { ApiV5Service } from '../../../../core/services/api-v5.service';
import { environment } from '../../../../../../environments/environment';

describe('AuthV5Service - Login Flow', () => {
  let service: AuthV5Service;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenV5Service>;
  let apiService: jasmine.SpyObj<ApiV5Service>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@boukii.com',
    email_verified_at: '2024-01-01T00:00:00.000Z'
  };

  const mockSingleSchool = {
    id: 1,
    name: 'Test School',
    slug: 'test-school',
    logo: 'test.png',
    user_role: 'admin',
    can_administer: true
  };

  const mockMultipleSchools = [
    {
      id: 1,
      name: 'School 1',
      slug: 'school-1',
      logo: 'school1.png',
      user_role: 'admin',
      can_administer: true
    },
    {
      id: 2,
      name: 'School 2',
      slug: 'school-2',
      logo: 'school2.png',
      user_role: 'teacher',
      can_administer: false
    }
  ];

  beforeEach(() => {
    const tokenServiceSpy = jasmine.createSpyObj('TokenV5Service', [
      'setTempToken', 'getTempToken', 'clearTempToken', 
      'saveLoginData', 'getCurrentToken', 'getToken'
    ]);
    const apiServiceSpy = jasmine.createSpyObj('ApiV5Service', ['get', 'post']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthV5Service,
        { provide: TokenV5Service, useValue: tokenServiceSpy },
        { provide: ApiV5Service, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(AuthV5Service);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenV5Service) as jasmine.SpyObj<TokenV5Service>;
    apiService = TestBed.inject(ApiV5Service) as jasmine.SpyObj<ApiV5Service>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('checkUser()', () => {
    it('should handle single school user correctly', (done) => {
      const credentials = { email: 'test@boukii.com', password: 'password123' };
      
      const mockResponse: CheckUserResponse = {
        user: mockUser,
        schools: [mockSingleSchool],
        requires_school_selection: false,
        temp_token: 'temp-token-123'
      };

      service.checkUser(credentials).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(tokenService.setTempToken).toHaveBeenCalledWith('temp-token-123');
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/check-user`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      
      req.flush({
        success: true,
        data: mockResponse,
        message: 'Credenciales verificadas correctamente'
      });
    });

    it('should handle multi-school user correctly', (done) => {
      const credentials = { email: 'test@boukii.com', password: 'password123' };
      
      const mockResponse: CheckUserResponse = {
        user: mockUser,
        schools: mockMultipleSchools,
        requires_school_selection: true,
        temp_token: 'temp-token-456'
      };

      service.checkUser(credentials).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(tokenService.setTempToken).toHaveBeenCalledWith('temp-token-456');
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/check-user`);
      req.flush({
        success: true,
        data: mockResponse,
        message: 'Credenciales verificadas correctamente'
      });
    });

    it('should handle authentication failure', (done) => {
      const credentials = { email: 'wrong@example.com', password: 'wrongpass' };

      service.checkUser(credentials).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Credenciales incorrectas');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/check-user`);
      req.flush({
        success: false,
        message: 'Credenciales incorrectas',
        data: null
      }, { status: 422, statusText: 'Unprocessable Entity' });
    });

    it('should handle user without schools', (done) => {
      const credentials = { email: 'test@boukii.com', password: 'password123' };

      service.checkUser(credentials).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Usuario sin escuelas asignadas');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/check-user`);
      req.flush({
        success: false,
        message: 'Usuario sin escuelas asignadas',
        data: null
      }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('selectSchool()', () => {
    beforeEach(() => {
      tokenService.getCurrentToken.and.returnValue('temp-token-123');
    });

    it('should complete login successfully', (done) => {
      const schoolData = { school_id: 1, remember_me: true };
      
      const mockLoginResponse = {
        user: mockUser,
        school: mockSingleSchool,
        season: {
          id: 1,
          name: 'Season 2024-25',
          year: '2024-25',
          is_current: true,
          start_date: '2024-09-01',
          end_date: '2025-08-31'
        },
        access_token: 'access-token-789',
        token_type: 'Bearer',
        expires_at: null,
        has_multiple_seasons: false,
        available_seasons: []
      };

      service.selectSchool(schoolData).subscribe({
        next: (response) => {
          expect(response).toEqual(mockLoginResponse);
          expect(tokenService.saveLoginData).toHaveBeenCalledWith(mockLoginResponse);
          expect(tokenService.clearTempToken).toHaveBeenCalled();
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-school`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(schoolData);
      expect(req.request.headers.get('Authorization')).toBe('Bearer temp-token-123');

      req.flush({
        success: true,
        data: mockLoginResponse,
        message: 'Login completado exitosamente'
      });
    });

    it('should handle unauthorized access', (done) => {
      const schoolData = { school_id: 999, remember_me: false };

      service.selectSchool(schoolData).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Acceso denegado a esta escuela');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/v5/auth/select-school`);
      req.flush({
        success: false,
        message: 'Acceso denegado a esta escuela',
        data: null
      }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getTempUserData()', () => {
    it('should return temp user data when temp token exists', () => {
      const mockTempData = {
        user: mockUser,
        schools: mockMultipleSchools
      };

      tokenService.getTempToken.and.returnValue('temp-token-123');
      spyOn(service, 'getCurrentUser').and.returnValue(mockUser);
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockMultipleSchools));

      const result = service.getTempUserData();

      expect(result).toEqual(mockTempData);
      expect(localStorage.getItem).toHaveBeenCalledWith('v5_temp_schools');
    });

    it('should return null when no temp token exists', () => {
      tokenService.getTempToken.and.returnValue(null);

      const result = service.getTempUserData();

      expect(result).toBeNull();
    });

    it('should return null when user is not available', () => {
      tokenService.getTempToken.and.returnValue('temp-token-123');
      spyOn(service, 'getCurrentUser').and.returnValue(null);

      const result = service.getTempUserData();

      expect(result).toBeNull();
    });
  });
});