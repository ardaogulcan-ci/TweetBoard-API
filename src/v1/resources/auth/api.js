import User from '../users/user';

class APIAuth {
  static authWithTwitter(twitterResponse) {
    return new Promise((resolve, reject) => {
      User.findOne({ 'social.twitter.id': twitterResponse.results.user_id })
      .then((user) => {
        if (user === null) {
          reject(false);
        }
        const updatedUser = user;
        updatedUser.social.twitter.token.accessToken = twitterResponse.oAuthAccessToken;
        updatedUser.social.twitter.token.accessTokenSecret = twitterResponse.oAuthAccessTokenSecret;
        updatedUser.save().then(resolve).catch(reject);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }
}

export default APIAuth;
