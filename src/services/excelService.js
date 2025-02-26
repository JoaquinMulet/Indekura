import ExcelJS from 'exceljs';

/**
 * Transpone datos para la exportación a Excel
 * @param {Object[]} data - Datos a transponer
 * @returns {Array[]} - Datos transpuestos
 */
export const transposeData = (data) => {
  if (!data || data.length === 0) return [];
  const headers = Object.keys(data[0]).filter(key => key !== 'date');
  
  return headers.map(header => {
    return [header, ...data.map(item => item[header])];
  });
};

/**
 * Crea y formatea una hoja de Excel
 * @param {ExcelJS.Workbook} workbook - Libro de Excel
 * @param {string} name - Nombre de la hoja
 * @param {Object[]} data - Datos para la hoja
 */
export const createSheet = (workbook, name, data) => {
  const sheet = workbook.addWorksheet(name);
  const transposedData = transposeData(data);
  
  // Agregar años como encabezados
  const years = data.map(item => item.date);
  sheet.getRow(1).values = ['Concepto', ...years];
  
  // Agregar datos
  transposedData.forEach((row, index) => {
    sheet.getRow(index + 2).values = row;
  });
  
  // Formatear encabezados
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };
  
  // Ajustar ancho de columnas
  sheet.columns.forEach(column => {
    column.width = 15;
  });
  
  // Agregar bordes a todas las celdas con datos
  const lastRow = sheet.lastRow.number;
  const lastCol = sheet.lastColumn.number;
  for (let row = 1; row <= lastRow; row++) {
    for (let col = 1; col <= lastCol; col++) {
      const cell = sheet.getCell(row, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }
};

/**
 * Exporta datos financieros a Excel
 * @param {Object} financialData - Datos financieros
 * @param {string} ticker - Símbolo de la empresa
 * @returns {Promise<Blob>} - Archivo Excel como Blob
 */
export const exportFinancialDataToExcel = async (financialData, ticker) => {
  const workbook = new ExcelJS.Workbook();
  
  // Crear hojas para cada tipo de estado financiero
  if (financialData.incomeStatement.length > 0) {
    createSheet(workbook, 'Income Statement', financialData.incomeStatement);
  }
  if (financialData.balanceSheet.length > 0) {
    createSheet(workbook, 'Balance Sheet', financialData.balanceSheet);
  }
  if (financialData.cashFlow.length > 0) {
    createSheet(workbook, 'Cash Flow', financialData.cashFlow);
  }
  if (financialData.estimates.length > 0) {
    createSheet(workbook, 'Estimates', financialData.estimates);
  }

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
};
