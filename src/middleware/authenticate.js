import createHttpError from "http-errors"
import { Session } from "../models/session.js"
import { User } from "../models/user.js"


export const authenticate = async (req, res, next) => {

	const { accessToken } = req.cookies

	if (!accessToken) {
		return next(createHttpError(401, 'Missing access token'))
	}

	const session = await Session.findOne({ accessToken })

	if (!session) {
		return next(createHttpError(401, 'Session not found'))
	}

	const isAccessTokenExpired = new Date(session.accessTokenValidUntil) < new Date()

	if (isAccessTokenExpired) {
		return next(createHttpError(401, 'Access token expired'))
	}

	const user = await User.findById(session.userId)

	if (!user) {
		return next(createHttpError(401,))
	}

	req.user = user

	next()

}