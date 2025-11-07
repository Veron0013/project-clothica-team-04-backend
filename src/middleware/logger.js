import pino from 'pino-http';

export const logger = pino({
	level: "info",
	customProps: (req) => {
		return {
			ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
			clientIp: req.headers["x-client-ip"] || "undefined",
			user: req.user?.username || "guest",
		}
	},
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "HH:MM:ss",
			ignore: "pid,hostname",
			messageFormat: 'client: {clientIp} ** server: {ip} ** user: {user} == {req.method} {req.url} {res.statusCode} - {responseTime}ms',
			hideObject: true,
		},
	},
})
