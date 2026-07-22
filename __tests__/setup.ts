import "@testing-library/jest-dom/vitest";

process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_ACCESS_EXPIRATION = "15m";
process.env.JWT_REFRESH_EXPIRATION = "7d";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.REDIS_URL = "";
(process.env as Record<string, string>).NODE_ENV = "test";
