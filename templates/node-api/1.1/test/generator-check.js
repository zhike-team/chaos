'use strict';

const should = require('chai').should;
const GF = 'GeneratorFunction';

function isGeneratorFunction(gf) {
  return gf && gf.constructor && gf.constructor.name === 'GeneratorFunction';
}

describe('Check Generator Function', () => {

  describe('Generator functions should hit', () => {

    it('const g = function *() { yield null; };', () => {
      const g = function *() { yield null; };
      g.constructor.name.should.equal(GF);
      isGeneratorFunction(g).should.equal(true);
    });

    it('function *g() { yield null; }', () => {
      function *g() { yield null; }
      g.constructor.name.should.equal(GF);
      isGeneratorFunction(g).should.equal(true);
    });

    it('should work after bind.', () => {
      const g = function *() { yield null; };
      g.bind(this).constructor.name.should.equal(GF);
      isGeneratorFunction(g.bind(this)).should.equal(true);
    });

  });

  describe('Normal functions should miss', () => {

    it('const f = function() { return null; };', () => {
      const f = function() { return null; };
      f.constructor.name.should.not.equal(GF);
      isGeneratorFunction(f).should.equal(false);
    });

    it('const f = () => null;', () => {
      const f = () => null;
      f.constructor.name.should.not.equal(GF);
      isGeneratorFunction(f).should.equal(false);
    });

    it('function f() { return null; }', () => {
      function f() { return null; }
      f.constructor.name.should.not.equal(GF);
      isGeneratorFunction(f).should.equal(false);
    });

  });

});
