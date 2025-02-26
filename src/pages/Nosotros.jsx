import './Nosotros.css';

const Nosotros = () => {
  document.title = 'Indekura Hedge Fund - Información Legal';

  return (
    <div className="nosotros-container">
      <div className="nosotros-content">
        <h1 className="page-title">Información Legal</h1>
        <div className="legal-info">
          <p>
            Este sitio web ha sido preparado únicamente con el propósito de proporcionar 
            información sobre Indekura Hedge Fund y los servicios y productos que ofrece. 
            Este sitio web ha sido compilado de buena fe por Indekura. Sin embargo, no se 
            hace ninguna representación en cuanto a la integridad o exactitud de la 
            información que contiene.
          </p>
          <p>
            En particular, debe tener en cuenta que esta información puede estar incompleta, 
            puede contener errores o puede haberse quedado desactualizada. Los análisis y 
            reportes financieros proporcionados por Indekura hablan solo a partir de las 
            fechas respectivas en las que se presentan o son utilizados. El contenido de 
            estos informes puede quedar desactualizado. Indekura no se compromete y rechaza 
            cualquier obligación de actualizar dichos informes.
          </p>
          <p>
            Indekura se reserva el derecho de agregar, modificar o eliminar cualquier 
            información en este sitio web en cualquier momento. Esta publicación y cualquier 
            referencia a productos o servicios se proporcionan &quot;tal cual&quot; sin ninguna 
            garantía o término implícito de ningún tipo. Se prohíbe la reproducción o 
            distribución de cualquier material obtenido en este sitio web o la vinculación 
            a este sitio web sin permiso por escrito.
          </p>
          <p className="copyright">
            {new Date().getFullYear()} Indekura Hedge Fund. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;
