# Authentication Specification

## Endpoints
- POST /api/auth/login — Login with email + password
- POST /api/auth/register — Student self-registration
- POST /api/auth/refresh — Refresh access token
- POST /api/auth/logout — Clear auth cookies

## Security
- Passwords hashed with bcryptjs (12 rounds)
- Access tokens stored in httpOnly cookies
- Refresh tokens in separate httpOnly cookie (restricted path)
- Rate limiting on login endpoint
- No social login, OTP, or email verification

## RBAC
- SUPER_ADMIN, ADMIN, COUNSELOR, DOCUMENT_VERIFIER, STUDENT
- Fixed role permissions
- Permission enforcement via middleware
