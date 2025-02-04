import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

// Configuración base para todos los gráficos
export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align: 'center',
      labels: {
        boxWidth: 15,
        padding: 15,
        font: { size: 12 }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      padding: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#333',
      bodyColor: '#666',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      bodyFont: { size: 12 },
      titleFont: { size: 12, weight: 'bold' }
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x'
      },
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'x',
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        font: { size: 10 }
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
};

// Función para procesar datos financieros
export const processFinancialData = (data, metric) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => item[metric]);
};

// Función para ordenar datos cronológicamente (más antiguo a más reciente)
export const sortDataChronologically = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Función para obtener años únicos
export const getUniqueYears = (...dataSets) => {
  const allYears = dataSets.flatMap(dataset => 
    dataset ? dataset.map(item => item.date) : []
  );
  return [...new Set(allYears)].sort((a, b) => new Date(a) - new Date(b));
};

// Colores estándar para los gráficos
export const chartColors = {
  blue: {
    border: 'rgb(59, 130, 246)',
    background: 'rgba(59, 130, 246, 0.1)'
  },
  green: {
    border: 'rgb(34, 197, 94)',
    background: 'rgba(34, 197, 94, 0.1)'
  }
};

// Función para crear opciones de eje Y
export const createYAxisOptions = (title, position = 'left', drawGrid = true) => ({
  type: 'linear',
  display: true,
  position,
  grid: {
    drawOnChartArea: drawGrid,
    color: drawGrid ? '#f1f5f9' : undefined
  },
  ticks: {
    font: { size: 10 }
  },
  title: {
    display: true,
    text: title,
    font: { size: 10 }
  }
});
