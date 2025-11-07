import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Налаштування swagger-jsdoc
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Notehub API Documentation",
			version: "1.0.0",
			description: "Документація для бекенду",
		},
		servers: [
			{
				url: "http://localhost:3030/api",
				description: "Local server",
			},
		],
	},
	// шлях до файлів із JSDoc-коментарями
	apis: ["./src/routes/*.js", "./src/docs/*.js"], // <--- де шукати swagger-коментарі,
};

export const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	console.log("Swagger docs available at http://localhost:3000/api-docs");
}