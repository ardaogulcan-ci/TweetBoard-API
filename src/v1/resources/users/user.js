import mongoose from 'mongoose';
import { isEmail } from 'validator';
import bcrypt from 'bcryptjs';
import slugHero from 'mongoose-slug-hero';

const Schema = mongoose.Schema;
const saltFactor = 10;

const userSchema = new Schema({
  name: {
    first: { type: String, required: true },
    last: String,
  },
  title: String,
  slug: { type: String, required: true },
  social: {
    twitter: {
      username: String,
      token: String,
    },
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: {
      unique: true,
    },
    validate: {
      isAsync: false,
      validator: isEmail,
      message: 'invalid_email',
    },
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    picture: String,
    birthday: Date,
  },
  privileges: {
    isAdmin: Boolean,
    isSuperAdmin: Boolean,
  },
  deletedAt: Date,
}, { timestamps: true });

userSchema.pre('save', function preSave(next) {
  const user = this;
  if (!user.isModified('password')) {
    next();
    return;
  }

  bcrypt.genSalt(saltFactor, (saltError, salt) => {
    if (saltError) {
      next(saltError);
    }

    bcrypt.hash(user.password, salt, (hashError, hash) => {
      if (hashError) {
        next(hashError);
        return;
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function comparePassword(inputPassword, callback) {
  bcrypt.compare(inputPassword, this.password, (error, isMatch) => {
    if (error) {
      return callback(error);
    }
    return callback(null, isMatch);
  });
};

userSchema.plugin(slugHero, { doc: 'users', field: 'title' });

export default mongoose.model('User', userSchema);
