import { describe, it, expect } from 'vitest';
import { formatNumber, formatValuationValue } from '../../utils/formatters';

describe('formatNumber', () => {
  it('devuelve "N/A" para valores undefined o null', () => {
    expect(formatNumber(undefined, 'any_key')).toBe('N/A');
    expect(formatNumber(null, 'any_key')).toBe('N/A');
  });

  it('convierte strings a números cuando es posible', () => {
    expect(formatNumber('123.45', 'any_key')).toBe('123.45');
    expect(formatNumber('abc', 'any_key')).toBe('abc');
  });

  it('formatea score_final con 2 decimales', () => {
    expect(formatNumber(123.456, 'score_final')).toBe('123.46');
    expect(formatNumber(123, 'score_final')).toBe('123.00');
  });

  it('formatea precios con formato de moneda', () => {
    expect(formatNumber(1234.56, 'current_price')).toBe('1,234.56');
    expect(formatNumber(1234.56, 'fair_value_min')).toBe('1,234.56');
    expect(formatNumber(1234.56, 'fair_value_max')).toBe('1,234.56');
  });

  it('convierte otros números a string', () => {
    expect(formatNumber(123.456, 'other_key')).toBe('123.456');
  });
});

describe('formatValuationValue', () => {
  it('devuelve "N/A" para valores undefined o null', () => {
    expect(formatValuationValue(undefined)).toBe('N/A');
    expect(formatValuationValue(null)).toBe('N/A');
  });

  it('formatea números con 2 decimales', () => {
    expect(formatValuationValue(123.456)).toBe('123.46');
    expect(formatValuationValue(123)).toBe('123.00');
  });

  it('devuelve el valor como está si no es un número', () => {
    expect(formatValuationValue('abc')).toBe('abc');
  });
});
