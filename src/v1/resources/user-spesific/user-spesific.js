import { Router } from 'express';

import User from '../users/user';
import Board from '../boards/board';

const router = Router();

// Get User Boards
router.get('/:userSlug/boards', (req, res) => {
  let userSlug = req.params.userSlug;
  userSlug = userSlug === 'me' ? req.user.slug : userSlug;

  User.findOne({ slug: userSlug })
  .select('slug')
  .exec()
  .then((user) => {
    if (user === null) {
      res.boom.notFound();
      return;
    }

    Board.find({ creator: user._id }) // eslint-disable-line
    .select('-boxes')
    .exec()
    .then((board) => {
      if (board === null) {
        res.boom.notFound();
        return;
      }

      res.json(board);
    })
    .catch((error) => {
      switch (error.name) {
        case 'CastError':
          res.boom.badRequest(error.message);
          break;
        default:
          res.boom.badImplementation();
      }
    });
  })
  .catch((error) => {
    switch (error.name) {
      case 'CastError':
        res.boom.badRequest(error.message);
        break;
      default:
        res.boom.badImplementation();
    }
  });
});

// Get User Board with Slug
router.get('/:userSlug/boards/:boardSlug', (req, res) => {
  const userSlug = req.params.userSlug;
  const boardSlug = req.params.boardSlug;

  User.findOne({ slug: userSlug })
  .select('slug')
  .exec()
  .then((user) => {
    if (user === null) {
      res.boom.notFound();
      return;
    }
    Board.findOne({ creator: user._id, slug: boardSlug }) // eslint-disable-line
    .exec()
    .then((board) => {
      if (board === null) {
        res.boom.notFound();
        return;
      }

      res.json(board);
    })
    .catch((error) => {
      switch (error.name) {
        case 'CastError':
          res.boom.badRequest(error.message);
          break;
        default:
          res.boom.badImplementation();
      }
    });
  })
  .catch((error) => {
    switch (error.name) {
      case 'CastError':
        res.boom.badRequest(error.message);
        break;
      default:
        res.boom.badImplementation();
    }
  });
});


export default router;
