import { Router } from 'express';
import randomstring from 'randomstring';

import User from './user';

const router = Router();

// List Users
router.get('/', (req, res) => {
  User.find({ deletedAt: null })
  .select('-password')
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

  data.title = `${data.name.first} ${data.name.last}`;

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

  if (Object.prototype.hasOwnProperty.call(data, 'title')) {
    delete data.title;
  }

  data.title = `${data.name.first} ${data.name.last}`;

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

export default router;
