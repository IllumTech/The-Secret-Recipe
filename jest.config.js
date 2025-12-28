module.exports = {
  projects: [
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/frontend'],
      testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/frontend/$1',
        '^react$': '<rootDir>/frontend/node_modules/react',
        '^react-dom$': '<rootDir>/frontend/node_modules/react-dom',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(ts|tsx)$': ['@swc/jest', {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        }],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      collectCoverageFrom: [
        'frontend/**/*.{ts,tsx}',
        '!frontend/**/*.d.ts',
        '!frontend/node_modules/**',
        '!frontend/.next/**',
      ],
    },
    {
      displayName: 'backend',
      testEnvironment: 'node',
      roots: ['<rootDir>/backend'],
      testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
      transform: {
        '^.+\\.ts$': ['@swc/jest', {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        }],
      },
      moduleFileExtensions: ['ts', 'js'],
      collectCoverageFrom: [
        'backend/**/*.ts',
        '!backend/**/*.d.ts',
        '!backend/**/node_modules/**',
        '!backend/**/.aws-sam/**',
      ],
    }
  ]
};
