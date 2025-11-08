import { Schema, model, Types } from "mongoose";

const feedbackSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Good', required: true, index: true },
    author: { type: String, trim: true, required: true },
    user: { type: Types.ObjectId, ref: "User" },
    category: { type: String, trim: true },
    approved: { type: Boolean, default: false },
    description: { type: String, trim: true, required: true },
    rate: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const Feedback = model("Feedback", feedbackSchema);