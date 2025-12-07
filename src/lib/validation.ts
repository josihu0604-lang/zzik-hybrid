/**
 * Validation Library
 *
 * Type-safe validation schemas and utilities
 * Compatible with React Hook Form pattern
 */

// ============================================
// Types
// ============================================

export type ValidationResult = {
  valid: boolean;
  error?: string;
};

export type Validator<T> = (value: T) => ValidationResult;

export type ValidationSchema<T> = {
  [K in keyof T]?: Validator<T[K]>[];
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

// ============================================
// Basic Validators
// ============================================

/**
 * Required field validator
 */
export function required(message = '필수 입력 항목입니다'): Validator<unknown> {
  return (value) => {
    const isEmpty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    return {
      valid: !isEmpty,
      error: isEmpty ? message : undefined,
    };
  };
}

/**
 * Minimum length validator
 */
export function minLength(min: number, message?: string): Validator<string> {
  return (value) => {
    const valid = value.length >= min;
    return {
      valid,
      error: valid ? undefined : message || `최소 ${min}자 이상 입력하세요`,
    };
  };
}

/**
 * Maximum length validator
 */
export function maxLength(max: number, message?: string): Validator<string> {
  return (value) => {
    const valid = value.length <= max;
    return {
      valid,
      error: valid ? undefined : message || `최대 ${max}자까지 입력 가능합니다`,
    };
  };
}

/**
 * Pattern validator (regex)
 */
export function pattern(regex: RegExp, message: string): Validator<string> {
  return (value) => {
    const valid = regex.test(value);
    return { valid, error: valid ? undefined : message };
  };
}

/**
 * Email validator
 */
export function email(message = '올바른 이메일 형식이 아닙니다'): Validator<string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern(emailRegex, message);
}

/**
 * Phone number validator (Korean format)
 */
export function phone(message = '올바른 전화번호 형식이 아닙니다'): Validator<string> {
  // Korean phone: 010-1234-5678 or 01012345678
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return pattern(phoneRegex, message);
}

/**
 * URL validator
 */
export function url(message = '올바른 URL 형식이 아닙니다'): Validator<string> {
  return (value) => {
    if (!value) return { valid: true };
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: message };
    }
  };
}

/**
 * Minimum number validator
 */
export function min(minValue: number, message?: string): Validator<number> {
  return (value) => {
    const valid = value >= minValue;
    return {
      valid,
      error: valid ? undefined : message || `${minValue} 이상이어야 합니다`,
    };
  };
}

/**
 * Maximum number validator
 */
export function max(maxValue: number, message?: string): Validator<number> {
  return (value) => {
    const valid = value <= maxValue;
    return {
      valid,
      error: valid ? undefined : message || `${maxValue} 이하여야 합니다`,
    };
  };
}

/**
 * Range validator
 */
export function range(minValue: number, maxValue: number, message?: string): Validator<number> {
  return (value) => {
    const valid = value >= minValue && value <= maxValue;
    return {
      valid,
      error: valid ? undefined : message || `${minValue}~${maxValue} 사이여야 합니다`,
    };
  };
}

/**
 * Custom validator
 */
export function custom<T>(validate: (value: T) => boolean, message: string): Validator<T> {
  return (value) => {
    const valid = validate(value);
    return { valid, error: valid ? undefined : message };
  };
}

/**
 * Match validator (for password confirmation)
 */
export function match<T>(getMatchValue: () => T, message = '값이 일치하지 않습니다'): Validator<T> {
  return (value) => {
    const valid = value === getMatchValue();
    return { valid, error: valid ? undefined : message };
  };
}

// ============================================
// Validation Runner
// ============================================

/**
 * Run validators on a single value
 */
export function validateField<T>(value: T, validators: Validator<T>[]): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Run validation on entire form data
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema<T>
): { valid: boolean; errors: ValidationErrors<T> } {
  const errors: ValidationErrors<T> = {};
  let valid = true;

  for (const key in schema) {
    const validators = schema[key];
    if (validators) {
      const result = validateField(data[key], validators as Validator<unknown>[]);
      if (!result.valid) {
        valid = false;
        errors[key] = result.error;
      }
    }
  }

  return { valid, errors };
}

// ============================================
// Pre-built Validation Schemas
// ============================================

/**
 * Login form validation
 */
export const loginSchema = {
  email: [required('이메일을 입력하세요'), email()],
  password: [required('비밀번호를 입력하세요'), minLength(6, '비밀번호는 최소 6자 이상입니다')],
};

/**
 * Signup form validation
 */
export const signupSchema = {
  email: [required('이메일을 입력하세요'), email()],
  password: [
    required('비밀번호를 입력하세요'),
    minLength(8, '비밀번호는 최소 8자 이상입니다'),
    pattern(/^(?=.*[A-Za-z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다'),
  ],
  name: [required('이름을 입력하세요'), minLength(2), maxLength(20)],
};

/**
 * Profile form validation
 */
export const profileSchema = {
  nickname: [required('닉네임을 입력하세요'), minLength(2), maxLength(20)],
  bio: [maxLength(200, '자기소개는 200자 이내로 입력하세요')],
  phone: [phone()],
};

/**
 * Contact form validation
 */
export const contactSchema = {
  name: [required('이름을 입력하세요')],
  email: [required('이메일을 입력하세요'), email()],
  message: [required('메시지를 입력하세요'), minLength(10, '최소 10자 이상 입력하세요')],
};
