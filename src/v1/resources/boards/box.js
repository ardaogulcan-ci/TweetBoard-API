import mongoose from 'mongoose';

import Query from './query';

const Schema = mongoose.Schema;

const boxSchema = new Schema({
  title: String,
  description: String,
  refresh: {
    interval: Number,
  },
  queries: [Query],
  position: {
    top: Number,
    left: Number,
  },
  size: {
    width: Number,
    height: Number,
  },
  style: {
    color: String,
    backgroundColor: String,
  },
}, { timestamps: true });


export default boxSchema;
