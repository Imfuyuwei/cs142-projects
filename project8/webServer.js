"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require("mongoose");

mongoose.Promise = require("bluebird");
var fs = require("fs");

var async = require("async");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require("./schema/user.js");
var Photo = require("./schema/photo.js");
var SchemaInfo = require("./schema/schemaInfo.js");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
var bodyParser = require("body-parser");
var multer = require("multer");
var processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);

var express = require("express");
var app = express();

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect("mongodb://localhost/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    user_id: undefined,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);
app.use(bodyParser.json());

app.get("/", function(request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get("/test/:p1", function(request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params objects.
  console.log("/test called with param1 = ", request.params.p1);

  var param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
    SchemaInfo.find({}, function(err, info) {
      if (err) {
        // Query returned an error.  We pass it back to the browser with an Internal Service
        // Error (500) error code.
        console.error("Doing /user/info error:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object - This
        // is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an async
    // call to each collections. That is tricky to do so we use the async package
    // do the work.  We put the collections into array and use async.each to
    // do each .count() query.
    var collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo }
    ];
    async.each(
      collections,
      function(col, done_callback) {
        col.collection.countDocuments({}, function(err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function(err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          var obj = {};
          for (var i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400) status.
    response.status(400).send("Bad param " + param);
  }
});

app.get("/otherUsers/list", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }

  let curr_user_id = request.session.user_id;
  User.find({}, (_, allUsers) => {
    let newUsers = allUsers.filter(user => String(user._id) !== String(curr_user_id));
    
    async.eachOf(
      newUsers, 
      function(user, i, callback) {
        let { _id, first_name, last_name } = user;
        newUsers[i] = { _id, first_name, last_name };
        callback();
      },
      err => {
        if (err) {
          console.log(err);
        } else {
          response.status(200).send(newUsers);
        }
      }
    );
  });
});

/*
 * URL /user/list - Return all the User object.
 */
app.get("/user/list", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  User.find({}, (_, allUsers) => {
    let newUsers = allUsers;
    async.eachOf(
      allUsers,
      function(user, i, callback) {
        let { _id, first_name, last_name } = user;
        newUsers[i] = { _id, first_name, last_name };
        callback();
      },
      err => {
        if (err) {
          console.log(err);
        } else {
          response.status(200).send(newUsers);
        }
      }
    );
  });
});

/*
 * URL /user/mentionOptions - Return all the User object.
 */
app.get("/user/mentionOptions", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  User.find({}, (_, allUsers) => {
    let newUsers = allUsers;
    async.eachOf(
      allUsers,
      function(user, i, callback) {
        let { _id, first_name, last_name } = user;
        newUsers[i] = { id: _id, display: `${first_name} ${last_name}` };
        callback();
      },
      err => {
        if (err) {
          console.log(err);
        } else {
          response.status(200).send(newUsers);
        }
      }
    );
  });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get("/user/:id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  var id = request.params.id;
  User.findOne({ _id: id }, (err, user) => {
    if (err) {
      console.log("User with _id:" + id + " not found.");
      response.status(400).send("Not found");
      return;
    }
    let {
      _id,
      first_name,
      last_name,
      location,
      description,
      occupation,
      mentioned
    } = user;
    let newUser = {
      _id,
      first_name,
      last_name,
      location,
      description,
      occupation,
      mentioned
    };

    response.status(200).send(newUser);
  });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get("/photosOfUser/:id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  var id = request.params.id;
  Photo.find({ user_id: id }, (err, photos) => {
    if (err) {
      console.log("Photos for user with _id:" + id + " not found.");
      response.status(400).send("Not found");
      return;
    }
    let newPhotos = JSON.parse(JSON.stringify(photos));
    async.eachOf(
      newPhotos,
      function(photo, i, callback) {
        delete photo.__v;
        async.eachOf(
          photo.comments,
          function(com, i, callback2) {
            let the_user = User.findOne({ _id: com.user_id }, err => {
              if (err) {
                response.status(400).send("Not found");
              }
            });
            the_user.then(user => {
              let { _id, first_name, last_name } = user;
              photo.comments[i] = {
                comment: com.comment,
                date_time: com.date_time,
                _id: com._id,
                user: {
                  _id: _id,
                  first_name: first_name,
                  last_name: last_name
                }
              };
              callback2();
            });
          },
          err => {
            if (err) {
              console.log("error occured");
            }
            newPhotos[i] = photo;
            callback();
          }
        );
      },
      function(err) {
        if (!err) {
          response.status(200).send(newPhotos);
        }
      }
    );
  });
});

app.get("/admin/current", function(request, response) {
  let user_id = request.session.user_id;
  if (!user_id) {
    console.log("user_id was undefined");
    response.status(200).send(undefined);
    return;
  }
  User.findOne({ _id: user_id }, (_, user) => {
    if (!user) {
      console.log("id was not recognized");
      response.status(400).send("id was not recognized");
      return;
    }

    let { _id, first_name, last_name, login_name } = user;
    let newUser = { _id, first_name, last_name, login_name };
    response.status(200).send(newUser);
  });
});

app.post("/admin/login", function(request, response) {
  //request.session is an object you can read or write
  //parameter in request body is accessed using request.body.parameter_name
  let loginName = request.body.login_name;
  let password_attempt = request.body.password;
  User.findOne({ login_name: loginName }, (err, user) => {
    if (err || !user) {
      console.log("User with login_name:" + loginName + " not found.");
      response.status(400).send("Login name was not recognized");
      return;
    }
    if (user.password != password_attempt) {
      response.status(400).send("Wrong password");
      return;
    }
    request.session.login_name = loginName;
    request.session.user_id = user._id;
    // request.session.cookie.user_id = user._id;
    let { _id, first_name, last_name, login_name } = user;
    let newUser = { _id, first_name, last_name, login_name };

    response.status(200).send(newUser);
  });
  //store into request.session.user_id so that others can read.
});

app.post("/admin/logout", function(request, response) {
  //request.session is an object you can read or write
  request.session.destroy(function(err) {
    if (err) {
      console.log(err);
      response.status(400).send("unable to logout");
      return;
    }
    response.status(200).send();
  });
});

//only returns basic info like the photo filename, the photo owner,
app.get("/photo/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  let photo_id = request.params.photo_id;
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (err) {
      response.status(400).send("invalid photo id");
      return;
    }
    User.findOne({ _id: photo.user_id }, function(_, photo_owner) {
      let photoObj = {
        _id: photo_id,
        photo_owner_id: photo_owner._id,
        file_name: photo.file_name,
        photo_owner_first_name: photo_owner.first_name,
        photo_owner_last_name: photo_owner.last_name
      };
      response.status(200).send(photoObj);
      return;
    });
  });
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  let photo_id = request.params.photo_id;
  let curr_user = request.session.user_id;
  //adds a comment to photo with id photo_id
  let text = request.body.comment;
  let mentionsToAdd = request.body.mentionsToAdd;
  if (!text) {
    response.status(400).send("invalid comment request");
    return;
  }
  //access database to find photo
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (err) {
      response.status(400).send("invalid photo id");
      return;
    }
    let now = new Date();
    photo.comments = photo.comments.concat([
      { comment: text, date_time: now, user_id: curr_user }
    ]);
    photo.save();

    //add the photo id to each user mentioned.
    async.each(
      mentionsToAdd,
      function(user, callback) {
        User.findOne({ _id: user }, function(err, user) {
          if (err) {
            response.status(400).send("Invalid id received.");
            return;
          }
          user.mentioned.push(photo_id);
          user.save();
          callback();
        });
      },
      function(err) {
        //after everything is done.
        if (err) {
          response.status(400).send("something went wrong");
          return;
        }
        response.status(200).send();
      }
    );
  });
});

//request.body has photo_id
app.post(`/addToFavorites`, function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  let curr_user_id = request.session.user_id;
  let photo_id = request.body.photo_id;
  User.findOne({ _id: curr_user_id }, function(err, user) {
    if (err) {
      response.status(400).send("invalid user id");
      return;
    }
    if (!user.favorites.includes(photo_id)) {
      //in case it was already favorited?
      user.favorites.push(photo_id);
      user.save();
    }
    response.status(200).send();
  });
});

//request.body has {like: bool}
app.post(`/likeOrUnlike/:photo_id`, function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  let photo_id = request.params.photo_id;
  let curr_user_id = request.session.user_id;
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (err) {
      response.status(400).send("invalid photo id");
      return;
    }

    let index_of_user = photo.liked_by.indexOf(curr_user_id);
    if (request.body.like) {
      //they are trying to like it.
      if (index_of_user >= 0) {
        //they already liked it.
        response.status(400).send("you already liked this");
        return;
      }
      photo.liked_by.push(curr_user_id);
    } else {
      //they are removing a like.
      if (index_of_user == -1) {
        response.status(400).send("it does not seem like you have liked it");
        return;
      }
      photo.liked_by.splice(index_of_user, 1);
    }
    photo.save();
    response.status(200).send();
  });
});

