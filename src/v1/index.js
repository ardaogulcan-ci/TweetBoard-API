import { Router } from 'express';

import users from './resources/users';

export default () => {
  const api = Router();

  api.get('/', (req, res) => {
    res.json({
      name: 'TweetBoard RESTFUL API TEST',
      version: 1,
      documentation: 'https://github.com/ardaogulcan-ci/TweetBoard-API/wiki',
    });
  });

  api.use('/users', users);

  return api;
};
