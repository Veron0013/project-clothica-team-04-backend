import { Schema, model } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    email: String,
    // required: true,
    // unique: true,
    // trim: true,
  },
  { timestamps: true, versionKey: false },
);

export const Subscription = model('subscription', subscriptionSchema);
