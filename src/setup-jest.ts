import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Mock global objects
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe(target: Element): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {}
  observe(target: Element): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
};

// Mock localStorage
const localStorageMock: Storage = {
  getItem: jest.fn((key: string) => {
    const store: { [key: string]: string } = {};
    return store[key] || null;
  }),
  setItem: jest.fn((key: string, value: string) => {
    const store: { [key: string]: string } = {};
    store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    const store: { [key: string]: string } = {};
    delete store[key];
  }),
  clear: jest.fn(() => {
    const store: { [key: string]: string } = {};
    Object.keys(store).forEach(key => delete store[key]);
  }),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn()
});

// Mock navigator
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  writable: true
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-object-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn()
});

// Custom matchers for better testing
expect.extend({
  toBeVisible(received: HTMLElement) {
    const pass = received.style.display !== 'none' && 
                 received.style.visibility !== 'hidden' &&
                 received.getAttribute('hidden') === null;
    
    if (pass) {
      return {
        message: () => `expected element not to be visible`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be visible`,
        pass: false,
      };
    }
  },
  
  toHaveValidationError(received: HTMLElement, expectedError?: string) {
    const hasError = received.classList.contains('ng-invalid') ||
                    received.getAttribute('aria-invalid') === 'true';
    
    if (expectedError) {
      const errorElement = received.parentElement?.querySelector('.error-message');
      const hasExpectedError = errorElement?.textContent?.includes(expectedError);
      
      return {
        message: () => expectedError 
          ? `expected element to have validation error "${expectedError}"` 
          : 'expected element to have validation error',
        pass: hasError && (expectedError ? hasExpectedError : true),
      };
    }
    
    return {
      message: () => 'expected element to have validation error',
      pass: hasError,
    };
  }
});

// Global test utilities
(global as any).TestUtils = {
  createMockSeasonContext: () => ({
    currentSeason$: { subscribe: jest.fn() },
    getCurrentSeason: jest.fn(() => ({ id: 1, name: 'Test Season' })),
    getCurrentSeasonId: jest.fn(() => 1),
    setCurrentSeason: jest.fn(),
    canEditCurrentSeason: jest.fn(() => true)
  }),
  
  createMockAuthService: () => ({
    currentUser$: { subscribe: jest.fn() },
    isLoggedIn$: { subscribe: jest.fn() },
    getCurrentUser: jest.fn(() => ({ id: 1, name: 'Test User' })),
    getCurrentUserId: jest.fn(() => 1),
    login: jest.fn(),
    logout: jest.fn()
  }),
  
  createMockApiService: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  })
};