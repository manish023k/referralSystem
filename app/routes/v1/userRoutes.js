'use strict';

const Joi = require('joi');
Joi.fileArray = ({ name, description = 'File', maxCount }) => {
    let joiValidation = Joi.any().meta({ swaggerType: 'file' }).optional().description(description)
    maxCount && (joiValidation.maxCount = maxCount);
    return { [name]: joiValidation }
};
const { AVAILABLE_AUTHS, GENDER, TECHNOLOGY } = require(`../../utils/constants`);
const { registerNewUser, login, deleteUser, updateProfile, getUsers } = require(`../../controllers/userController`); // load controllers
const { query } = require('express');

let routes = [
	{
		method: 'DELETE',
		path: '/v1/user',
		joiSchema: {
			headers: {
				authorization: Joi.string().required().description('User\'s JWT token.')
			}
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: deleteUser
	},
	{
		method: 'POST',
		path: '/v1/user',
		joiSchema: {
			formData: {
				fileArray: Joi.fileArray({ name: "profilePics", description: "Photos file array", maxCount: 5 }),
				body: {
					name: Joi.string().required().description('User\'s name.'),
					mobile: Joi.string().required().description('User\'s mobile number'),
					password: Joi.string().required().description("User\'s password"),
					referralCode: Joi.string().optional().description('User\'s referral code.'),
					technology: Joi.string().valid(...Object.values(TECHNOLOGY)).required().description('User\'s technology.'),
					dob: Joi.date().required().description('User\'s date of birth.'),
					gender: Joi.string().valid(...Object.values(GENDER)).required().description('User\'s gender.')
				}
			}
			
		},
		handler: registerNewUser
	},
	{
		method: 'POST',
		path: '/v1/user/login',
		joiSchema: {
			body: {
				mobile: Joi.string().required().description('User\'s mobile number'),
				password: Joi.string().required().description('User\'s password')
			}
		},
		// auth: AVAILABLE_AUTHS.USER,
		handler: login
	},
	{
		method: 'PUT',
		path: '/v1/user',
		joiSchema: {
			headers: {
				authorization: Joi.string().required().description('User\'s JWT token.')
			},
			formData: {
				fileArray: Joi.fileArray({ name: "profilePics", description: "Photos file array", maxCount: 5 }),
				body: {
					name: Joi.string().required().description('User\'s name.'),
					oldPassword: Joi.string().optional().description('oldPassword'),
					newPassword: Joi.string().when('oldPassword', { is: Joi.exist(), then: Joi.required(), otherwise: Joi.optional() }).description('New password.'),
					technology: Joi.string().valid(...Object.values(TECHNOLOGY)).required().description('User\'s technology.'),
					dob: Joi.date().required().description('User\'s date of birth.'),
					gender: Joi.string().valid(...Object.values(GENDER)).required().description('User\'s gender.')
				}
			}
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: updateProfile
	},
	{
		method: 'GET',
		path: '/v1/users',
		joiSchema: {
			headers: {
				authorization: Joi.string().required().description('User\'s JWT token.')
			},
			query: {
				userId: Joi.string().optional().description('User Id'),
				skip: Joi.number().default(0).description("skip"),
				limit: Joi.number().default(10).description("limit")
			}
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: getUsers
	}
];

module.exports = routes;