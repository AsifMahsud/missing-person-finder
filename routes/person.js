const express = require('express');
const router = express.Router();
const path = require('path');
const multer=require('multer');
const { check, validationResult } = require('express-validator');

// Bring in User Model
let User = require("../models/user");
// Bring in Person Model
let Person = require("../models/person");

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/missing/',
  filename: function(req, file, cb){
    cb('',file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 5000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('file');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb('',true);
  } else {
    cb('Error: Images Only!');
  }
}

// Add Missing Person Route
router.get('/add/missing/', ensureAuthenticated, function(req, res){
	res.render('add_missing_person',{
		
	});
});

// Add Missing Person Process
router.post('/missing/:id', upload, ensureAuthenticated, [
	check('name', 'Name is required').notEmpty(),
	check('age', 'age is required').notEmpty(),
	check('weight', 'Weight is required').notEmpty(),
	check('country', 'Country is required').notEmpty(),
	check('city', 'City is required').notEmpty(),
	check('dateOfMissing', 'Date of Missing is required').notEmpty(),
	check('description', 'Description is required').notEmpty()
	], function(req, res){
		if(req.file === undefined){
        	req.file= "noImage";
        	req.file.filename= "noImage";
        }
	const name = req.body.name;
	const age = req.body.age;
	const weight= req.body.weight;
	const country = req.body.country;
	const city = req.body.city;
	const dateOfMissing = req.body.dateOfMissing;
	const file= req.file.filename;
	const gender=req.body.gender;
	const mentalStatus=req.body.mentalStatus;
	const skinColor=req.body.skinColor;
	const eyeColor=req.body.eyeColor;
	const hair=req.body.hair;
	const currentStatus=req.body.currentStatus;
	const body= req.body.body;
	const height=req.body.height;
	const description=req.body.description;

	const errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('add_missing_person', {
			errors:errors.array(),
			user:req.user
		});
	} else{
		let newPerson = new Person({
			Name: name,
			Image: file,
			Body: body,
			Age: age,
			Height: height,
			Weight: weight,
			Country: country,
			City: city,
			MentalStatus: mentalStatus,
			SkinColor: skinColor,
			EyeColor: eyeColor,
			Hair: hair,
			DateOfMissing: dateOfMissing,
			Gender: gender,
			CurrentStatus: currentStatus,
			Description: description,
			Author: req.user._id
		});
	let query = {_id:req.params.id};
	let userUpdate = {};
	userUpdate.MissingPerson = req.user.MissingPerson + 1;
	User.update(query, userUpdate, function(err){
		if(err){
			console.log(err);
			return;
		} 
	});
	newPerson.save(function(err){
		if(err){
			console.log(err);
			return;
		} else {
			req.flash('success','Missing Person Added');
			res.redirect('/');
		}
	});
}
});

// Edit Missing Person1
router.get('/edit/missing/:id', ensureAuthenticated, function(req, res){
	Person.find({"Author":req.params.id},(err,person)=>{
		if(err){
			console.log(err);
		}
		else{
			res.render('edit_person1',{
				person: person,
				user: req.user
			});
		}
  });
});

// Load Individual Person Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
	Person.findById(req.params.id, function(err, person){
	res.render('edit_person2',{
		person:person,
		title: "Edit Person"
		});
	});
});

