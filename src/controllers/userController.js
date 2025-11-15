import createHttpError from 'http-errors';
import { User } from '../models/user.js';

export const updateUserProfile = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw createHttpError(404, 'user not found');
  }

 let {
    name,
    lastName,
    phone,
    city,
    warehoseNumber,
  } = req.user;

  if (req.body.firstName) name = req.body.name;
  if (req.body.lastName) lastName = req.body.lastName;
  if (req.body.phone) phone = req.body.phone;
  if (req.body.city) city = req.body.city;
  if (req.body.warehoseNumber) warehoseNumber = req.body.novaPoshtaBranch;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      name,
      lastName,
      phone,
      city,
      warehoseNumber,
    },
    { new: true }
  );

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
