import { Router } from 'express';
import randomstring from 'randomstring';

import User from './user';
import Board from '../boards/board';

const router = Router();

// List Users
router.get('/', (req, res) => {
  User.find({ deletedAt: null })
  .select('title slug social.twitter.username profile.picture')
  .sort('-id')
  .exec()
  .then((users) => {
    res.json(users);
  })
  .catch((error) => {
    res.boom.badImplementation(error.message);
  });
});

// Get User
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
  .select('-password')
  .exec()
  .then((user) => {
    if (user === null) {
      res.boom.notFound();
      return;
    }

    res.json(user);
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

// Create User
router.post('/', (req, res) => {
  const data = req.body;

  if (Object.prototype.hasOwnProperty.call(data, '_id')) {
    // eslint-disable-next-line
    delete data._id;
  }

  if (!Object.prototype.hasOwnProperty.call(data, 'password')) {
    data.password = randomstring.generate(12);
  }

  const newUser = new User(data);

  newUser.save()
  .then(user => res.status(201).json(user))
  .catch((error) => {
    if (error.code === 11000) {
      res.boom.badRequest(error.message);
      return;
    }

    switch (error.name) {
      case 'CastError':
      case 'ValidationError':
        res.boom.badRequest(error.message);
        break;
      default:
        res.boom.badImplementation();
    }
  });
});

// Update User
router.put('/:userId', (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  if (Object.prototype.hasOwnProperty.call(data, '_id')) {
    // eslint-disable-next-line
    delete data._id;
  }

  if (Object.prototype.hasOwnProperty.call(data, 'slug')) {
    delete data.slug;
  }

  if (Object.prototype.hasOwnProperty.call(data, 'slugs')) {
    delete data.slugs;
  }

  User.findOneAndUpdate({ _id: userId }, data, { new: true })
  .then((user) => {
    if (user === null) {
      res.boom.notFound();
      return;
    }

    res.json(user);
  })
  .catch((error) => {
    res.boom.badImplementation(error);
  });
});

// Delete User
router.delete('/:userId', (req, res) => {
  const userId = req.params.userId;

  User.findOneAndRemove({ _id: userId })
  .then((user) => {
    if (user === null) {
      return res.boom.notFound();
    }

    return res.json(user);
  })
  .catch((error) => {
    res.boom.badImplementation(error);
  });
});

// Get User Boards
router.get('/:userSlug/boards', (req, res) => {
  const userSlug = req.params.userSlug;

  User.find({ slug: userSlug })
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
