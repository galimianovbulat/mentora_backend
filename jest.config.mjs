import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} */
export default {
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },

    moduleNameMapper: {
        '^data-source$': '<rootDir>/src/data-source.ts',
        '^helpers/(.*)$': '<rootDir>/src/helpers/$1',
        '^entities/(.*)$': '<rootDir>/src/entities/$1',
        '^config$': '<rootDir>/src/config.ts',
        '^app$': '<rootDir>/src/app.ts',
    },
};
