"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');


// var mentionSchema = new mongoose.Schema({
//     photo_id: mongoose.Schema.Types.ObjectId,     
//     photo_owner_id: mongoose.Schema.Types.ObjectId,
//     photo_owner_first_name: String,  
//     photo_owner_last_name: String
// });

// create a schema
var userSchema = new mongoose.Schema({
    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    login_name: String, //login name 
    password: String,
    occupation: String,    // Occupation of the user.
    mentioned: [mongoose.Schema.Types.ObjectId], //array of photo ids 
    favorites: [mongoose.Schema.Types.ObjectId], //array of photo ids
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
