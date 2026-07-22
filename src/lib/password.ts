export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

const PASSWORD_RULES = {
  minLength: 8,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSpecial: 1,
};

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (!password || password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!SPECIAL_CHARS.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
