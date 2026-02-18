import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Modular MVC Express Boilerplate API',
      version: '1.0.0',
      description: `
## API documentation for the Modular MVC Express Boilerplate application.

### How to Test APIs:
1. First, authenticate using the \`/auth/login\` endpoint to get your JWT token
2. Click the **Authorize** button (🔓) at the top right
3. Enter your token in the format: \`Bearer <your-token>\`
4. Click **Authorize** and then **Close**
5. Now you can test protected endpoints using the **Try it out** button

### Features:
- ✅ All endpoints are testable directly from this interface
- ✅ File upload support for multipart/form-data
- ✅ JWT authentication with Bearer token
- ✅ Real-time API testing with actual responses
      `,
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
      {
        url: `https://your-production-domain.com/api/v1`,
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from the /auth/login endpoint',
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
