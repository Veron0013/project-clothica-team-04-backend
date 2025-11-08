import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true, $type: 'string' },
    },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
  this.password = await bcrypt.hash(this.password, rounds);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model('User', userSchema);