app.get("/deleteFavorite/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  let photo_id = request.params.photo_id;
  let curr_user_id = request.session.user_id;
  User.findOne({ _id: curr_user_id }, function(err, user) {
    if (err) {
      response.status(400).send("invalid user id");
      return;
    }
    const index = user.favorites.indexOf(photo_id);
    user.favorites.splice(index, 1);
    user.save();
    response.status(200).send();
  });
});

app.post("/addPhotoTag/:photo_id", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  let photo_id = request.params.photo_id;
  let tag = request.body;
  Photo.findOne({ _id: photo_id }, function(err, photo) {
    if (err) {
      response.status(400).send("invalid photo id");
      return;
    }
    photo.tags.push(tag);
    photo.save();
    response.status(200).send();
  });
});

//returns the array of objects, each with _id, file_name and date_time
app.get(`/getFavorites`, function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  let curr_user_id = request.session.user_id;

  User.findOne({ _id: curr_user_id }, function(err, user) {
    if (err) {
      response.status(400).send("invalid user id");
      return;
    }
    let favorites = user.favorites;
    let favoritesToReturn = [];
    async.each(
      favorites,
      (photo_id, callback) => {
        Photo.findOne({ _id: photo_id }, function(err, photo) {
          if (err) {
            response.status(200).send("photo id not recognized");
            return;
          }
          favoritesToReturn.push({
            file_name: photo.file_name,
            date_time: photo.date_time,
            _id: photo._id
          });
          callback();
        });
      },
      function(err) {
        if (err) {
          response.status(400).send("was not able to retrieve all favorites");
          return;
        }
        response.status(200).send(favoritesToReturn);
      }
    );
  });
});

