import mongoose from 'mongoose';
import slugHero from 'mongoose-slug-hero';

import Box from './box';
import { SHARE_TYPE } from '../../helpers/enums';

const Schema = mongoose.Schema;

const boardSchema = new Schema({
  title: { type: String, required: true },
  creator: { type: String, required: true },
  boxes: [Box],
  users: [
    {
      user: String,
      token: String,
      privileges: {
        isAdmin: Boolean,
        write: Boolean,
        share: Boolean,
      },
    },
  ],
  shared: {
    type: {
      type: String,
      required: true,
      enum: Object.values(SHARE_TYPE),
      default: SHARE_TYPE.PUBLIC,
    },
    token: String,
  },
  deletedAt: Date,
}, { timestamps: true });

boardSchema.plugin(slugHero, { doc: 'boards', field: 'title', scope: ['creator'] });

export default mongoose.model('Board', boardSchema);
