import { describe, it, expect } from 'vitest';
import {
  required,
  minLength,
  maxLength,
  email,
  phone,
  url,
  min,
  max,
  range,
  pattern,
  custom,
  match,
  validateField,
  validateForm,
  loginSchema,
  signupSchema,
  profileSchema,
} from '@/lib/validation';

describe('validation.ts', () => {
  // =============================================================================
  // Required Validator Tests
  // =============================================================================
  describe('required', () => {
    it('should reject empty string', () => {
      const validator = required();
      const result = validator('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('필수 입력 항목입니다');
    });

    it('should reject null', () => {
      const validator = required();
      const result = validator(null);
      expect(result.valid).toBe(false);
    });

    it('should reject undefined', () => {
      const validator = required();
      const result = validator(undefined);
      expect(result.valid).toBe(false);
    });

    it('should reject empty array', () => {
      const validator = required();
      const result = validator([]);
      expect(result.valid).toBe(false);
    });

    it('should accept non-empty string', () => {
      const validator = required();
      const result = validator('hello');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept custom error message', () => {
      const validator = required('Custom error');
      const result = validator('');
      expect(result.error).toBe('Custom error');
    });
  });

  // =============================================================================
  // Length Validator Tests
  // =============================================================================
  describe('minLength', () => {
    it('should reject string shorter than min', () => {
      const validator = minLength(5);
      const result = validator('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('최소 5자 이상 입력하세요');
    });

    it('should accept string equal to min', () => {
      const validator = minLength(5);
      const result = validator('hello');
      expect(result.valid).toBe(true);
    });

    it('should accept string longer than min', () => {
      const validator = minLength(5);
      const result = validator('hello world');
      expect(result.valid).toBe(true);
    });

    it('should accept custom error message', () => {
      const validator = minLength(5, 'Too short!');
      const result = validator('abc');
      expect(result.error).toBe('Too short!');
    });
  });

  describe('maxLength', () => {
    it('should reject string longer than max', () => {
      const validator = maxLength(10);
      const result = validator('this is a very long string');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('최대 10자까지 입력 가능합니다');
    });

    it('should accept string equal to max', () => {
      const validator = maxLength(10);
      const result = validator('1234567890');
      expect(result.valid).toBe(true);
    });

    it('should accept string shorter than max', () => {
      const validator = maxLength(10);
      const result = validator('short');
      expect(result.valid).toBe(true);
    });
  });

  // =============================================================================
  // Email Validator Tests
  // =============================================================================
  describe('email', () => {
    it('should accept valid email format', () => {
      const validator = email();
      expect(validator('user@example.com').valid).toBe(true);
      expect(validator('test.user@domain.co.kr').valid).toBe(true);
      expect(validator('name+tag@gmail.com').valid).toBe(true);
    });

    it('should reject invalid email format - no @', () => {
      const validator = email();
      const result = validator('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('올바른 이메일 형식이 아닙니다');
    });

    it('should reject invalid email format - no domain', () => {
      const validator = email();
      expect(validator('user@').valid).toBe(false);
      expect(validator('@domain.com').valid).toBe(false);
    });

    it('should reject invalid email format - no TLD', () => {
      const validator = email();
      expect(validator('user@domain').valid).toBe(false);
    });

    it('should reject email with spaces', () => {
      const validator = email();
      expect(validator('user @example.com').valid).toBe(false);
      expect(validator('user@exam ple.com').valid).toBe(false);
    });
  });

  // =============================================================================
  // Phone Validator Tests (Korean Format)
  // =============================================================================
  describe('phone', () => {
    it('should accept valid Korean phone format with hyphens', () => {
      const validator = phone();
      expect(validator('010-1234-5678').valid).toBe(true);
      expect(validator('011-123-4567').valid).toBe(true);
      expect(validator('016-1234-5678').valid).toBe(true);
    });

    it('should accept valid Korean phone format without hyphens', () => {
      const validator = phone();
      expect(validator('01012345678').valid).toBe(true);
      expect(validator('01112345678').valid).toBe(true);
    });

    it('should reject invalid phone format - wrong prefix', () => {
      const validator = phone();
      expect(validator('020-1234-5678').valid).toBe(false);
      expect(validator('123-1234-5678').valid).toBe(false);
    });

    it('should reject invalid phone format - wrong length', () => {
      const validator = phone();
      expect(validator('010-123-456').valid).toBe(false);
      expect(validator('010-12345-67890').valid).toBe(false);
    });

    it('should reject phone with letters', () => {
      const validator = phone();
      expect(validator('010-abcd-5678').valid).toBe(false);
    });
  });

  // =============================================================================
  // URL Validator Tests
  // =============================================================================
  describe('url', () => {
    it('should accept valid URLs', () => {
      const validator = url();
      expect(validator('https://example.com').valid).toBe(true);
      expect(validator('http://zzik.kr').valid).toBe(true);
      expect(validator('https://sub.domain.com/path?query=1').valid).toBe(true);
    });

    it('should accept empty string', () => {
      const validator = url();
      expect(validator('').valid).toBe(true);
    });

    it('should reject invalid URL format', () => {
      const validator = url();
      const result = validator('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('올바른 URL 형식이 아닙니다');
    });

    it('should reject URL without protocol', () => {
      const validator = url();
      expect(validator('example.com').valid).toBe(false);
    });
  });

  // =============================================================================
  // Number Validator Tests
  // =============================================================================
  describe('min', () => {
    it('should accept number greater than or equal to min', () => {
      const validator = min(10);
      expect(validator(10).valid).toBe(true);
      expect(validator(15).valid).toBe(true);
    });

    it('should reject number less than min', () => {
      const validator = min(10);
      const result = validator(5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('10 이상이어야 합니다');
    });
  });

  describe('max', () => {
    it('should accept number less than or equal to max', () => {
      const validator = max(100);
      expect(validator(100).valid).toBe(true);
      expect(validator(50).valid).toBe(true);
    });

    it('should reject number greater than max', () => {
      const validator = max(100);
      const result = validator(150);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('100 이하여야 합니다');
    });
  });

  describe('range', () => {
    it('should accept number within range', () => {
      const validator = range(10, 100);
      expect(validator(10).valid).toBe(true);
      expect(validator(50).valid).toBe(true);
      expect(validator(100).valid).toBe(true);
    });

    it('should reject number outside range', () => {
      const validator = range(10, 100);
      expect(validator(5).valid).toBe(false);
      expect(validator(150).valid).toBe(false);
    });
  });

  // =============================================================================
  // Pattern Validator Tests
  // =============================================================================
  describe('pattern', () => {
    it('should accept matching pattern', () => {
      const validator = pattern(/^\d{3}-\d{4}$/, 'Invalid format');
      expect(validator('123-4567').valid).toBe(true);
    });

    it('should reject non-matching pattern', () => {
      const validator = pattern(/^\d{3}-\d{4}$/, 'Invalid format');
      const result = validator('abc-defg');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid format');
    });
  });

  // =============================================================================
  // Custom Validator Tests
  // =============================================================================
  describe('custom', () => {
    it('should accept when custom validation passes', () => {
      const validator = custom((value: number) => value % 2 === 0, '짝수여야 합니다');
      expect(validator(4).valid).toBe(true);
      expect(validator(10).valid).toBe(true);
    });

    it('should reject when custom validation fails', () => {
      const validator = custom((value: number) => value % 2 === 0, '짝수여야 합니다');
      const result = validator(5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('짝수여야 합니다');
    });
  });

  // =============================================================================
  // Match Validator Tests
  // =============================================================================
  describe('match', () => {
    it('should accept matching values', () => {
      const password = 'secret123';
      const validator = match(() => password, '비밀번호가 일치하지 않습니다');
      expect(validator('secret123').valid).toBe(true);
    });

    it('should reject non-matching values', () => {
      const password = 'secret123';
      const validator = match(() => password, '비밀번호가 일치하지 않습니다');
      const result = validator('different');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('비밀번호가 일치하지 않습니다');
    });
  });

  // =============================================================================
  // validateField Tests
  // =============================================================================
  describe('validateField', () => {
    it('should pass when all validators succeed', () => {
      const validators = [required(), minLength(3), maxLength(10)];
      const result = validateField('hello', validators);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail on first failing validator', () => {
      const validators = [required(), minLength(10), maxLength(20)];
      const result = validateField('short', validators);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('최소 10자 이상 입력하세요');
    });

    it('should return immediately on first error', () => {
      const validators = [
        required('Required'),
        minLength(5, 'Min 5'),
        maxLength(3, 'Max 3'), // This should never be reached
      ];
      const result = validateField('ab', validators);
      expect(result.error).toBe('Min 5'); // Not 'Max 3'
    });
  });

  // =============================================================================
  // validateForm Tests
  // =============================================================================
  describe('validateForm', () => {
    it('should validate entire form successfully', () => {
      const data = {
        email: 'user@example.com',
        password: 'secret123',
        age: 25,
      };
      const schema = {
        email: [required(), email()],
        password: [required(), minLength(6)],
        age: [min(18), max(100)],
      };
      const result = validateForm(data, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should collect all validation errors', () => {
      const data = {
        email: 'invalid-email',
        password: '123',
        age: 15,
      };
      const schema = {
        email: [required(), email()],
        password: [required(), minLength(6)],
        age: [min(18)],
      };
      const result = validateForm(data, schema);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('올바른 이메일 형식이 아닙니다');
      expect(result.errors.password).toBe('최소 6자 이상 입력하세요');
      expect(result.errors.age).toBe('18 이상이어야 합니다');
    });

    it('should skip validation for undefined schema fields', () => {
      const data = { name: 'John', extra: 'value' };
      const schema = {
        name: [required(), minLength(2)],
      };
      const result = validateForm(data, schema);
      expect(result.valid).toBe(true);
    });

    it('should handle empty form', () => {
      const data = {};
      const schema = {};
      const result = validateForm(data, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  // =============================================================================
  // Pre-built Schema Tests
  // =============================================================================
  describe('loginSchema', () => {
    it('should validate correct login form', () => {
      const data = {
        email: 'user@zzik.kr',
        password: 'password123',
      };
      const result = validateForm(data, loginSchema);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid login form', () => {
      const data = {
        email: 'invalid',
        password: '123',
      };
      const result = validateForm(data, loginSchema);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('signupSchema', () => {
    it('should validate correct signup form', () => {
      const data = {
        email: 'new@zzik.kr',
        password: 'Password123',
        name: 'John Doe',
      };
      const result = validateForm(data, signupSchema);
      expect(result.valid).toBe(true);
    });

    it('should reject weak password', () => {
      const data = {
        email: 'new@zzik.kr',
        password: 'password', // No number
        name: 'John',
      };
      const result = validateForm(data, signupSchema);
      expect(result.valid).toBe(false);
      expect(result.errors.password).toBe('비밀번호는 영문과 숫자를 포함해야 합니다');
    });

    it('should reject name too short', () => {
      const data = {
        email: 'new@zzik.kr',
        password: 'Pass123',
        name: 'J',
      };
      const result = validateForm(data, signupSchema);
      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });
  });

  describe('profileSchema', () => {
    it('should validate correct profile form', () => {
      const data = {
        nickname: 'zzik_user',
        bio: 'Hello world',
        phone: '010-1234-5678',
      };
      const result = validateForm(data, profileSchema);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid phone', () => {
      const data = {
        nickname: 'user',
        bio: '',
        phone: '123-456-7890',
      };
      const result = validateForm(data, profileSchema);
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBe('올바른 전화번호 형식이 아닙니다');
    });
  });
});
