'use strict';

const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const MONGOOSE = require('mongoose');
let CONSTANTS = require('./constants');
const UserModel = require('../models/UserModel');

let commonFunctions = {};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString 
 */
commonFunctions.hashPassword = async (payloadString) => {
  return BCRYPT.hashSync(payloadString, await BCRYPT.genSalt());
};

/**
 * @param {string} plainText 
 * @param {string} hash 
 */
commonFunctions.compareHash = (payloadPassword, userPasswordHash) => {
  return BCRYPT.compareSync(payloadPassword, userPasswordHash);
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload) => {
  let token = JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, {
    algorithm: 'HS256',
    expiresIn: 900       // define expiry time here we take 15 minutes for now
  });
  return token;
};

commonFunctions.decryptJwt = (token) => {
  return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
};

commonFunctions.convertToObjectId = (id) => {
  return MONGOOSE.Types.ObjectId(id);
}

/**
 * FUNCTION TO APPLY REFERRAL BONUS
 * @param {*} user 
 * @param {*} referralCode 
 * @returns 
 */
commonFunctions.applyReferralBonus = async (user, referralCode) => {
  const referralUser = await UserModel.findOne({ referralCode });

  if (referralUser) {
    user.referralPoints += 10;
    referralUser.referralPoints += 20;
    await referralUser.save();
  }

  return user;
};

/**
* function to generate random alphanumeric string
*/
commonFunctions.generateAlphanumericString = (length) => {
  let chracters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomString = '';
  for (let i = length; i > 0; --i) randomString += chracters[Math.floor(Math.random() * chracters.length)];
  return randomString;
};

module.exports = commonFunctions;

