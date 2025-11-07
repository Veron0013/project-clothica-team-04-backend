import crypto from 'crypto';
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

export const createSession = async (userId) => {
	const accessToken = crypto.randomBytes(30).toString('base64')
	const refreshToken = crypto.randomBytes(30).toString('base64')

	return Session.create({
		userId,
		accessToken,
		refreshToken,
		accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
		refreshTokenValidUntil: new Date(Date.now() + ONE_DAY)
	})
}

export const setSessionCookies = (res, session) => {

	const cookiesTypeDefault = (maxAge) => {
		const cookieType = {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			path: "/",
			maxAge
		}
		return cookieType
	}

	res.cookie('accessToken', session.accessToken, cookiesTypeDefault(FIFTEEN_MINUTES))

	res.cookie('refreshToken', session.refreshToken, cookiesTypeDefault(ONE_DAY))

	res.cookie('sessionId', session._id, cookiesTypeDefault(ONE_DAY))
}