// Update Missing Person Process
router.post('/edit/:id', upload, ensureAuthenticated, [
	check('name', 'Name is required').notEmpty(),
	check('age', 'age is required').notEmpty(),
	check('weight', 'Weight is required').notEmpty(),
	check('country', 'Country is required').notEmpty(),
	check('city', 'City is required').notEmpty(),
	check('description', 'Description is required').notEmpty()
	], function(req, res){
		var file;
		if(req.body.fileCheck != '' && req.file === undefined){
		 	file = path.basename(req.body.fileCheck);
		 }else if(req.file === undefined){
        	file= "noImage";
        }
        else{
        	file=req.file.filename
        }
	const name = req.body.name;
	const age = req.body.age;
	const weight= req.body.weight;
	const country = req.body.country;
	const city = req.body.city;
	const file1= file;
	const gender=req.body.gender;
	const mentalStatus=req.body.mentalStatus;
	const skinColor=req.body.skinColor;
	const eyeColor=req.body.eyeColor;
	const hair=req.body.hair;
	const currentStatus=req.body.currentStatus;
	const body= req.body.body;
	const height=req.body.height;
	const description=req.body.description;

	const errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('edit_person2', {
			errors:errors.array(),
			user:req.user
		});
	} else{
		let updatePerson = {};
			updatePerson.Name= name;
			updatePerson.Image= file1;
			updatePerson.Body= body;
			updatePerson.Age= age;
			updatePerson.Height= height;
			updatePerson.Weight= weight;
			updatePerson.Country= country;
			updatePerson.City= city;
			updatePerson.MentalStatus= mentalStatus;
			updatePerson.SkinColor= skinColor;
			updatePerson.EyeColor= eyeColor;
			updatePerson.Hair= hair;
			updatePerson.Gender= gender;
			updatePerson.CurrentStatus= currentStatus;
			updatePerson.Description= description;

	let query = {_id:req.params.id};
	Person.update(query, updatePerson, function(err){
		if(err){
			console.log(err);
			return;
		} 
	else {
			req.flash('success','Missing Person Updated');
			res.redirect('/person/edit/missing/'+req.user._id);
		}
	});
}
});

// Investigate Page Route
router.get('/:id',ensureAuthenticated, function(req, res){
	Person.findById(req.params.id, function(err, person){
		User.findById(person.Author, function(err, user1){
			res.render('investigate.pug',{
			person: person,
			user1: user1
			});
		});
	});
});

// Person Search Route
router.post('/person_search',ensureAuthenticated, function(req, res){
////////////
	if(req.body.name != ''){
	if(req.body.gender == "gender" && req.body.country == ''){
			Person.find({"Name":{ $regex: new RegExp("^" + req.body.name, "i") }},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
		}
	}
	else if(req.body.country != ''){
		if(req.body.name == '' && req.body.gender == "gender"){
			Person.find({"Country":{ $regex: new RegExp("^" + req.body.country, "i") }},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
		}
	}
	else if(req.body.gender != "gender"){
		if(req.body.name == '' && req.body.country == ''){
			Person.find({"Gender":{ $regex: new RegExp("^" + req.body.gender, "i") }},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
		}
	}
////////////
	if(req.body.name == ''){
		if(req.body.gender != "gender" && req.body.country != ''){
			Person.find({"Gender":{ $regex: new RegExp("^" + req.body.gender, "i")}, "Country":{ $regex: new RegExp("^" + req.body.country, "i") }},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
		}
	}
	else if(req.body.country == ''){
		if(req.body.name != '' && req.body.gender != "gender"){
			Person.find({"Gender":{ $regex: new RegExp("^" + req.body.gender, "i")}, "Name":{ $regex: new RegExp("^" + req.body.name, "i") }},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
		}
	}
	else if(req.body.gender == "gender"){
		if(req.body.name != '' && req.body.country != ''){
			Person.find({"Name":{ $regex: new RegExp("^" + req.body.name, "i")}, "Country":{ $regex: new RegExp("^" + req.body.country, "i") }},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
			}
	}
/////////////
	if(req.body.gender == "gender" && req.body.name == '' && req.body.country ==''){
		Person.find({},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
	}
	else{
		Person.find({"Gender":{ $regex: new RegExp("^" + req.body.gender, "i")}, "Country":{ $regex: new RegExp("^" + req.body.country, "i") }, "Name":{ $regex: new RegExp("^" + req.body.name, "i") }},(err,person)=>{
				if(err){
					console.log(err);
				}
				else{
					res.render('person_search',{
						person: person
					});
				}
		  });
	}
	});

// Access Control
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('danger', 'Please login');
		res.redirect('/users/login');
	}
}

module.exports = router;