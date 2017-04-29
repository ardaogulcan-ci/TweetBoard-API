import chai from 'chai';
import chaiHttp from 'chai-http';
import slugHero from 'mongoose-slug-hero';

import { app } from '../../index.spec';
import User from './user';

chai.should();
chai.use(chaiHttp);

function createTestUserObject() {
  const testUser = new User();
  testUser.title = 'John Doe';
  testUser.email = 'johndoe@example.com';
  testUser.password = '123456';
  return testUser;
}

function createTestUser() {
  return new Promise((resolve, reject) => {
    createTestUserObject().save().then(resolve, reject);
  });
}

describe('Resource: Users', () => {
  beforeEach((done) => {
    const userPromise = User.remove({});
    // eslint-disable-next-line
    const slugModel = slugHero.Counters['_slug_ctrs'];
    const slugPromise = slugModel.remove({});

    Promise.all([userPromise, slugPromise]).then(() => done());
  });

  // List Users
  describe('/GET users', () => {
    it('it should return empty array if no user', (done) => {
      chai.request(app)
      .get('/v1/users')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });

    it('it should get all users', (done) => {
      createTestUser()
      .then(() => {
        chai.request(app)
        .get('/v1/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].slug.should.be.eql('john-doe');
          res.body[0].should.not.to.have.property('email');
          res.body[0].should.not.to.have.property('password');
          res.body[0].should.not.to.have.property('privileges');
          res.body[0].should.not.to.have.property('privileges');
          if (res.body[0].social && res.body[0].social.twitter) {
            res.body[0].social.twitter.should.not.to.have.property('token');
            res.body[0].social.twitter.should.not.to.have.property('id');
          }
          done();
        });
      });
    });
  });

  // Get User
  describe('/GET users/:id', () => {
    it('it should get user with given id', (done) => {
      createTestUser()
      .then((user) => {
        chai.request(app)
        // eslint-disable-next-line
        .get(`/v1/users/${user._id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.not.to.have.property('password');
          done();
        });
      });
    });

    it('it should fail 400 when given id is not mongo object id', (done) => {
      chai.request(app)
      .get('/v1/users/john')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });
  });

  // Create User
  describe('/POST users', () => {
    it('it should create user', (done) => {
      const userObject = createTestUserObject();
      chai.request(app)
      .post('/v1/users')
      .set('content-type', 'application/json')
      .send(userObject.toJSON())
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.password.should.not.be.eql(userObject.password);
        res.body.slug.should.be.eql('john-doe');
        res.body.should.have.property('updatedAt');
        res.body.should.have.property('createdAt');
        done();
      });
    });
    it('it should create user with incremented slug', (done) => {
      createTestUser()
      .then(() => {
        const duplicateUser = createTestUserObject();

        duplicateUser.email = 'johndoe-2@example.com';
        chai.request(app)
        .post('/v1/users')
        .set('content-type', 'application/json')
        .send(duplicateUser.toJSON())
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.slug.should.be.eql('john-doe-2');
          done();
        });
      });
    });
    it('it should fail 400 if email is already taken', (done) => {
      createTestUser()
      .then(() => {
        const duplicateUser = createTestUserObject();

        duplicateUser.email = 'johndoe@example.com';
        chai.request(app)
        .post('/v1/users')
        .set('content-type', 'application/json')
        .send(duplicateUser.toJSON())
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
      });
    });
    it('it should fail 400 if required fields are not provided', (done) => {
      const userObject = createTestUserObject();
      userObject.email = null;

      chai.request(app)
      .post('/v1/users')
      .set('content-type', 'application/json')
      .send(userObject.toJSON())
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
    });
  });

  // Update User
  describe('/PUT users/:id', () => {
    it('it should update user with given id', (done) => {
      createTestUser()
      .then((user) => {
        const updatedUser = user.toObject();
        updatedUser.title = 'Sue Doe';
        chai.request(app)
        // eslint-disable-next-line
        .put(`/v1/users/${user._id}`)
        .set('content-type', 'application/json')
        .send(JSON.stringify(updatedUser))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.title.should.be.eql('Sue Doe');
          done();
        });
      });
    });
    it('it should update user slug and store old slug', (done) => {
      createTestUser()
      .then((user) => {
        const updatedUser = user.toObject();
        updatedUser.title = 'Sue Doe';
        chai.request(app)
        // eslint-disable-next-line
        .put(`/v1/users/${user._id}`)
        .set('content-type', 'application/json')
        .send(JSON.stringify(updatedUser))
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.slug.should.be.eql('sue-doe');
          res.body.should.have.property('slugs');
          res.body.slugs.length.should.be.eql(1);
          res.body.slugs[0].should.be.eql(user.slug);
          done();
        });
      });
    });
  });
  // Delete User
  describe('/DELETE users/:id', () => {
    it('it should delete user with given id', (done) => {
      createTestUser()
      .then((user) => {
        chai.request(app)
        // eslint-disable-next-line
        .delete(`/v1/users/${user._id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
      });
    });
  });
});
