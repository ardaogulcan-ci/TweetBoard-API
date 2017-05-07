import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const querySchema = new Schema({
  type: String,
  term: String,
  geo: {
    latitude: String,
    longitude: String,
  },
  language: String,
});


export default querySchema;
