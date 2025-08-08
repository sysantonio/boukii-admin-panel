import { TestBed } from '@angular/core/testing';
import { SeasonContextService } from './season-context.service';
import { TokenV5Service } from './token-v5.service';
import { Router } from '@angular/router';

describe('SeasonContextService', () => {
  let service: SeasonContextService;
  let tokenService: jasmine.SpyObj<TokenV5Service>;
  let router: jasmine.SpyObj<Router>;

  const mockSeason = {
    id: 1,
    name: 'Test Season 2025',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    is_active: true,
    is_current: true
  };

  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj('TokenV5Service', [
      'getCurrentSeason',
      'setCurrentSeason',
      'getCurrentSchool'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        SeasonContextService,
        { provide: TokenV5Service, useValue: tokenSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(SeasonContextService);
    tokenService = TestBed.inject(TokenV5Service) as jasmine.SpyObj<TokenV5Service>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Season Context Management', () => {
    it('should check if season context is available', () => {
      tokenService.getCurrentSeason.and.returnValue(mockSeason);

      const hasContext = service.hasSeasonContext();

      expect(hasContext).toBe(true);
      expect(tokenService.getCurrentSeason).toHaveBeenCalled();
    });

    it('should return false when no season context available', () => {
      tokenService.getCurrentSeason.and.returnValue(null);

      const hasContext = service.hasSeasonContext();

      expect(hasContext).toBe(false);
    });

    it('should set current season context', () => {
      service.setCurrentSeason(mockSeason);

      expect(tokenService.setCurrentSeason).toHaveBeenCalledWith(mockSeason);
    });

    it('should get current season context', () => {
      tokenService.getCurrentSeason.and.returnValue(mockSeason);

      const season = service.getCurrentSeason();

      expect(season).toEqual(mockSeason);
      expect(tokenService.getCurrentSeason).toHaveBeenCalled();
    });
  });

  describe('Season Selection Flow', () => {
    it('should prompt for season selection when no context', () => {
      tokenService.getCurrentSeason.and.returnValue(null);
      tokenService.getCurrentSchool.and.returnValue({ id: 1, name: 'Test School', slug: 'test-school' });

      service.promptSeasonSelection();

      expect(router.navigate).toHaveBeenCalledWith(['/v5/auth/season-selection']);
    });

    it('should validate season context requirement', () => {
      tokenService.getCurrentSeason.and.returnValue(mockSeason);

      const isValid = service.validateSeasonContext();

      expect(isValid).toBe(true);
    });

    it('should fail validation when no season context', () => {
      tokenService.getCurrentSeason.and.returnValue(null);

      const isValid = service.validateSeasonContext();

      expect(isValid).toBe(false);
    });
  });
});