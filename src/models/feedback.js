import { Schema, model, Types } from "mongoose";
import dayjs from "dayjs";

const feedbackSchema = new Schema(
  {
    author: { type: String, trim: true, required: true },
    productId: { type: Types.ObjectId, ref: 'Good', required: true, index: true },
    userId: { type: Types.ObjectId, ref: "User" },
    category: { type: String, trim: true },
    description: { type: String, trim: true, required: true },
    rate: { type: Number, min: 0, max: 5, required: true },
    date: { type: String, default: () => dayjs().format("DD.MM.YYYY HH:mm") },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

feedbackSchema.set("toJSON", {
  transform: (_doc, ret) => {
    if (ret._id) ret._id = String(ret._id);
    if (ret.category) ret.category = String(ret.category);
    return ret;
  },
});

export const Feedback = model("Feedback", feedbackSchema);