app.post("/photos/new", function(request, response) {
  if (!request.session.user_id) {
    response.status(401).send("not logged in");
    return;
  }
  // console.log(request);
  processFormBody(request, response, function(err) {
    if (err || !request.file) {
      response.status(400).send("file not valid");
      return;
    }
    let userPermissions = JSON.parse(request.body.usersPermissed);
    // request.file has the following properties of interest
    //      fieldname      - Should be 'uploadedphoto' since that is what we sent
    //      originalname:  - The name of the file the user uploaded
    //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
    //      buffer:        - A node Buffer containing the contents of the file
    //      size:          - The size of the file in bytes

    // XXX - Do some validation here.
    // We need to create the file in the directory "images" under an unique name. We make
    // the original file name unique by adding a unique prefix with a timestamp.
    var timestamp = new Date().valueOf();
    var filename = "U" + String(timestamp) + request.file.originalname;

    fs.writeFile("./images/" + filename, request.file.buffer, function(err) {
      // XXX - Once you have the file written into your images directory under the name
      // filename you can create the Photo object in the database
      if (err) {
        response.status(400).send("unable to write file");
        return;
      }
      let users_permitted = Object.entries(userPermissions)
        .filter((key_value) => key_value[1])
        .map((key_value) => key_value[0]);
      users_permitted.push(request.session.user_id);
      Photo.create(
        {
          file_name: filename,
          date_time: timestamp,
          user_id: request.session.user_id,
          comments: [],
          tags: [],
          users_permitted,
        },
        function(err, newPhoto) {
          if (err) {
            response.status(400).send("unable to create new photo");
            return;
          }
          newPhoto.save();
          response.status(200).send();
        }
      );
    });
  });
  //place file in images directory
  //make new photo object and store in database;
});

//allows a user to register
app.post("/user", function(request, response) {
  let {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation
  } = request.body;
  if (!password) {
    console.log("password cannot be blank");
    response.status(400).send("Password cannot be blank.");
    return;
  } else {
    //verfiy the login_name doesn't exist
    User.findOne({ login_name }, function(err, user) {
      if (user) {
        response.status(400).send("Username is already taken.");
        return;
      }
      User.create(
        {
          login_name,
          password,
          first_name,
          last_name,
          location,
          description,
          occupation
        },
        function(_, newUser) {
          request.session.login_name = login_name;
          request.session.user_id = newUser._id;
          request.session.cookie.user_id = newUser._id;
          let curr_user = {
            _id: newUser._id,
            first_name,
            last_name,
            login_name
          };
          response.status(200).send(curr_user);
        }
      );
    });
  }
});

var server = app.listen(3000, function() {
  var port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
