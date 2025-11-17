import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const updateUserProfile = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw createHttpError(404, "User not found");

  let updateData = { ...req.body };

  if (req.file) {
    const result = await saveFileToCloudinary(req.file.buffer);
    updateData.avatar = result.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).lean();

  res.status(200).json(updatedUser);
};


export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
