import chai from 'chai';
import chaiHttp from 'chai-http';

const expect = chai.expect;

chai.use(chaiHttp);

describe('API v1/', () => {
  it('should return api info', () => {
    const dummy = { version: 1 };
    expect(dummy).to.equal = { version: 1 };
  });
});
