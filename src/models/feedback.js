import { Schema, model, Types } from "mongoose";

const feedbackSchema = new Schema(
  {
    author: { type: String, trim: true },
    user: { type: Types.ObjectId, ref: "User" },
    good: { type: Types.ObjectId, ref: "Good", required: true },
    category: { type: Types.ObjectId, ref: "Category" },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true, required: true },
    rate: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const Feedback = model("Feedback", feedbackSchema);