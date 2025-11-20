export const notFoundHandler = (req, res) => {
	//console.log(req.url)
	res.status(404).json({ message: `Маршрут не знайдено - ${req.url}` });
};