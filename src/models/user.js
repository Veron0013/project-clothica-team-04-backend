import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
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
      required: false,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    warehoseId: {
      type: String,
      trim: true,
    },
    warehoseNumber: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      required: false,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
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
      $and: [{ email: { $exists: true } }, { email: { $ne: '' } }, { email: { $ne: null } }],
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
