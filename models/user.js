const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
	name:{
		type: String,
		required: true
	},
	email:{
		type: String,
		required: true
	},
	contact:{
		type: String,
		required:true
	},
	username:{
		type: String,
		required: true
	},
	password:{
		type: String,
		required: true
	},
	file:{
		type: String
	},
	Articles:{
		type:Number
	},
	MissingPerson:{
		type:Number
	}
});

const User = module.exports = mongoose.model('User', UserSchema);