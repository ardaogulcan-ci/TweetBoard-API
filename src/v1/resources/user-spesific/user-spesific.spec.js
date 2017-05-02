import chai from 'chai';
import chaiHttp from 'chai-http';
import slugHero from 'mongoose-slug-hero';

import { app } from '../../index.spec';
import User from '../users/user';
import Board from '../boards/board';

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

function createTestBoardObject(creator) {
  const testBoard = new Board();
  testBoard.title = 'Test Title';
  testBoard.creator = creator;
  testBoard.boxes = [];

  for (let i = 0; i < 5; i += 1) {
    testBoard.boxes.push(createTestBoxObject());
  }

  return testBoard;
}

function createTestBoard(creator) {
  return new Promise((resolve, reject) => {
    createTestBoardObject(creator).save().then(resolve, reject);
  });
}

function createTestUserObject() {
  const testUser = new User();
  testUser.title = 'John Doe';
  testUser.email = 'johndoe@example.com';
  testUser.password = '123456';
  return testUser;
}

function createTestUserWithBoard() {
  return new Promise((resolve, reject) => {
    createTestUserObject().save().then((user) => {
      createTestBoard(user._id).then(board => resolve({user, board}), reject); // eslint-disable-line
    }, reject);
  });
}

describe('Resource: User Spesifics', () => {
  beforeEach((done) => {
    const userPromise = User.remove({});
    const boardPromise = Board.remove({});
    // eslint-disable-next-line
    const slugModel = slugHero.Counters['_slug_ctrs'];
    const slugPromise = slugModel.remove({});

    Promise.all([userPromise, boardPromise, slugPromise]).then(() => done());
  });


  // GET All User Boards
  describe('/GET :userSlug/boards', () => {
    it('it should get all boards of user with slug', (done) => {
      createTestUserWithBoard()
      .then(({ user }) => {
        chai.request(app)
        .get(`/v1/${user.slug}/boards`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
      });
    });
  });

  // GET User board with slug
  describe('/GET :userSlug/boards/:boardSlug', () => {
    it('it should get user board with slug', (done) => {
      createTestUserWithBoard()
      .then(({ user, board }) => {
        chai.request(app)
        .get(`/v1/${user.slug}/boards/${board.slug}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        });
      });
    });
  });
});
