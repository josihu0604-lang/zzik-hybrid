import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from '@/hooks/useForm';
import { required, minLength, email } from '@/lib/validation';

describe('useForm hook', () => {
  // =============================================================================
  // Initial State Tests
  // =============================================================================
  describe('Initialization', () => {
    it('should initialize with provided values', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John', email: 'john@example.com' },
        })
      );

      expect(result.current.values).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('should initialize with empty errors', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
        })
      );

      expect(result.current.errors).toEqual({});
    });

    it('should initialize with empty touched', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
        })
      );

      expect(result.current.touched).toEqual({});
    });

    it('should initialize as not submitting', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should initialize as not dirty', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
        })
      );

      expect(result.current.isDirty).toBe(false);
    });

    it('should initialize as valid without validation schema', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  // =============================================================================
  // handleChange Tests
  // =============================================================================
  describe('handleChange', () => {
    it('should update field value on change', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'John', type: 'text' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.name).toBe('John');
    });

    it('should handle checkbox input type', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { agreed: false },
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'agreed', checked: true, type: 'checkbox' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.agreed).toBe(true);
    });

    it('should mark form as dirty after change', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'original' },
        })
      );

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'changed', type: 'text' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('should validate on change when validateOnChange is true', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: '' },
          validation: {
            email: [required(), email()],
          },
          validateOnChange: true,
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'invalid', type: 'text' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.email).toBeDefined();
    });

    it('should not validate on change when validateOnChange is false', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: '' },
          validation: {
            email: [required(), email()],
          },
          validateOnChange: false,
        })
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'email', value: 'invalid', type: 'text' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  // =============================================================================
  // handleBlur Tests
  // =============================================================================
  describe('handleBlur', () => {
    it('should mark field as touched on blur', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      act(() => {
        result.current.handleBlur({
          target: { name: 'name' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.touched.name).toBe(true);
    });

    it('should validate on blur by default', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'invalid' },
          validation: {
            email: [email()],
          },
        })
      );

      act(() => {
        result.current.handleBlur({
          target: { name: 'email' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.email).toBeDefined();
    });

    it('should not validate on blur when validateOnBlur is false', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'invalid' },
          validation: {
            email: [email()],
          },
          validateOnBlur: false,
        })
      );

      act(() => {
        result.current.handleBlur({
          target: { name: 'email' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.errors.email).toBeUndefined();
    });
  });

  // =============================================================================
  // handleSubmit Tests
  // =============================================================================
  describe('handleSubmit', () => {
    it('should call onSubmit with valid form', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
          validation: {
            name: [required()],
          },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
    });

    it('should not call onSubmit with invalid form', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validation: {
            name: [required()],
          },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should touch all fields on submit', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);
    });

    it('should prevent default form event', async () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should validate form before submit', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'invalid' },
          validation: {
            email: [email()],
          },
          onSubmit,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.errors.email).toBeDefined();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // =============================================================================
  // setValue and setValues Tests
  // =============================================================================
  describe('setValue and setValues', () => {
    it('should set single field value', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '' },
        })
      );

      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.values.email).toBe('');
    });

    it('should set multiple field values', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: '', age: 0 },
        })
      );

      act(() => {
        result.current.setValues({ name: 'John', email: 'john@example.com' });
      });

      expect(result.current.values.name).toBe('John');
      expect(result.current.values.email).toBe('john@example.com');
      expect(result.current.values.age).toBe(0);
    });

    it('should mark form as dirty after setValue', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'original' },
        })
      );

      act(() => {
        result.current.setValue('name', 'changed');
      });

      expect(result.current.isDirty).toBe(true);
    });
  });

  // =============================================================================
  // setError Tests
  // =============================================================================
  describe('setError', () => {
    it('should set field error', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      act(() => {
        result.current.setError('name', 'Custom error');
      });

      expect(result.current.errors.name).toBe('Custom error');
    });

    it('should clear field error when set to undefined', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      act(() => {
        result.current.setError('name', 'Error');
      });

      expect(result.current.errors.name).toBe('Error');

      act(() => {
        result.current.setError('name', undefined);
      });

      expect(result.current.errors.name).toBeUndefined();
    });
  });

  // =============================================================================
  // reset Tests
  // =============================================================================
  describe('reset', () => {
    it('should reset to initial values', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'initial', email: 'test@example.com' },
        })
      );

      act(() => {
        result.current.setValue('name', 'changed');
        result.current.setValue('email', 'new@example.com');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual({
        name: 'initial',
        email: 'test@example.com',
      });
    });

    it('should clear all errors on reset', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validation: {
            name: [required()],
          },
        })
      );

      act(() => {
        result.current.validateFieldByName('name');
      });

      expect(result.current.errors.name).toBeDefined();

      act(() => {
        result.current.reset();
      });

      expect(result.current.errors).toEqual({});
    });

    it('should clear all touched fields on reset', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      act(() => {
        result.current.handleBlur({
          target: { name: 'name' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.touched).toEqual({});
    });

    it('should reset isDirty flag', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'initial' },
        })
      );

      act(() => {
        result.current.setValue('name', 'changed');
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  // =============================================================================
  // Validation Tests
  // =============================================================================
  describe('validateFieldByName', () => {
    it('should validate single field', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'invalid' },
          validation: {
            email: [email()],
          },
        })
      );

      let isValid: boolean = true;
      act(() => {
        isValid = result.current.validateFieldByName('email');
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.email).toBeDefined();
    });

    it('should return true for valid field', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { email: 'valid@example.com' },
          validation: {
            email: [email()],
          },
        })
      );

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validateFieldByName('email');
      });

      expect(isValid).toBe(true);
      expect(result.current.errors.email).toBeUndefined();
    });

    it('should not validate field without schema', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
        })
      );

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validateFieldByName('name');
      });

      expect(isValid).toBe(true);
    });
  });

  describe('validate', () => {
    it('should validate entire form', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '', email: 'invalid' },
          validation: {
            name: [required()],
            email: [email()],
          },
        })
      );

      let isValid: boolean = true;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.name).toBeDefined();
      expect(result.current.errors.email).toBeDefined();
    });

    it('should return true for valid form', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John', email: 'john@example.com' },
          validation: {
            name: [required()],
            email: [email()],
          },
        })
      );

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });
  });

  // =============================================================================
  // isValid and isDirty Tests
  // =============================================================================
  describe('isValid', () => {
    it('should be true for valid form', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
          validation: {
            name: [required(), minLength(2)],
          },
        })
      );

      expect(result.current.isValid).toBe(true);
    });

    it('should be false for invalid form', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validation: {
            name: [required()],
          },
        })
      );

      expect(result.current.isValid).toBe(false);
    });

    it('should update when values change', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: '' },
          validation: {
            name: [required()],
          },
        })
      );

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setValue('name', 'John');
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('isDirty', () => {
    it('should be false initially', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
        })
      );

      expect(result.current.isDirty).toBe(false);
    });

    it('should be true after changing values', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
        })
      );

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('should be false after reset', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
        })
      );

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  // =============================================================================
  // getFieldProps Tests
  // =============================================================================
  describe('getFieldProps', () => {
    it('should return field props object', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
        })
      );

      const fieldProps = result.current.getFieldProps('name');

      expect(fieldProps.name).toBe('name');
      expect(fieldProps.value).toBe('John');
      expect(typeof fieldProps.onChange).toBe('function');
      expect(typeof fieldProps.onBlur).toBe('function');
    });

    it('should update value when field changes', () => {
      const { result } = renderHook(() =>
        useForm({
          initialValues: { name: 'John' },
        })
      );

      act(() => {
        result.current.setValue('name', 'Jane');
      });

      const fieldProps = result.current.getFieldProps('name');
      expect(fieldProps.value).toBe('Jane');
    });
  });
});
