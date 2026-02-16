import express from 'express';
import cors from 'cors';
import config from './config/config';
import messageRoutes from './routes/messageRoutes';
import swaggerOptions from './config/swaggerOptions';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const authorizedCallers: string[] = config.AUTHORIZED_CALLERS.split(
      ','
    ).map((ac) => ac.toLowerCase());

    if (
      config.NODE_ENV === 'development' ||
      authorizedCallers.some((ac) => origin?.toLowerCase().startsWith(ac))
    ) {
      callback(null, origin);
    } else {
      callback(new Error('Request from unauthorized origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed HTTP methods
  credentials: true // Allow sending cookies/authorization headers
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
const app = express();

app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use('/api/messages', messageRoutes);

// Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

export default app;
