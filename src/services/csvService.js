/**
 * Parsea una línea de CSV respetando las comillas dobles
 * @param {string} line - Línea de CSV a parsear
 * @returns {string[]} - Array con los valores parseados
 */
export const parseCSVLine = (line) => {
  const result = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  result.push(currentValue.trim());
  return result;
};

/**
 * Procesa un archivo CSV completo
 * @param {string} csvText - Contenido del archivo CSV
 * @param {Object[]} displayColumns - Columnas a mostrar
 * @returns {Object[]} - Datos procesados
 */
export const processCSV = (csvText, displayColumns) => {
  if (!csvText || csvText.trim() === '') {
    return [];
  }

  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    return [];
  }

  // Procesar encabezados y crear un mapa de índices
  const headerLine = parseCSVLine(lines[0]);
  const headerIndexMap = {};
  headerLine.forEach((header, index) => {
    headerIndexMap[header.trim()] = index;
  });

  // Si solo hay encabezados, devolver un array vacío
  if (lines.length === 1) {
    return [];
  }

  // Procesar datos solo para las columnas que queremos mostrar
  const dataRows = lines.slice(1);
  return dataRows.map(row => {
    const values = parseCSVLine(row);
    const rowData = {};
    
    displayColumns.forEach(({ key }) => {
      const index = headerIndexMap[key];
      if (index !== undefined) {
        const value = values[index] || '';
        // Convertir valores numéricos excepto para campos específicos
        if (!['symbol', 'companyName', 'sector', 'industry', 'reported_currency'].includes(key)) {
          const numValue = value.replace(/[^0-9.-]/g, '');
          rowData[key] = !isNaN(numValue) && numValue !== '' ? parseFloat(numValue) : value;
        } else {
          rowData[key] = value;
        }
      }
    });
    return rowData;
  });
};
