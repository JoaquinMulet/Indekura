# Indekura Web

Aplicación web para análisis financiero y cálculo de opciones.

## Características

- Calculadora de opciones financieras
- Visualización de datos de mercado
- Análisis de portafolios eficientes

## Configuración del Proyecto

Este proyecto utiliza React con Vite para un desarrollo rápido y eficiente.

### Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## Solución de Problemas Comunes

### Error de CORS con Yahoo Finance

La biblioteca yahoo-finance2 está diseñada principalmente para entornos Node.js y no para navegadores. Cuando se intenta usar directamente en el navegador, se encuentran dos problemas principales:

1. **Error de `process is not defined`**: Solucionado añadiendo un polyfill en vite.config.js:
   ```javascript
   define: {
     'process.env': {}
   }
   ```

2. **Error de CORS**: Yahoo Finance no permite solicitudes directas desde navegadores debido a restricciones de CORS. 

   **Solución implementada**: Se ha creado un servicio `marketDataService.js` que simula los datos de mercado. En un entorno de producción, se recomienda implementar un endpoint en el backend que actúe como proxy para las solicitudes a Yahoo Finance.

## Desarrollo

- **Entorno de Desarrollo**: `npm run dev`
- **Pruebas**: `npm run test`
- **Análisis de Código**: `npm run lint`

## Plugins de Vite Utilizados

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) - Utiliza Babel para Fast Refresh
