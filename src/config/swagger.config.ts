import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POS Inventory Backend API',
      version: '1.0.0',
      description: 'API documentation for the POS Inventory Backend application.',
      contact: {
        name: 'Lutfur Rahman',
        email: 'lutfurrahman.sarker@gmail.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/app/modules/**/*.route.ts', // Path to your API route files
    './docs/*.md', // Path to markdown files if you have additional docs
    // Add other paths if you have schemas or definitions in separate files
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
