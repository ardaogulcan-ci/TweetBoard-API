import { Router } from 'express';

export default () => {
  const api = Router();

  api.get('/', (req, res) => {
    res.json({ version: '1' });
  });
  api.get('/test', (req, res) => {
    res.json({ hello: 'world' });
  });

  return api;
};
