import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    img_url: { type: String, trim: true },
  },
  { timestamps: true, collection: 'categories' }
);

categorySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.image = ret.image || ret.img_url || undefined;
    delete ret.img_url;
    return ret;
  }
});

export const Category = model("Category", categorySchema);