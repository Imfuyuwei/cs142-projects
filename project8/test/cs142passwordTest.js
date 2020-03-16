
var assert = require('assert');

function includes(values, item) {
    return (values.indexOf(item) >= 0);
}

describe('cs142 password api test', function() {

   var cs142password;

   describe('test makePasswordEntry', function(done) {

      it('can get the function from the module by require', function(done) {
         cs142password = require('../cs142password');
         assert(cs142password);
         assert.strictEqual(typeof cs142password.makePasswordEntry, 'function');
         done();
      });

      it('can make a password with a hash and salt', function(done) {
         var pwd = cs142password.makePasswordEntry('TestPassword');
	      assert.strictEqual(typeof pwd, 'object');
         assert.strictEqual(typeof pwd.hash, 'string');
         assert.strictEqual(pwd.hash.length, 40);
         assert.strictEqual(typeof pwd.salt, 'string');
         assert.strictEqual(pwd.salt.length, 16);
         done();
      });

      it('should return a different salt and hash each time', function(done) {
         var saltsSeen = [];
         var hashsSeen = [];
         for(var i = 0; i < 100; i++) {
           var pwd = cs142password.makePasswordEntry('TestPassword');
           assert(!includes(saltsSeen, pwd.salt), 'duplicate salt returned');
           assert(!includes(hashsSeen, pwd.hash), 'duplicate hash returned');
           saltsSeen.push(pwd.salt);
           hashsSeen.push(pwd.hash);
         }
         done();
      });

   });

   describe('test doesPasswordMatch', function(done) {
      var cs142password;

      it('can get the function from the module by require', function(done) {
         cs142password = require('../cs142password');
         assert(cs142password);
	      assert.strictEqual(typeof cs142password.doesPasswordMatch, 'function');
         done();
      });

      it('can validate a password returned by makePasswordEntry', function() {
         var pwd = cs142password.makePasswordEntry('TestPassword');
         assert(cs142password.doesPasswordMatch(pwd.hash, pwd.salt, 'TestPassword'));
         assert(!cs142password.doesPasswordMatch(pwd.hash, pwd.salt, 'NotTestPassword'));
      });

    });


});
