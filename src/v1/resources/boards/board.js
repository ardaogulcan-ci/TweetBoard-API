import mongoose from 'mongoose';
import slugHero from 'mongoose-slug-hero';

import Box from './box';

const Schema = mongoose.Schema;

const boardSchema = new Schema({
  title: String,
  creator: String,
  boxes: [Box],
  users: [
    {
      user: String,
      privileges: {
        isAdmin: Boolean,
        read: Boolean,
        write: Boolean,
        share: Boolean,
      },
    },
  ],
  shared: {
    type: String, // constants/share
    token: String,
  },
  deletedAt: Date,
}, { timestamps: true });

boardSchema.plugin(slugHero, { doc: 'boards', field: 'title', scope: ['creator'] });

export default mongoose.model('Board', boardSchema);
