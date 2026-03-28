import 'dotenv/config';

// Ensure required env vars exist for tests
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/edscript_db?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_for_tests_only';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'test_refresh_secret_for_tests_only';
