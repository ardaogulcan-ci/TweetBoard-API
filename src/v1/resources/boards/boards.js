import { Router } from 'express';

import Board from './board';

const router = Router();

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
  .select('-password')
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
});

// Create Board
router.post('/', (req, res) => {
  const data = req.body;

  if (Object.prototype.hasOwnProperty.call(data, '_id')) {
    // eslint-disable-next-line
    delete data._id;
  }

  const newBoard = new Board(data);

  newBoard.save()
  .then(board => res.status(201).json(board))
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

export default router;
