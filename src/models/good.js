import { Schema, model, Types } from "mongoose";

const priceSchema = new Schema(
  {
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const goodSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Types.ObjectId, ref: "Category", required: true, index: true },
    image: { type: String, required: true, trim: true },
    price: { type: priceSchema, required: true },
    size: [{ type: String, trim: true }],
    description: { type: String, required: true, trim: true },
    prevDescription: { type: String, trim: true },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
      index: true,
    },
    characteristics: [{ type: String, trim: true }],
    feedbacks: [{ type: Types.ObjectId, ref: "Feedback" }],
  },
  { timestamps: true }
);

goodSchema.index({ name: "text" });

goodSchema.set("toJSON", {
  transform: (_doc, ret) => {
    if (ret._id) ret._id = String(ret._id);
    if (ret.category) ret.category = String(ret.category);
    return ret;
  },
});

export const Good = model("Good", goodSchema);