'use strict';
/*
 * Mocha test of cs142 Project #7 web server session and input API.  To run type
 *   node_modules/.bin/mocha sessionInputApiTest.js
 */
/* jshint node: true */

var assert = require('assert');
var http = require('http');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');

var cs142models = require('../modelData/photoApp.js').cs142models;

var port = 3000;
var host = 'localhost';

function makeFullUrl(url) {

    return 'http://' + host + ':' + port + url;
}

function assertEqualDates(d1, d2) {

    return (new Date(d1).valueOf() === new Date(d2).valueOf());
}
/*
 * MongoDB automatically adds some properties to our models. We allow
 * these to appear by removing them when before checking
 * for invalid properties.  This way the models are permitted but
 * not required to have these properties.
 */
function removeMongoProperties(model) {
    var copy = JSON.parse(JSON.stringify(model));
    delete copy._id;
    delete copy.__v;
    return copy;
}

describe('CS142 Photo App Session and Input API - ', function () {


    describe('test /admin/login and /admin/logout', function (done) {


        it('errors getting the list of user if not logged in', function (done) {
            request(makeFullUrl('/user/list'), function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 401, 'HTTP response status code 401');
                done();
            });

        });

        it('errors getting user detail if not logged in', function (done) {
            request(makeFullUrl('/user/1'), function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 401, 'HTTP response status code 401');
                done();
            });
        });



        it('errors getting photosOfUser if not logged in', function (done) {
            request(makeFullUrl('/photosOfUser/1'), function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 401, 'HTTP response status code 401');
                done();
            });
        });

        it('rejects logins to non-existent login_name', function(done) {
            request({
                method: "POST",
                json: true,
                body: {login_name: "notValid"},
                url: 'http://' + host + ':' + port + '/admin/login'
            }, function (error, response, body) {
                assert.strictEqual(response.statusCode, 400, 'HTTP response status code 401');
                done();
            });

        });


        it('rejects logins to existing login_name with wrong password', function(done) {
            request({
                method: "POST",
                json: true,
                body: {login_name: "took", password: "wrong"},
                url: 'http://' + host + ':' + port + '/admin/login'
            }, function (error, response, body) {
                assert.strictEqual(response.statusCode, 400, 'HTTP response status code 400');
                done();
            });

        });

        it('accepts logins to existing login_name with correct password', function(done) {
            request = request.defaults({jar: true});
            request({
                method: "POST",
                json: true,
                body: {login_name: "took", password: "weak"},
                url: makeFullUrl('/admin/login')
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                done();
            });

        });

        it('can get user list when logged in', function(done) {

            request(makeFullUrl('/user/list'), function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                done();
            });

        });

        it('can logout when logged in', function(done) {

            request.post(makeFullUrl('/admin/logout'), function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                done();
            });


        });
    });

    describe('test /commentsOfPhoto/id', function (done) {

        var user_id;
        var photos, photos2;
        var newCommentText = "this is a new comment";
        var photo_id;
        var originalPhoto;

        it('can login as took and get id', function(done) {
            request = request.defaults({jar: true});
            request({
                method: "POST",
                json: true,
                body: {login_name: "took", password: "weak"},
                url: makeFullUrl('/admin/login')
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                user_id = body._id;
                done();
            });

        });

        it('can get tooks photos', function(done) {
            request({
                method: "GET",
                json: true,
                url: makeFullUrl('/photosOfUser/' + user_id)
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                photos = body;
                done();
            });

        });

        it('can add a comment to the the first photo', function(done) {
            originalPhoto = photos[0];
            photo_id = originalPhoto._id;
            request({
                method: "POST",
                json: true,
                body: {comment: newCommentText},
                url: makeFullUrl('/commentsOfPhoto/' + photo_id)
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                done();
            });

        });

        it('can get tooks photos again', function(done) {
            request({
                method: "GET",
                json: true,
                url: makeFullUrl('/photosOfUser/' + user_id)
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                photos2 = body;
                done();
            });

        });

        it('photo has one more comment', function (done) {
            var newPhoto = _.find(photos2, {_id: photo_id});
            assert(newPhoto, 'Can not find photo');
            assert.strictEqual(newPhoto.comments.length, originalPhoto.comments.length+1);
            done();
        });

        it('can logout when logged in', function(done) {

            request.post(makeFullUrl('/admin/logout'), function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                done();
            });


        });

    });

    describe('upload photos -  post /photos/new', function (done) {

        var user_id;
        var uniquePhotoName = 'p' + String(new Date().valueOf()) + '.jpg';

        it('can login as took and get id', function (done) {
            request = request.defaults({jar: true});
            request({
                method: "POST",
                json: true,
                body: {login_name: "took", password: "weak"},
                url: makeFullUrl('/admin/login')
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                user_id = body._id;
                done();
            });

        });

        it('can upload a photo', function (done) {

            var formData = {
                uploadedphoto: {
                    value: fs.createReadStream(__dirname + '/testPhoto.jpg'),
                    options: {
                        filename: uniquePhotoName,
                        contentType: 'image/jpg'
                    }
                }
            };
            request.post({
                url: makeFullUrl('/photos/new'),
                formData: formData
            }, function optionalCallback(err, response, body) {
                if (err) {
                    done();
                    return console.error('upload failed:', err);
                }
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                done();
            });
        });

        it('can get the uploaded photo ', function(done) {
            request({
                method: "GET",
                json: true,
                url: makeFullUrl('/photosOfUser/' + user_id)
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                var newPhoto = _.find(body,  function (p) {
                    return p.file_name.match(uniquePhotoName);
                });
                assert(newPhoto, "Can not find upload photo");
                done();
            });

        });


    });


    describe('register user - post to /user', function (done) {
        var newUniqueLoginName = 'u' + String(new Date().valueOf());
        it('can create a new user', function(done) {
            request = request.defaults({jar: true});

            var params = {
                login_name: newUniqueLoginName,
                password: 'weak2',
                first_name: 'Fn' + newUniqueLoginName,
                last_name: 'Ln' + newUniqueLoginName,
                location: 'Loc' + newUniqueLoginName,
                description: 'Desc' + newUniqueLoginName,
                occupation: 'Occ'+ newUniqueLoginName
            };
            request({
                method: "POST",
                json: true,
                body: params,
                url: makeFullUrl('/user')
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 200, 'HTTP response status code 200');
                done();
            });

        });

        it('can reject a duplicate user', function(done) {
            request = request.defaults({jar: true});

            var params = {
                login_name: newUniqueLoginName,
                password: 'weak2',
                first_name: 'Fn' + newUniqueLoginName,
                last_name: 'Ln' + newUniqueLoginName,
                location: 'Loc' + newUniqueLoginName,
                description: 'Desc' + newUniqueLoginName,
                occupation: 'Occ'+ newUniqueLoginName
            };
            request({
                method: "POST",
                json: true,
                body: params,
                url: makeFullUrl('/user')
            }, function (error, response, body) {
                assert(!error);
                assert.strictEqual(response.statusCode, 400, 'HTTP response status code 400');
                done();
            });

        });

    });



});
