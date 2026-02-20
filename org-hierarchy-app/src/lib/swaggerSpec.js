import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Next.js API',
      version: '1.0.0',
    },
  },
  // IMPORTANT: path(s) to files with swagger JSDoc comments
  apis: ['./src/app/api/**/*.js', './src/app/api/**/*.mjs'], 
});
