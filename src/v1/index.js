import { Router } from 'express';

export default () => {
  const api = Router();

  api.get('/', (req, res) => {
    res.json({
      name: 'TweetBoard RESTFUL API',
      version: 1,
      documentation: 'https://github.com/ardaogulcan-ci/TweetBoard-API/wiki',
    });
  });

  return api;
};
