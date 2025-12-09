'use client';

import { useState, useCallback, useMemo, type ChangeEvent, type FormEvent } from 'react';
import {
  type ValidationSchema,
  type ValidationErrors,
  type Validator,
  validateField,
  validateForm,
} from '@/lib/validation';
import { useHaptic } from './useHaptic';

/**
 * useForm - Form state management hook
 *
 * Features:
 * - Type-safe form state
 * - Validation on blur/change/submit
 * - Field-level error messages
 * - Touch tracking
 * - Submit handling
 * - DES-121: Form success haptic feedback
 */

interface UseFormOptions<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation schema */
  validation?: ValidationSchema<T>;
  /** Validate on field change */
  validateOnChange?: boolean;
  /** Validate on field blur */
  validateOnBlur?: boolean;
  /** Submit handler */
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  /** Current form values */
  values: T;
  /** Validation errors */
  errors: ValidationErrors<T>;
  /** Touched fields */
  touched: Partial<Record<keyof T, boolean>>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form has been modified */
  isDirty: boolean;
  /** Set a field value */
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  /** Set multiple values */
  setValues: (values: Partial<T>) => void;
  /** Set a field error */
  setError: <K extends keyof T>(field: K, error: string | undefined) => void;
  /** Handle input change */
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  /** Handle field blur */
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  /** Handle form submit */
  handleSubmit: (e?: FormEvent) => Promise<void>;
  /** Reset form to initial values */
  reset: () => void;
  /** Validate a specific field */
  validateFieldByName: <K extends keyof T>(field: K) => boolean;
  /** Validate entire form */
  validate: () => boolean;
  /** Get field props for easy binding */
  getFieldProps: <K extends keyof T>(
    field: K
  ) => {
    name: K;
    value: T[K];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validation,
  validateOnChange = false,
  validateOnBlur = true,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DES-121: 햅틱 피드백
  const haptic = useHaptic();

  // Check if form is dirty (modified)
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => {
    if (!validation) return true;
    const { valid } = validateForm(values, validation);
    return valid;
  }, [values, validation]);

  // Set single field value
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set field error
  const setError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Validate single field
  const validateFieldByName = useCallback(
    <K extends keyof T>(field: K): boolean => {
      if (!validation || !validation[field]) return true;

      const validators = validation[field] as Validator<T[K]>[];
      const result = validateField(values[field], validators);

      setErrors((prev) => ({
        ...prev,
        [field]: result.error,
      }));

      return result.valid;
    },
    [values, validation]
  );

  // Validate entire form
  const validate = useCallback((): boolean => {
    if (!validation) return true;

    const { valid, errors: newErrors } = validateForm(values, validation);
    setErrors(newErrors);
    return valid;
  }, [values, validation]);

  // Handle input change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValue(name as keyof T, fieldValue as T[keyof T]);

      if (validateOnChange) {
        validateFieldByName(name as keyof T);
      }
    },
    [setValue, validateOnChange, validateFieldByName]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;

      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        validateFieldByName(name as keyof T);
      }
    },
    [validateOnBlur, validateFieldByName]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();

      // Touch all fields
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      // Validate
      if (!validate()) {
        // DES-121: 유효성 검사 실패 시 에러 햅틱
        haptic.error();
        return;
      }

      // Submit
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
          // DES-121: 성공 시 햅틱 피드백
          haptic.success();
        } catch (error) {
          // DES-121: 실패 시 에러 햅틱
          haptic.error();
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validate, onSubmit, haptic]
  );

  // Reset form
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field props helper
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => ({
      name: field,
      value: values[field],
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateFieldByName,
    validate,
    getFieldProps,
  };
}

/**
 * useField - Single field hook for complex field components
 */
interface UseFieldOptions<T> {
  name: string;
  form: UseFormReturn<T>;
}

export function useField<T extends Record<string, unknown>, V = unknown>({
  name,
  form,
}: UseFieldOptions<T>) {
  const field = name as keyof T;

  return {
    value: form.values[field] as V,
    error: form.errors[field],
    touched: form.touched[field],
    setValue: (value: V) => form.setValue(field, value as T[keyof T]),
    setError: (error: string | undefined) => form.setError(field, error),
    props: form.getFieldProps(field),
  };
}

export default useForm;
