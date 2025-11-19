// src/middleware/errorHandler.js
import { HttpError } from 'http-errors';

export const errorHandler = (error, req, res, next) => {
	if (error instanceof HttpError) {
		return res.status(error.status).json({
			message: error.message || error.name,
		});
	}

	console.error(error);

	if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Токен недійсний. Авторизуйтеся повторно.',
    });
	}
	
	if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Термін дії токена минув. Авторизуйтеся повторно.',
    });
	}
	
	if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Некоректний ідентифікатор ресурсу.',
    });
	}
	
	if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Некоректні дані. Перевірте правильність введення.',
    });
	}
		
	return res.status(500).json({
    message: 'Сталася внутрішня помилка сервера. Спробуйте пізніше.',
	});
	
};
