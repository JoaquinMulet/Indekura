import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

/**
 * Componente para mostrar el gráfico de payoff de la opción
 */
const OptionChart = ({ results, inputs, chartRef, chartInstanceRef }) => {
  useEffect(() => {
    if (!results || !chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    const { scenarios, isCall } = results;
    
    // Preparar datos para el gráfico
    const labels = scenarios.map(s => Math.round(s.futureSpot).toString());
    const netResultData = scenarios.map(s => s.result);
    
    // Crear nuevo gráfico
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Resultado neto (CLP)',
            data: netResultData,
            borderColor: isCall ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
            backgroundColor: isCall ? 'rgba(54, 162, 235, 0.2)' : 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                if (context.parsed.y !== null) {
                  const value = context.parsed.y.toFixed(0);
                  return `${label}: ${value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} CLP`;
                } else {
                  return null; // No mostrar etiqueta para el punto de equilibrio
                }
              }
            }
          },
          annotation: {
            annotations: {
              spotLine: {
                type: 'line',
                xMin: inputs.spot,
                xMax: inputs.spot,
                borderColor: 'rgba(75, 192, 192, 0.7)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Spot actual: ${inputs.spot.toFixed(2)}`,
                  position: 'start'
                }
              },
              strikeLine: {
                type: 'line',
                xMin: inputs.strike,
                xMax: inputs.strike,
                borderColor: 'rgba(153, 102, 255, 0.7)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Strike: ${inputs.strike.toFixed(2)}`,
                  position: 'start'
                }
              },
              breakEvenLine: {
                type: 'line',
                xMin: results.breakEven,
                xMax: results.breakEven,
                borderColor: 'rgba(255, 159, 64, 0.7)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Break-even: ${results.breakEven.toFixed(2)}`,
                  position: 'start'
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Tipo de cambio futuro (CLP/USD)'
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Resultado (CLP)'
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [results, inputs, chartRef, chartInstanceRef]);
  
  return (
    <div className="option-chart">
      <h3 style={{ 
        fontSize: '1.2rem', 
        fontWeight: '600', 
        marginBottom: '15px',
        color: '#333333'
      }}>Gráfico de payoff</h3>
      
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '20px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        height: '400px',
        flex: '1'
      }}>
        <canvas id="payoffChart" ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default OptionChart;
