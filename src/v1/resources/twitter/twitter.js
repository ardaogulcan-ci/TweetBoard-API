import { Router } from 'express';
import Twitter from '../../helpers/twitter';

const router = Router();

// Search
router.get('/search', (req, res) => {
  const twitter = new Twitter();
  const tokens = req.user.social.twitter.token;

  const parameters = req.url.split('?')[1];
  twitter.searchTweets(parameters, tokens.accessToken, tokens.accessTokenSecret)
  .then(response => res.json(response))
  .catch(error => res.json(error));
});

// Trending Topic Places
router.get('/trends/available', (req, res) => {
  const twitter = new Twitter();
  const tokens = req.user.social.twitter.token;

  twitter.trendsAvailable(tokens.accessToken, tokens.accessTokenSecret)
  .then(response => res.json(response))
  .catch(error => res.json(error));
});

// Trending Topics In Places
router.get('/trends/places', (req, res) => {
  const twitter = new Twitter();
  const tokens = req.user.social.twitter.token;

  const placeId = req.query.id || 1;

  twitter.trendsInPlace(placeId, tokens.accessToken, tokens.accessTokenSecret)
  .then(response => res.json(response))
  .catch(error => res.json(error));
});

export default router;
