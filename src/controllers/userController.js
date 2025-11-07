import createHttpError from "http-errors"
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js"
import { User } from "../models/user.js"

export const updateUserProfile = async (req, res) => {

	const userId = req.user._id;

	if (!userId) {
		throw createHttpError(404, "user not found")
	}

	let avatar = req.user.avatar
	let username = req.user.username

	if (req.file) {
		const result = await saveFileToCloudinary(req.file.buffer)
		avatar = result.secure_url
	}

	if (req.body.username) {
		username = req.body.username
	}

	const user = await User.findByIdAndUpdate(req.user._id,
		{
			avatar,
			username
		},
		{ new: true }
	)

	res.status(200).json(user);
}

export const getUser = async (req, res) => {

	const userId = req.user._id;
	const user = await User.findOne({ _id: userId })

	if (!user) {
		throw createHttpError(404, "user not found")
	}

	res.status(200).json(user);
};