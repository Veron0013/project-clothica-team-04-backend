import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    image: {
  type: String,
},
  },
  { timestamps: true, collection: 'categories' }
);

export const Category = model("Category", categorySchema);