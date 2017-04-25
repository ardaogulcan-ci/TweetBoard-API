import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const querySchema = new Schema({
  type: { type: String, required: true },
  term: String,
});


export default querySchema;
