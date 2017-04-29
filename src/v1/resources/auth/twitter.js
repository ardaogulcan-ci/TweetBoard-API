import oAuthManager from 'oauth';

class TwitterOAuth {

  constructor(options) {
    this.oAuthObject = new oAuthManager.OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      options.consumerKey,
      options.consumerSecret,
      '1.0',
      `http://127.0.0.1:9000/v1/${options.callbackURL}`,
      'HMAC-SHA1');
  }

  requestLogin() {
    return new Promise((resolve, reject) => {
      this.oAuthObject.getOAuthRequestToken((error, oAuthToken) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(`https://twitter.com/oauth/authenticate?oauth_token=${oAuthToken}`);
      });
    });
  }

  getAccessToken(oAuthToken, OAuthVerifier) {
    return new Promise((resolve, reject) => {
      this.oAuthObject.getOAuthAccessToken(
        oAuthToken,
        OAuthVerifier,
        OAuthVerifier,
        (error, oAuthAccessToken, oAuthAccessTokenSecret, results) => {
          if (error) {
            reject(error);
            return;
          }
          resolve({
            oAuthAccessToken,
            oAuthAccessTokenSecret,
            results,
          });
        });
    });
  }

  getUser(oAuthAccesToken, oAuthAccesTokenSecret) {
    return new Promise((resolve, reject) => {
      this.oAuthObject.get(
        'https://api.twitter.com/1.1/account/verify_credentials.json',
        oAuthAccesToken,
        oAuthAccesTokenSecret,
        (error, twitterResponseData) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(JSON.parse(twitterResponseData));
        });
    });
  }
}

export default TwitterOAuth;
