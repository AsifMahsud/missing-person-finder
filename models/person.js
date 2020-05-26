let mongoose = require('mongoose');

// Person Schema // Person can be either Missing or Found
let personSchema = mongoose.Schema({
	Name:{
	type: String,
	required: true
	},
	Image:{
	type: String
	},
	Body:{
		type: String,
		required: true
	},
	Height:{
		type: Number,
		required: true
	},
	Weight:{
		type: Number,
		required: true
	},
	Country:{
		type: String,
		required: true
	},
	City:{
		type: String,
		required: true
	},
	MentalStatus:{
		type: String,
		required: true
	},
	SkinColor:{
		type: String,
		required: true
	},
	EyeColor:{
		type: String,
		required: true
	},
	Hair:{
		type: String,
		required: true
	},
	DateOfMissing: {
		type: Date,
		required: true
	},
	Gender:{
		type: String,
		required: true
	},
	CurrentStatus:{
		type: String,
		required: true
	},
	Description:{
		type: String,
		required: true
	},
	Author:{
		type:String,
		required: true
	},
	body:{
		type: String
	},
	Age:{
		type: Number,
		required:true
	}
});

let Person = module.exports = mongoose.model('Person',personSchema);