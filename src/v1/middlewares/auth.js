import jwt from 'jsonwebtoken';
import config from '../../config/environment';

import User from '../resources/users/user';

const authenticatedMethods = ['POST', 'PUT', 'DELETE'];
const authenticatedRoutes = ['twitter'];
const excludedPaths = ['auth'];

const getAuthorizationToken = (authHeader) => {
  if (!authHeader) {
    return false;
  }

  const authParts = authHeader.split(' ');

  if (authParts.length !== 2) {
    return false;
  }

  if (!(/^Bearer$/i.test(authParts[0]))) {
    return false;
  }

  return authParts[1];
};

const getAuthorizedUser = token => new Promise((resolve, reject) => {
  jwt.verify(token, config.jwt.key, (error, decoded) => { // eslint-disable-line
    if (error) {
      return reject(error);
    }

    User.findById(decoded.id, '-password -__v', (userError, user) => {
      if (userError || user === null) {
        return reject(userError || null);
      }
      return resolve(user);
    });
  });
});

const isAuthRequiredEndpoint = (method, path) => {
  let realPath = path.replace('/v1', '');
  realPath = realPath.split('/')[1];
  return ((authenticatedMethods.indexOf(method) > -1 ||
           authenticatedRoutes.indexOf(realPath) > -1) &&
           excludedPaths.indexOf(realPath) < 0);
};

export default () => function authMiddleware(req, res, next) { // eslint-disable-line
  // return next();
  const token = getAuthorizationToken(req.headers.authorization);
  const authRequired = isAuthRequiredEndpoint(req.method, req.path);


  if (!token && authRequired) {
    return res.boom.unauthorized();
  }

  getAuthorizedUser(token).then((user) => {
    req.user = user;
    return next();
  })
  .catch((error) => {
    if (authRequired) {
      return res.boom.unauthorized(error);
    }

    return next();
  });
};
