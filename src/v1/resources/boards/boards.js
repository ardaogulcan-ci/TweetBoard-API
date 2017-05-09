import { Router } from 'express';
import UIDGenerator from 'uid-generator';
import { isEmail } from 'validator';

import Board from './board';
import notifyBoardMail from '../../helpers/mail';

const router = Router();

const tokenizeUsers = (users) => {
  const uidgen = new UIDGenerator();
  return users.map((user) => {
    const updatedUser = user;
    updatedUser.token = uidgen.generateSync();
    return updatedUser;
  });
};

const notifyBoardUsers = (users, userSlug, boardSlug) => {
  users.forEach((user) => {
    const uid = new Buffer(user.user).toString('base64');
    notifyBoardMail(user.user, `/${userSlug}/boards/${boardSlug}?token=${user.token}&uid=${uid}`);
  });
};

// List Boards
router.get('/', (req, res) => {
  Board.find({ deletedAt: null })
  .select('-boxes -users')
  .sort('-id')
  .exec()
  .then((boards) => {
    res.json(boards);
  })
  .catch((error) => {
    res.boom.badImplementation(error.message);
  });
});

// Get Board
router.get('/:boardId', (req, res) => {
  const boardId = req.params.boardId;

  Board.findById(boardId)
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
});

// Create Board
router.post('/', (req, res) => {
  const data = req.body;

  if (Object.prototype.hasOwnProperty.call(data, '_id')) {
    // eslint-disable-next-line
    delete data._id;
  }

  if (!data.creator && req.user) {
    data.creator = req.user._id; // eslint-disable-line
  }

  if (data.users && data.users.length > 0) {
    data.users = tokenizeUsers(data.users);
  }

  const newBoard = new Board(data);

  newBoard.save()
  .then((board) => {
    res.status(201).json(board);
    notifyBoardUsers(board.users.filter(user => !user.notified && isEmail(user.user)),
      req.user.slug, board.slug);
  })
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

// Update Board
router.put('/:boardId', (req, res) => {
  const boardId = req.params.boardId;
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

  Board.findOneAndUpdate({ _id: boardId }, data, { new: true })
  .then((board) => {
    if (board === null) {
      res.boom.notFound();
      return;
    }

    res.json(board);
  })
  .catch((error) => {
    res.boom.badImplementation(error);
  });
});

// Delete Board
router.delete('/:boardId', (req, res) => {
  const boardId = req.params.boardId;

  Board.findOneAndRemove({ _id: boardId })
  .then((board) => {
    if (board === null) {
      return res.boom.notFound();
    }

    return res.json(board);
  })
  .catch((error) => {
    res.boom.badImplementation(error);
  });
});


// Create Box
router.post('/:boardId/boxes/', (req, res) => {
  const data = req.body;
  const boardId = req.params.boardId;

  if (Object.prototype.hasOwnProperty.call(data, '_id')) {
    // eslint-disable-next-line
    delete data._id;
  }

  Board.findById(boardId)
  .then((board) => { // eslint-disable-line consistent-return
    if (board === null) {
      return res.boom.notFound();
    }

    board.boxes.push(data);

    board.save()
    .then(response => res.json(response.boxes))
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
  })
  .catch(error => res.boom.badImplementation(error));
});

// Update Box
router.put('/:boardId/boxes/:boxId', (req, res) => {
  const data = req.body;
  const boardId = req.params.boardId;
  const boxId = req.params.boxId;

  Board.findById(boardId)
  .then((board) => { // eslint-disable-line consistent-return
    if (board === null) {
      return res.boom.notFound();
    }

    const boxIndex = board.boxes.findIndex(box => box._id.toString() === boxId); // eslint-disable-line

    const updatedBoard = board;

    updatedBoard.boxes[boxIndex] = data;

    updatedBoard.save()
    .then(response => res.json(response.boxes))
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
  })
  .catch(error => res.boom.badImplementation(error));
});

export default router;
