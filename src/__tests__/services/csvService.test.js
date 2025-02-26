import { describe, it, expect } from 'vitest';
import { processCSV, parseCSVLine } from '../../services/csvService';

describe('parseCSVLine', () => {
  it('parsea líneas CSV simples correctamente', () => {
    const line = 'value1,value2,value3';
    expect(parseCSVLine(line)).toEqual(['value1', 'value2', 'value3']);
  });

  it('respeta las comillas dobles', () => {
    const line = 'value1,"value with, comma",value3';
    expect(parseCSVLine(line)).toEqual(['value1', 'value with, comma', 'value3']);
  });

  it('maneja comillas dobles escapadas', () => {
    const line = 'value1,"value with ""quoted"" text",value3';
    expect(parseCSVLine(line)).toEqual(['value1', 'value with "quoted" text', 'value3']);
  });

  it('elimina espacios en blanco al inicio y final', () => {
    const line = ' value1 , value2 , value3 ';
    expect(parseCSVLine(line)).toEqual(['value1', 'value2', 'value3']);
  });
});

describe('processCSV', () => {
  const mockColumns = [
    { key: 'symbol', label: 'Symbol' },
    { key: 'price', label: 'Price' },
    { key: 'score', label: 'Score' }
  ];

  it('procesa un CSV vacío correctamente', () => {
    expect(processCSV('', mockColumns)).toEqual([]);
  });

  it('procesa un CSV con solo encabezados correctamente', () => {
    const csv = 'symbol,price,score';
    expect(processCSV(csv, mockColumns)).toEqual([]);
  });

  it('procesa un CSV con datos correctamente', () => {
    const csv = 'symbol,price,score\nAAPL,150.25,95.5\nMSFT,300.75,92.3';
    const expected = [
      { symbol: 'AAPL', price: 150.25, score: 95.5 },
      { symbol: 'MSFT', price: 300.75, score: 92.3 }
    ];
    expect(processCSV(csv, mockColumns)).toEqual(expected);
  });

  it('convierte valores numéricos correctamente', () => {
    const csv = 'symbol,price,score\nAAPL,150.25,95.5';
    const result = processCSV(csv, mockColumns);
    expect(typeof result[0].price).toBe('number');
    expect(typeof result[0].score).toBe('number');
    expect(typeof result[0].symbol).toBe('string');
  });

  it('maneja columnas faltantes', () => {
    const csv = 'symbol,score\nAAPL,95.5';
    const result = processCSV(csv, mockColumns);
    expect(result[0].symbol).toBe('AAPL');
    expect(result[0].score).toBe(95.5);
    expect(result[0].price).toBeUndefined();
  });

  it('ignora columnas que no están en la lista de columnas a mostrar', () => {
    const csv = 'symbol,price,score,extra_column\nAAPL,150.25,95.5,extra_value';
    const result = processCSV(csv, mockColumns);
    expect(Object.keys(result[0])).toEqual(['symbol', 'price', 'score']);
    expect(result[0].extra_column).toBeUndefined();
  });
});
