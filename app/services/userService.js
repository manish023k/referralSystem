'use strict';
const { UserModel } = require(`../models`);
const utils = require(`../utils/utils`);

let userService = {};

/** 
 * function to register a new  user
 */
userService.save = async (payload) => {
  const { name, mobile, referralCode, gender, technology, dob, profilePics } = payload;
  
  let user = new UserModel({ name, mobile, gender, technology, dob, profilePics });
  if (referralCode) {
    user = await utils.applyReferralBonus(user, referralCode);
  }
  // encrypt user's password and store it in the database.
  user.password = await utils.hashPassword(payload.password);
  user.referralCode = utils.generateAlphanumericString(6);

  return await user.save();
};

/**
 * function to update user.
 */
userService.findOneAndUpdate = async (criteria, dataToUpdate, options) => {
  return await UserModel.findOneAndUpdate(criteria, dataToUpdate, options);
};

/**
 * function to fetch user from the system based on criteria.
 */
userService.findOne = async (criteria, projection = {}) => {
  return await UserModel.findOne(criteria, projection).lean();
};

/**
 * function to fetch users from the system based on criteria.
 * @param {*} aggregateQuery 
 * @returns 
 */
userService.aggregate = async (aggregateQuery) => {
  return UserModel.aggregate(aggregateQuery);
}

/**
 * function to delete user from the system based on criteria.
 * @param {*} criteria 
 * @returns 
 */
userService.deleteOne = async (criteria) => {
  return UserModel.deleteOne(criteria);
}

module.exports = userService;