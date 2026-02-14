import type { Options } from 'swagger-jsdoc';
import config from './config';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Messages API',
      version: '1.0.0',
      description: 'API documentation for the Cat Match Messages microservice'
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['**/*.ts'] // Paths to the JSDoc-commented TypeScript files
};

export default swaggerOptions;
