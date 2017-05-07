import { Router } from 'express';
import Twitter from '../../helpers/twitter';

const router = Router();

// Search
router.get('/search', (req, res) => {
  const twitter = new Twitter();
  const tokens = req.user.social.twitter.token;

  const query = encodeURIComponent(req.query.q);

  twitter.searchTweets(query, tokens.accessToken, tokens.accessTokenSecret)
  .then(response => res.json(response))
  .catch(error => res.json(error));
});

export default router;
