"use strict";
const path = require('path');
const CONFIG = require('../../config');
const HELPERS = require("../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, DEFAULT_PROFILE_IMAGE } = require('../utils/constants');
const SERVICES = require('../services');
const { compareHash, encryptJwt, hashPassword } = require(`../utils/utils`);
const { s3Bucket } = require('../../config');

/**************************************************
 ***** Auth controller for authentication logic ***
 **************************************************/
let userController = {};

/**
 * function to get server response.
 */
userController.deleteUser = async (payload) => {
	await userService.deleteOne({ _id: payload.user._id });
	return HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_DELETED_SUCCESSFULLY);
};

/**
 * function to register a user to the system.
 * @param {*} payload 
 * @returns 
 */
userController.registerNewUser = async (payload) => {

	let criteria = { mobile: payload.mobile };
	// check here if mobile is already exists in the database or not.
	let isUserAlreadyExists = await SERVICES.userService.findOne(criteria);
	if (isUserAlreadyExists) {
		throw HELPERS.responseHelper.createErrorResponse(MESSAGES.MOBILE_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
	}

	let newRegisteredUser = await SERVICES.userService.save(payload);
	const dataForJwt = { id: newRegisteredUser._id, name: newRegisteredUser.name, date: Date.now() };

	return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { token: encryptJwt(dataForJwt) });
};

/**
 * Function to fetch user's profile from the system.
 * @param {*} payload 
 * @returns 
 */
userController.getUsers = async (payload) => {
	let { limit, skip } = payload;

	let users = (await SERVICES.userService.aggregate([
		{ $sort: { createdAt: 1 } },
		{ $project : { password: 0 } },
		{ $facet: {
			data: [
				{ $skip: skip },
				{ $limit: limit }
			],
			totalCount: [
				{ $count: "count" }
			]
		} },
		{ $unwind: { path: "$totalCount", preserveNullAndEmptyArrays: true } },
		{ $addFields: {
			totalCount: { $ifNull: ["$totalCount.count", 0] }
		} }
	]))[0];

	return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_LIST_FETCHED_SUCCESSFULLY), users);
};

/**
 * function to login a user to the system.
 * @param {*} payload 
 * @returns 
 */
userController.login = async (payload) => {

	let user = await SERVICES.userService.findOne({ mobile: payload.mobile }, { ...NORMAL_PROJECTION });
	if (user) {
		// compare user's password.
		if (!compareHash(payload.password, user.password)) {
			throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);
		}

		// create data for JWT token.
		const dataForJwt = { id: user._id, name: user.name, date: Date.now() };
		delete user.password;
		return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { data: { ...user }, token: encryptJwt(dataForJwt) });
	}
	throw HELPERS.responseHelper.createErrorResponse(MESSAGES.MOBILE_NOT_REGISTERED, ERROR_TYPES.BAD_REQUEST);
};

/**
 * Function to update profile of a user.
 * @param {*} payload 
 * @returns 
 */
userController.updateProfile = async (payload) => {

	if (payload.hasOwnProperty('mobile')) {
		let isAlreadyExistUser = await SERVICES.userService.findOne({ mobile: payload.mobile });

		if (isAlreadyExistUser && payload.user.mobile != payload.mobile) {
			let responseMessage = payload.mobile === isAlreadyExistUser.mobile ? MESSAGES.mobile_CANNOT_BE_SAME_AS_PREVIOUS_mobile : MESSAGES.MOBILE_ALREADY_EXISTS;
			throw HELPERS.responseHelper.createErrorResponse(responseMessage, ERROR_TYPES.BAD_REQUEST);

		}

	}

	// if user wants to change his password then compare old password.
	if (payload.hasOwnProperty('oldPassword')) {
		if (payload.oldPassword === payload.newPassword) {
			throw HELPERS.responseHelper.createErrorResponse(MESSAGES.OLD_PASSWORD_OR_NEW_PASSWORD_CANNOT_BE_SAME, ERROR_TYPES.BAD_REQUEST);
		}
		let user = await SERVICES.userService.findOne({ _id: payload.user._id });
		if (!compareHash(payload.oldPassword, user.password)) {
			throw HELPERS.responseHelper.createErrorResponse(MESSAGES.ENTERED_OLD_PASSWORD_IS_INCORRECT, ERROR_TYPES.BAD_REQUEST);
		}
		payload.password = await hashPassword(payload.newPassword);
	}
	let updatedUser = await SERVICES.userService.findOneAndUpdate({ _id: payload.user._id }, payload, { lean: true, new: true, projection: { ...NORMAL_PROJECTION, password: 0 } });

	return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_UPDATED_SUCCESSFULLY), { data: updatedUser });
};

/* export userController */
module.exports = userController;