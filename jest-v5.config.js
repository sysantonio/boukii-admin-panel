/**
 * Jest Configuration específica para V5 Frontend
 * Configuración optimizada para migración desde Karma + Jasmine
 */

module.exports = {
  // Configuración base
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  
  // Archivos de setup
  setupFilesAfterEnv: [
    '<rootDir>/src/setup-jest.ts'
  ],
  
  // Solo tests de V5
  testMatch: [
    '<rootDir>/src/app/v5/**/*.spec.ts'
  ],
  
  // Cobertura específica V5
  collectCoverageFrom: [
    'src/app/v5/**/*.ts',
    '!src/app/v5/**/*.spec.ts',
    '!src/app/v5/**/*.module.ts',
    '!src/app/v5/**/*.interface.ts'
  ],
  
  // Reportes en directorio separado
  coverageDirectory: '<rootDir>/coverage/v5-jest',
  
  // Umbrales altos para V5
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Configuración específica V5
  displayName: 'Boukii V5 Frontend Tests',
  
  // Comandos sugeridos:
  // npm run test:v5 -- --watch
  // npm run test:v5 -- --coverage
};