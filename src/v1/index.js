import { Router } from 'express';

import authMiddleware from './middlewares/auth';
import users from './resources/users';
import boards from './resources/boards';
import auth from './resources/auth';
import userSpesific from './resources/user-spesific';

export default (app) => {
  if (process.env.TYPE !== 'test') {
    app.use(authMiddleware());
  }

  const api = Router();

  api.get('/', (req, res) => {
    res.json({
      name: 'TweetBoard RESTFUL API TEST',
      version: 1,
      documentation: 'https://github.com/ardaogulcan-ci/TweetBoard-API/wiki',
    });
  });

  api.use('/users', users);
  api.use('/boards', boards);
  api.use('/auth', auth);
  api.use('/', userSpesific);

  return api;
};
