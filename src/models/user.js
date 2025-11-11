import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true
    },
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
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
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
      $and: [
        { email: { $exists: true } },
        { email: { $ne: '' } },
        { email: { $ne: null } },
      ],
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

userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

export const User = model('User', userSchema);

