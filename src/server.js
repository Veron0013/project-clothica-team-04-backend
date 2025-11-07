import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors } from 'celebrate';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import { setupSwagger } from './swagger.js';

const app = express();
const PORT = process.env.PORT ?? 3030;

app.use(express.json());
app.use(
  cors({
    origin: 'https://notehub-app-auth.vercel.app',
    credentials: true,
  }),
);
app.use(cookieParser());

//swagger
// setupSwagger(app);
//app.use("/api", userApiRoutes);

app.use(logger);
app.use(authRoutes);

app.use(userRoutes);

//MW
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

//DB
await connectMongoDB();

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
