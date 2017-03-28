import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../';
import helpers from './helpers/specs';

chai.should();

chai.use(chaiHttp);

describe('/GET v1', () => {
  it('it should return version info', (done) => {
    chai.request(app)
    .get('/v1')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('name');
      res.body.should.have.property('documentation');
      res.body.should.have.property('version');
      res.body.version.should.equal(1);
      done();
    });
  });
});

export { app, helpers };
