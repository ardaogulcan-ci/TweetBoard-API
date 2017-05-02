import jwt from 'jsonwebtoken';
import config from '../../config/environment';

import User from '../resources/users/user';

const authenticatedMethods = ['POST', 'PUT', 'DELETE'];
const excludedPaths = ['auth'];

export default () => function authMiddleware(req, res, next) { // eslint-disable-line
  let path = req.path.replace('/v1', '');
  path = path.split('/')[1];

  if (authenticatedMethods.indexOf(req.method) > -1 && excludedPaths.indexOf(path) < 0) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.boom.unauthorized();
    }

    const authParts = authHeader.split(' ');

    if (authParts.length !== 2) {
      return res.boom.unauthorized();
    }

    if (!(/^Bearer$/i.test(authParts[0]))) {
      return res.boom.unauthorized();
    }

    const token = authParts[1];

    jwt.verify(token, config.secrets.jwt.key, (error, decoded) => { // eslint-disable-line
      if (error) {
        return res.boom.unauthorized();
      }

      User.findById(decoded.id, '-password -__v', (userError, user) => {
        if (userError || user === null) {
          return res.boom.unauthorized();
        }
        req.user = user;
        return next();
      });
    });
  } else {
    return next();
  }
};
