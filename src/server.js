import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './swagger/swaggerConfig.js';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors } from 'celebrate';
import categoriesRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import goodsRoutes from './routes/goodsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import subscriptRoutes from './routes/subscriptRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import topRatedGoodsRouter from './routes/topRatedGoodRoutes.js';

const app = express();
const PORT = process.env.PORT ?? 3030;

app.use(express.json());
app.use(
  cors({
    origin: ['https://clothica-team-04-frontend.vercel.app', 'http://localhost:3000'],
    credentials: true,
  }),
);
app.use(cookieParser());

app.use(logger);
app.use(authRoutes);
app.use(userRoutes);
app.use(categoriesRoutes);
app.use(goodsRoutes);
app.use(feedbackRoutes);
app.use(subscriptRoutes);
app.use(orderRoutes);
app.use(topRatedGoodsRouter);

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

//MW
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

//DB
await connectMongoDB();

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Документація API доступна за адресою: http://localhost:${PORT}/api-docs`);
});
