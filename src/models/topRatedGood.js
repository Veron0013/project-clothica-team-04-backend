import { Schema, model, Types } from 'mongoose';

const topRatedGoodSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Good', required: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'top_rated_goods',
  },
);

export const TopRatedGood = model('TopRatedGood', topRatedGoodSchema);
