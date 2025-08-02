import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CourseSeasonService } from './course-season.service';
import { ApiV5Service } from './api-v5.service';
import { SeasonContextService } from './season-context.service';
import { Course } from '../models/course.interface';

describe('CourseSeasonService', () => {
  let service: CourseSeasonService;
  let mockApiService: jest.Mocked<ApiV5Service>;
  let mockSeasonContext: jest.Mocked<SeasonContextService>;

  const mockCourse: Course = {
    id: 1,
    season_id: 1,
    school_id: 1,
    name: 'Test Course',
    description: 'Test Description',
    course_group_id: 1,
    pricing: {
      id: 1,
      course_id: 1,
      season_id: 1,
      pricing_type: 'flexible',
      base_price: 50,
      min_participants: 1,
      max_participants: 10,
      price_breaks: [],
      extras: [],
      currency: 'EUR',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    availability: {
      id: 1,
      course_id: 1,
      season_id: 1,
      available_dates: [],
      time_slots: [],
      capacity_settings: {
        default_capacity: 10,
        allow_overbooking: false,
        waitlist_enabled: false,
        auto_assign_from_waitlist: false
      },
      booking_rules: {
        advance_booking_days: 1,
        cancellation_deadline_hours: 24,
        modification_deadline_hours: 12,
        requires_approval: false
      },
      created_at: new Date(),
      updated_at: new Date()
    },
    settings: {
      requires_monitor: true,
      monitor_requirements: [],
      equipment_included: false,
      equipment_list: [],
      location: {
        name: 'Test Location',
        indoor: true,
        facilities: []
      },
      weather_dependent: false,
      cancellation_weather_conditions: [],
      tags: [],
      difficulty_level: 'beginner',
      skill_level: 'basic'
    },
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(() => {
    const apiServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    const seasonContextMock = {
      getCurrentSeasonId: jest.fn(),
      getCurrentSeason: jest.fn(),
      currentSeason$: of({ id: 1, name: 'Test Season' })
    };

    TestBed.configureTestingModule({
      providers: [
        CourseSeasonService,
        { provide: ApiV5Service, useValue: apiServiceMock },
        { provide: SeasonContextService, useValue: seasonContextMock }
      ]
    });

    service = TestBed.inject(CourseSeasonService);
    mockApiService = TestBed.inject(ApiV5Service) as jest.Mocked<ApiV5Service>;
    mockSeasonContext = TestBed.inject(SeasonContextService) as jest.Mocked<SeasonContextService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCoursesBySeason', () => {
    it('should fetch courses for current season', async () => {
      // Arrange
      const mockResponse = { data: [mockCourse] };
      mockSeasonContext.getCurrentSeasonId.mockReturnValue(1);
      mockApiService.get.mockReturnValue(of(mockResponse) as any);

      // Act
      const result = await service.getCoursesBySeason();

      // Assert
      expect(result).toEqual([mockCourse]);
      expect(mockApiService.get).toHaveBeenCalledWith('seasons/1/courses');
      expect(mockSeasonContext.getCurrentSeasonId).toHaveBeenCalled();
    });

    it('should fetch courses for specific season', async () => {
      // Arrange
      const seasonId = 2;
      const mockResponse = { data: [mockCourse] };
      mockApiService.get.mockReturnValue(of(mockResponse) as any);

      // Act
      const result = await service.getCoursesBySeason(seasonId);

      // Assert
      expect(result).toEqual([mockCourse]);
      expect(mockApiService.get).toHaveBeenCalledWith('seasons/2/courses');
      expect(mockSeasonContext.getCurrentSeasonId).not.toHaveBeenCalled();
    });

    it('should throw error when no season selected', async () => {
      // Arrange
      mockSeasonContext.getCurrentSeasonId.mockReturnValue(null);

      // Act & Assert
      await expect(service.getCoursesBySeason()).rejects.toThrow('No season selected');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockSeasonContext.getCurrentSeasonId.mockReturnValue(1);
      mockApiService.get.mockReturnValue(throwError(() => new Error('API Error')) as any);

      // Act & Assert
      await expect(service.getCoursesBySeason()).rejects.toThrow('API Error');
    });
  });

  describe('getCourseById', () => {
    it('should fetch course by id', async () => {
      // Arrange
      const mockResponse = { data: mockCourse };
      mockApiService.get.mockReturnValue(of(mockResponse) as any);

      // Act
      const result = await service.getCourseById(1);

      // Assert
      expect(result).toEqual(mockCourse);
      expect(mockApiService.get).toHaveBeenCalledWith('courses/1');
    });

    it('should throw error when course not found', async () => {
      // Arrange
      const mockResponse = { data: null };
      mockApiService.get.mockReturnValue(of(mockResponse) as any);

      // Act & Assert
      await expect(service.getCourseById(1)).rejects.toThrow('Course not found');
    });
  });

  describe('createCourse', () => {
    it('should create course with current season', async () => {
      // Arrange
      const courseData = { name: 'New Course', description: 'New Description' };
      const mockResponse = { data: mockCourse };
      mockSeasonContext.getCurrentSeasonId.mockReturnValue(1);
      mockApiService.post.mockReturnValue(of(mockResponse) as any);
      mockApiService.get.mockReturnValue(of({ data: [mockCourse] }) as any);

      // Act
      const result = await service.createCourse(courseData);

      // Assert
      expect(result).toEqual(mockCourse);
      expect(mockApiService.post).toHaveBeenCalledWith('courses', {
        ...courseData,
        season_id: 1
      });
    });

    it('should throw error when no season selected', async () => {
      // Arrange
      const courseData = { name: 'New Course' };
      mockSeasonContext.getCurrentSeasonId.mockReturnValue(null);

      // Act & Assert
      await expect(service.createCourse(courseData)).rejects.toThrow('No season selected');
    });
  });

  describe('canEditCourse', () => {
    it('should return true when season is open and matches course season', () => {
      // Arrange
      const mockSeason = { id: 1, is_closed: false };
      mockSeasonContext.getCurrentSeason.mockReturnValue(mockSeason as any);

      // Act
      const result = service.canEditCourse(mockCourse);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when season is closed', () => {
      // Arrange
      const mockSeason = { id: 1, is_closed: true };
      mockSeasonContext.getCurrentSeason.mockReturnValue(mockSeason as any);

      // Act
      const result = service.canEditCourse(mockCourse);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when course season does not match current season', () => {
      // Arrange
      const mockSeason = { id: 2, is_closed: false };
      mockSeasonContext.getCurrentSeason.mockReturnValue(mockSeason as any);

      // Act
      const result = service.canEditCourse(mockCourse);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when no season selected', () => {
      // Arrange
      mockSeasonContext.getCurrentSeason.mockReturnValue(null);

      // Act
      const result = service.canEditCourse(mockCourse);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('observables', () => {
    it('should provide courses observable', (done) => {
      // Arrange
      const courses = [mockCourse];

      // Act
      service['coursesSubject'].next(courses);

      // Assert
      service.courses$.subscribe(result => {
        expect(result).toEqual(courses);
        done();
      });
    });

    it('should provide loading observable', (done) => {
      // Act
      service['loadingSubject'].next(true);

      // Assert
      service.loading$.subscribe(result => {
        expect(result).toBe(true);
        done();
      });
    });
  });
});