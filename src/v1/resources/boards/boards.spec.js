import chai from 'chai';
import chaiHttp from 'chai-http';
import slugHero from 'mongoose-slug-hero';
import mongoose from 'mongoose';

import { app } from '../../index.spec';
import { SHARE_TYPE } from '../../helpers/enums';
import Board from './board';

chai.should();
chai.use(chaiHttp);

function createTestQueryObject() {
  return {
    type: 'queryType',
    term: 'term',
  };
}

function createTestBoxObject() {
  const testBox = {
    title: 'Test Box Title',
    description: 'Description about box',
    refresh: { interval: 60000 },
    queries: [],
    position: {
      top: 0,
      left: 0,
    },
    size: {
      width: 0,
      height: 0,
    },
    style: {
      color: '#000',
      backgroundColor: '#FFF',
    },
  };

  for (let i = 0; i < 5; i += 1) {
    testBox.queries.push(createTestQueryObject());
  }

  return testBox;
}

function createTestBoardObject() {
  const testBoard = new Board();
  testBoard.title = 'Test Title';
  testBoard.creator = mongoose.Types.ObjectId().toString();
  testBoard.boxes = [];

  for (let i = 0; i < 5; i += 1) {
    testBoard.boxes.push(createTestBoxObject());
  }

  return testBoard;
}

function createTestBoard() {
  return new Promise((resolve, reject) => {
    createTestBoardObject().save().then(resolve, reject);
  });
}

describe('Resource: Boards', () => {
  beforeEach((done) => {
    const boardPromise = Board.remove({});
    // eslint-disable-next-line
    const slugModel = slugHero.Counters['_slug_ctrs'];
    const slugPromise = slugModel.remove({});

    Promise.all([boardPromise, slugPromise]).then(() => done()).catch(() => done());
  });

  // List Boards
  describe('/GET boards', () => {
    it('it should return empty array if no board', (done) => {
      chai.request(app)
      .get('/v1/boards')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });

    it('it should get all boards', (done) => {
      createTestBoard()
      .then(() => {
        chai.request(app)
        .get('/v1/boards')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body[0].should.not.have.property('boxes');
          res.body[0].should.not.have.property('users');
          res.body.length.should.be.eql(1);
          done();
        });
      })
      .catch(() => done());
    });
  });

  // Get Board
  describe('/GET boards/:id', () => {
    it('it should get board with given id', (done) => {
      createTestBoard()
      .then((board) => {
        chai.request(app)
        // eslint-disable-next-line
        .get(`/v1/boards/${board._id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('boxes');
          res.body.should.have.property('users');

          done();
        });
      })
      .catch(() => done());
    });

    it('it should fail 400 when given id is not mongo object id', (done) => {
      chai.request(app)
      .get('/v1/boards/board1')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });
  });

  // Create Board
  describe('/POST boards', () => {
    it('it should create board', (done) => {
      const boardObject = createTestBoardObject();
      chai.request(app)
      .post('/v1/boards')
      .set('content-type', 'application/json')
      .send(boardObject.toJSON())
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.slug.should.be.eql('test-title');
        res.body.shared.type.should.be.oneOf(Object.values(SHARE_TYPE));
        done();
      });
    });

    it('it should create board with incremented slug if creators are same', (done) => {
      createTestBoard()
      .then((testBoard) => {
        const duplicateBoard = createTestBoardObject();
        duplicateBoard.creator = testBoard.creator;

        chai.request(app)
        .post('/v1/boards')
        .set('content-type', 'application/json')
        .send(duplicateBoard.toJSON())
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.slug.should.be.eql('test-title-2');
          done();
        });
      });
    });

    it('it should create board with normal slug if creators are different', (done) => {
      createTestBoard()
      .then((testBoard) => {
        const duplicateBoard = createTestBoardObject();
        chai.request(app)
        .post('/v1/boards')
        .set('content-type', 'application/json')
        .send(duplicateBoard.toJSON())
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.slug.should.be.eql('test-title');
          res.body.creator.should.not.be.eql(testBoard.creator);
          done();
        });
      })
      .catch(() => done());
    });

    it('it should fail 400 when shared type is not enum', (done) => {
      const boardObject = createTestBoardObject();
      boardObject.shared.type = 'privacy';
      chai.request(app)
      .post('/v1/boards')
      .set('content-type', 'application/json')
      .send(boardObject.toJSON())
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });

    it('it should fail 400 when required fields are not provided', (done) => {
      const boardObject = createTestBoardObject();
      boardObject.title = null;
      chai.request(app)
      .post('/v1/boards')
      .set('content-type', 'application/json')
      .send(boardObject.toJSON())
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });
  });

  // Update Board
  describe('/PUT boards/:id', () => {
    it('it should update board with given id', (done) => {
      createTestBoard()
      .then((board) => {
        const updatedBoard = board.toObject();
        updatedBoard.shared.type = SHARE_TYPE.USER;
        chai.request(app)
        // eslint-disable-next-line
        .put(`/v1/boards/${board._id}`)
        .set('content-type', 'application/json')
        .send(JSON.stringify(updatedBoard))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.shared.type.should.be.eql(SHARE_TYPE.USER);
          done();
        });
      })
      .catch(() => done());
    });

    it('it should update board slug and store old slug', (done) => {
      createTestBoard()
      .then((board) => {
        const updatedBoard = board.toObject();
        updatedBoard.title = 'Updated Title';
        chai.request(app)
        // eslint-disable-next-line
        .put(`/v1/boards/${board._id}`)
        .set('content-type', 'application/json')
        .send(JSON.stringify(updatedBoard))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.slug.should.be.eql('updated-title');
          res.body.should.have.property('slugs');
          res.body.slugs.length.should.be.eql(1);
          res.body.slugs[0].should.be.eql(board.slug);
          done();
        });
      })
      .catch(() => done());
    });
  });

  // Delete Board
  describe('/DELETE boards/:id', () => {
    it('it should delete board with given id', (done) => {
      createTestBoard()
      .then((board) => {
        chai.request(app)
        // eslint-disable-next-line
        .delete(`/v1/boards/${board._id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
      })
      .catch(() => done());
    });
  });
});
