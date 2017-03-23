process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();

describe('Environment', () => {
  describe('Test', () => {
      it('it should wordk', (done) => {
        var a = 3;
        a.should.equal(3);
        done();
      });
  });
});