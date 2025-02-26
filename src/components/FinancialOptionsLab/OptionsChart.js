import Chart from 'chart.js/auto';
import { formatCurrency, formatNumber, formatPercent } from '../../services/formatService';

/**
 * Crea o actualiza el gráfico de resultados de opciones financieras
 * 
 * @param {Object} params - Parámetros para crear el gráfico
 * @param {HTMLCanvasElement} params.chartRef - Referencia al elemento canvas
 * @param {Object} params.chartInstanceRef - Referencia a la instancia del gráfico
 * @param {Array} params.scenarios - Escenarios de resultados
 * @param {Object} params.inputs - Inputs del usuario
 * @param {Object} params.results - Resultados del cálculo
 */
export const createChart = ({ chartRef, chartInstanceRef, scenarios, inputs, results }) => {
  try {
    if (!scenarios || scenarios.length === 0) {
      console.warn("No hay escenarios para mostrar en el gráfico");
      return;
    }

    if (!chartRef) {
      console.warn("Referencia al canvas del gráfico no disponible");
      return;
    }

    // Destruir el gráfico existente si hay uno
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    // Preparar datos para el gráfico
    const spotPrices = scenarios.map(s => s.futureSpot);
    const netResults = scenarios.map(s => s.result);
    const payoffs = scenarios.map(s => s.payoff);
    
    // Encontrar el punto de equilibrio
    const breakEvenPoint = results?.breakEven || scenarios[0]?.breakEven;
    
    // Asignar colores según el tipo de opción
    let primaryColor, secondaryColor, tertiaryColor, quaternaryColor;
    
    if (inputs.optionType === 'call') {
      // Azul para Call Options
      primaryColor = 'rgba(25, 118, 210, 1)';     // Azul principal
      secondaryColor = 'rgba(25, 118, 210, 0.7)'; // Azul secundario
      tertiaryColor = 'rgba(25, 118, 210, 0.15)'; // Azul fondo
      quaternaryColor = 'rgba(76, 175, 80, 0.8)'; // Verde para indicadores positivos
    } else {
      // Rojo para Put Options
      primaryColor = 'rgba(211, 47, 47, 1)';     // Rojo principal
      secondaryColor = 'rgba(211, 47, 47, 0.7)'; // Rojo secundario
      tertiaryColor = 'rgba(211, 47, 47, 0.15)'; // Rojo fondo
      quaternaryColor = 'rgba(255, 152, 0, 0.8)'; // Naranja para indicadores
    }
    
    // Definir el gradiente para el área bajo la curva de resultado neto
    const ctx = chartRef.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, netResults[0] >= 0 ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)');  // Verde/Rojo para ganancia/pérdida
    gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.1)');  // Transición
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');   // Transparente en el fondo
    
    // Calcular los límites del eje X para mostrar un rango apropiado
    const minSpot = Math.min(...spotPrices) * 0.95;  // 5% menor que el mínimo
    const maxSpot = Math.max(...spotPrices) * 1.05;  // 5% mayor que el máximo
    
    // Calcular los límites del eje Y para tener un margen adecuado
    const minResult = Math.min(...netResults) * 1.2;  // 20% menor que el mínimo negativo
    const maxResult = Math.max(...netResults) * 1.2;  // 20% mayor que el máximo positivo
    
    // Crear el gráfico
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: spotPrices,
        datasets: [
          {
            label: 'Resultado Neto (CLP)',
            data: netResults,
            borderColor: primaryColor,
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: primaryColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: primaryColor,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            fill: true,
            tension: 0.2,
            order: 1
          },
          {
            label: 'Payoff Bruto (CLP)',
            data: payoffs,
            borderColor: secondaryColor,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: secondaryColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 1,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: secondaryColor,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            fill: false,
            tension: 0.2,
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 6,
            caretSize: 6,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.raw;
                return `${label}: ${formatCurrency(value, 'CLP', 2)}`;
              },
              title: function(context) {
                return `Precio Spot: ${formatNumber(context[0].label, 2)} CLP/USD`;
              },
              afterBody: function(context) {
                // Calcular y mostrar la variación porcentual respecto al precio actual
                const currentSpot = inputs.spot;
                const scenarioSpot = context[0].label;
                const variation = ((scenarioSpot - currentSpot) / currentSpot) * 100;
                
                // Calcular el payoff y resultado para este escenario
                const payoff = context.find(c => c.dataset.label.includes('Payoff'))?.raw || 0;
                const result = context.find(c => c.dataset.label.includes('Neto'))?.raw || 0;
                const resultPercent = results?.premium && results?.currencyAmount ? 
                  (result / (results.premium * results.currencyAmount) * 100) : 0;
                
                return [
                  `Variación: ${variation >= 0 ? '+' : ''}${formatPercent(variation / 100, 2)}`,
                  `Rentabilidad: ${formatPercent(resultPercent / 100, 2)}`
                ];
              }
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 15,
              padding: 15,
              font: {
                size: 13
              }
            }
          },
          title: {
            display: true,
            text: `Escenarios de ${inputs.optionType === 'call' ? 'Compra (Call)' : 'Venta (Put)'} de Divisas al Vencimiento`,
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          subtitle: {
            display: true,
            text: `Strike: ${formatNumber(inputs.strike, 2)} CLP/USD | Prima: ${formatCurrency(results?.premium || 0, 'CLP', 2)}`,
            padding: {
              bottom: 10
            },
            font: {
              size: 14,
              style: 'italic'
            }
          },
          annotation: {
            annotations: {
              // Línea del precio actual
              currentSpotLine: {
                type: 'line',
                xMin: inputs.spot,
                xMax: inputs.spot,
                borderColor: 'rgba(33, 150, 243, 0.8)',
                borderWidth: 2,
                label: {
                  display: true,
                  content: 'Spot Actual',
                  position: 'start',
                  backgroundColor: 'rgba(33, 150, 243, 0.8)',
                  color: '#fff',
                  font: {
                    size: 12
                  },
                  padding: 4
                }
              },
              // Línea del precio strike
              strikeLine: {
                type: 'line',
                xMin: inputs.strike,
                xMax: inputs.strike,
                borderColor: 'rgba(156, 39, 176, 0.8)',
                borderWidth: 2,
                label: {
                  display: true,
                  content: 'Strike',
                  position: 'end',
                  backgroundColor: 'rgba(156, 39, 176, 0.8)',
                  color: '#fff',
                  font: {
                    size: 12
                  },
                  padding: 4
                }
              },
              // Línea del punto de equilibrio
              breakEvenLine: {
                type: 'line',
                xMin: breakEvenPoint,
                xMax: breakEvenPoint,
                borderColor: 'rgba(255, 87, 34, 0.8)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: 'Punto de Equilibrio',
                  position: inputs.optionType === 'call' ? 'center' : 'start',
                  backgroundColor: 'rgba(255, 87, 34, 0.8)',
                  color: '#fff',
                  font: {
                    size: 12
                  },
                  padding: 4
                }
              },
              // Línea de ganancia/pérdida cero
              zeroLine: {
                type: 'line',
                yMin: 0,
                yMax: 0,
                borderColor: 'rgba(0, 0, 0, 0.3)',
                borderWidth: 1,
                borderDash: [2, 2]
              },
              // Caja que resalta el área de ganancia
              profitBox: {
                type: 'box',
                xMin: inputs.optionType === 'call' ? breakEvenPoint : minSpot,
                xMax: inputs.optionType === 'call' ? maxSpot : breakEvenPoint,
                yMin: 0,
                yMax: maxResult,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: 'rgba(76, 175, 80, 0.3)',
                borderWidth: 1,
                borderDash: [2, 2],
                label: {
                  display: true,
                  content: 'Área de Ganancia',
                  position: 'center',
                  color: 'rgba(76, 175, 80, 0.7)',
                  font: {
                    size: 14,
                    style: 'italic',
                    weight: 'bold'
                  }
                }
              },
              // Caja que resalta el área de pérdida
              lossBox: {
                type: 'box',
                xMin: inputs.optionType === 'call' ? minSpot : breakEvenPoint,
                xMax: inputs.optionType === 'call' ? breakEvenPoint : maxSpot,
                yMin: minResult,
                yMax: 0,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderColor: 'rgba(244, 67, 54, 0.3)',
                borderWidth: 1,
                borderDash: [2, 2],
                label: {
                  display: true,
                  content: 'Área de Pérdida',
                  position: 'center',
                  color: 'rgba(244, 67, 54, 0.7)',
                  font: {
                    size: 14,
                    style: 'italic',
                    weight: 'bold'
                  }
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Precio Spot (CLP/USD)',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                top: 10
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: true,
              drawTicks: true
            },
            min: minSpot,
            max: maxSpot,
            ticks: {
              font: {
                size: 12
              },
              callback: function(value) {
                return formatNumber(value, 0);
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Resultado (CLP)',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                bottom: 10
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: true,
              drawTicks: true
            },
            ticks: {
              font: {
                size: 12
              },
              callback: function(value) {
                return formatCurrency(value, 'CLP', 0);
              }
            },
            min: minResult,
            max: maxResult
          }
        }
      }
    });
  } catch (error) {
    console.error("Error al crear el gráfico:", error);
  }
};

export default {
  createChart
};
