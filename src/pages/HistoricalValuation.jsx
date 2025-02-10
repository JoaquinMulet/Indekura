import React, { useEffect } from 'react';
import './HistoricalValuation.css';

const HistoricalValuation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="valuation-method-page">
      <div className="valuation-method-content">
        <h1>Valoración Histórica</h1>
        
        <section className="method-section">
          <h2>Explicación del Método</h2>
          <p>
            La metodología propuesta para valorar empresas parte de un concepto fundamental: la valoración se basa en el valor presente de los flujos de caja futuros. 
            Tradicionalmente, este enfoque se implementa mediante el Modelo de Descuento de Dividendos (DDM). Sin embargo, cuando los dividendos no son regulares o 
            cuando se desea evaluar la capacidad real de generación de beneficios, se sustituye el flujo de dividendos por el beneficio por acción (EPS).
          </p>
        </section>

        <section className="method-section">
          <h2>Fundamentos del Modelo</h2>
          <h3>Perpetuidad en la Generación de Beneficios</h3>
          <p>
            Se asume que la empresa operará indefinidamente y que sus EPS representan de forma fidedigna la capacidad de generar valor a lo largo del tiempo. 
            Esto se debe a que, en el largo plazo, las utilidades contables (EPS) reflejan los flujos de caja libres que la compañía produce.
          </p>

          <h3>Reinversión Eficiente</h3>
          <p>
            La metodología supone que si la empresa retiene parte de sus beneficios en lugar de distribuirlos como dividendos, esos fondos se reinvierten 
            de manera eficiente para impulsar el crecimiento del EPS.
          </p>
        </section>

        <section className="method-section">
          <h2>La Fórmula</h2>
          <div className="formula">P = EPS / (r - g)</div>
          <div className="formula-explanation">donde r es el costo de capital y g la tasa de crecimiento</div>
          
          <p>
            Al despejar g de la fórmula, obtenemos:
          </p>
          <div className="formula">g = r - EPS/P</div>
          <p>
            El cociente EPS/P (earnings yield) es el inverso del múltiplo precio-beneficio (P/E). Un earnings yield alto indica buenos beneficios en relación al precio,
            asociado a expectativas de crecimiento moderado. Un earnings yield bajo sugiere expectativas de mayor crecimiento.
          </p>
        </section>

        <section className="method-section">
          <h2>Análisis Estadístico</h2>
          <p>
            Reconociendo la volatilidad de los mercados financieros, se aplican técnicas estadísticas para ajustar la estimación de g. Se analiza la variabilidad 
            histórica del parámetro g para identificar la dispersión de las expectativas de crecimiento y se extraen cuantiles que ofrezcan tasas de crecimiento 
            ajustadas y conservadoras.
          </p>
        </section>

        <section className="method-section">
          <h2>Reflexión sobre el Modelo</h2>
          <p>
            Este enfoque nos invita a considerar que la esencia de la valoración no reside únicamente en el valor absoluto de la tasa de descuento r, 
            sino en la relación intrínseca entre el riesgo (r) y el crecimiento (g). El hecho de que r - g sea igual al earnings yield resalta una 
            invarianza fundamental: lo que realmente importa es cómo se interpreta y gestiona la diferencia entre el rendimiento exigido y el crecimiento proyectado.
          </p>
          <p>
            Esta perspectiva holística sugiere que cada dato, cada proyección de crecimiento, puede tener múltiples interpretaciones dependiendo de la 
            narrativa que se asuma sobre el futuro. Conocer la dispersión y la variabilidad de g nos permite identificar aquellos escenarios más 
            conservadores, donde la probabilidad de éxito es mayor, y evitar así valoraciones sobreestimadas que podrían ser consecuencia de 
            expectativas demasiado optimistas.
          </p>
        </section>

        <section className="method-section">
          <h2>Limitaciones del Modelo</h2>
          <p>
            Este modelo no es adecuado para empresas con EPS negativos o aquellas con alta volatilidad en sus resultados, como las compañías productoras de commodities. 
            La volatilidad en las utilidades puede generar un comportamiento del ratio E/P que contradice la lógica esperada.
          </p>
          <p>
            Su aplicabilidad es especialmente recomendada para empresas que mantienen resultados estables y positivos a lo largo del tiempo, donde 
            la relación entre riesgo y crecimiento se refleja de manera más confiable en la valoración final.
          </p>
        </section>
      </div>
    </div>
  );
};

export default HistoricalValuation;
