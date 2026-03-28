import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Adastra EdScript API',
      version: '1.0.0',
      description: 'adastra REST API documentation',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '../../modules/**/presentation/routes/*.ts'),
    path.join(__dirname, '../../modules/**/presentation/routes/*.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
