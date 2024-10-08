'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { GENDER, TECHNOLOGY } = require('../utils/constants');
const { required } = require('joi');

/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    referralCode: { type: String, default: null },
    gender: { type: String, enum: Object.values(GENDER), required: true },
    technology: { type: String, enum: Object.values(TECHNOLOGY), required: true },
    profilePics: [{ type: String }],
    dob: { type: Date, required: true },
    password: { type: String, required: true },
    referralPoints: { type: Number, default: 0 }
});

userSchema.set('timestamps', true);

module.exports = MONGOOSE.model('users', userSchema);