import { Router } from 'express';
import randomstring from 'randomstring';
import jwt from 'jsonwebtoken';

import config from '../../../config/environment';
import TwitterOAuth from './twitter';
import User from '../users/user';

const router = Router();

const TwitterStrategy = new TwitterOAuth({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackURL: config.twitter.callbackURL,
  apiURL: `${config.api.url}/v1`,
});

const createTwitterUser = twitterData => new Promise(
  (resolve, reject) => {
    TwitterStrategy.getUser(twitterData.oAuthAccessToken, twitterData.oAuthAccessTokenSecret)
    .then((twitterUser) => {
      const user = new User({
        title: twitterUser.name,
        social: {
          twitter: {
            token: {
              accessToken: twitterData.oAuthAccessToken,
              accessTokenSecret: twitterData.oAuthAccessTokenSecret,
            },
            username: twitterUser.screen_name,
            id: twitterUser.id_str,
          },
        },
        email: `twitter${twitterUser.id_str}@twitter.local`,
        password: randomstring.generate(12),
        profile: {
          picture: twitterUser.profile_image_url,
        },
      });

      user.save().then(resolve, reject);
    }, reject);
  });

const setTwitterAccessToken = twitterData => new Promise(
  (resolve, reject) => {
    User.findOne({ 'social.twitter.id': twitterData.results.user_id })
    .then((user) => {
      if (user === null) {
        createTwitterUser(twitterData).then(resolve, reject);
        return;
      }
      const updatedUser = user;
      updatedUser.social.twitter.token.accessToken = twitterData.oAuthAccessToken;
      updatedUser.social.twitter.token.accessTokenSecret = twitterData.oAuthAccessTokenSecret;
      updatedUser.save().then(resolve, reject);
    }, reject);
  });

const createJWTToken = data => jwt.sign(
  data,
  config.jwt.key,
  {
    expiresIn: config.jwt.expire,
  });

router.get('/twitter', (req, res) => {
  TwitterStrategy.requestLogin()
  .then(redirectURL => res.redirect(302, redirectURL))
  .catch(error => res.json(error));
});

router.get('/twitter/callback', (req, res) => {
  TwitterStrategy.getAccessToken(req.query.oauth_token, req.query.oauth_verifier)
  .then((data) => {
    setTwitterAccessToken(data)
    .then((user) => {
      const loginData = JSON.stringify({
        title: user.title,
        id: user._id, // eslint-disable-line
        profile: user.profile,
        privileges: user.privileges,
        slug: user.slug,
        social: user.social,
      });

      const token = createJWTToken({ id: user._id }); // eslint-disable-line
      const payload = new Buffer(loginData).toString('base64');

      res.redirect(302, `${config.client.authCallback}?token=${token}&payload=${payload}`);
    })
    .catch((error) => {
      const payload = new Buffer(JSON.stringify(error)).toString('base64');
      res.redirect(302, `${config.client.authCallback}?error=${payload}`);
    });
  })
  .catch((error) => {
    const payload = new Buffer(JSON.stringify(error)).toString('base64');
    res.redirect(302, `${config.client.authCallback}?error=${payload}`);
  });
});

export default router;
