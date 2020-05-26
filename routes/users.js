const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const passport = require('passport');
const path = require('path');
const multer=require('multer');

// Bring in User Model
let User = require('../models/user');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Register Form
router.get('/register',function(req, res){
	res.render('register');
});

// Register Process
router.post('/register', upload, [
	check('name', 'Name is required').notEmpty(),
	check('email', 'Email is required').notEmpty(),
	check('email', 'Email is not valid').isEmail(),
	check('username', 'Username is required').notEmpty(),
	check('password', 'Password is required').notEmpty(),
	check('password2', 'Passwords do not match').custom((value,{req, loc, path}) => {
            if (value !== req.body.password) {
                // trow error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
	], function(req, res){
		if(req.file == undefined){
        res.render('register', {
          Photoerror:"Please upload Profile Image"
        });
    }else{
	const name = req.body.name;
	const email = req.body.email;
	const contact= req.body.contact;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;
	const file= req.file.filename;

	const errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('register', {
			errors:errors.array()
		});
	} else{
		let newUser = new User({
			name:name,
			email:email,
			contact:contact,
			username:username,
			password:password,
			file: file,
			MissingPerson:0,
			FoundPerson:0,
			Articles:0
		});

bcrypt.genSalt(10, function(err,salt){
	bcrypt.hash(newUser.password, salt, function(err, hash){
		if(err){
			console.log(err);
		} else{
			newUser.password = hash;
			newUser.save(function(err){
				if(err){
					console.log(err);
				} else{
					req.flash('success', 'You are now registered and can log in');
					res.redirect('/users/login');
				}
			});
		}
	});
});
}
}
});

// Login Form
router.get('/login', function(req, res){
	res.render('login');
});
// Login Process
router.post('/login', function(req, res, next){
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// Logout
router.get('/logout', function(req, res){
	req.logout();
	req.flash('danger', 'You are logged out');
	res.redirect('/users/login');
});

// Profile
router.get('/profile', function(req, res){
	res.render('profile');
});

// Update User Profile Route
router.post('/profile/:id',ensureAuthenticated, upload, [
	check('name', 'Name is required').notEmpty(),
	check('email', 'Email is required').notEmpty(),
	check('email', 'Email is not valid').isEmail(),
	check('contact','Contact Number is required').notEmpty(),
	check('password', 'Password is required').notEmpty(),
	check('password2', 'Passwords do not match').custom((value,{req, loc, path}) => {
            if (value !== req.body.password) {
                // trow error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
	], function(req, res){
		if(req.file == undefined){
        res.render('profile', {
          Photoerror:"Please Re-upload Profile Image or Change the image",
          user:User
        });
    }else{
    	let userProfile={};
	userProfile.name = req.body.name;
	userProfile.email = req.body.email;
	userProfile.contact= req.body.contact;
	userProfile.password = req.body.password;
	userProfile.file= req.file.filename;

	const errors = validationResult(req);

	if(!errors.isEmpty()){
		res.render('profile', {
			errors:errors.array(),
			user:userProfile
		});
	} else{
		let query = {_id:req.params.id};

bcrypt.genSalt(10, function(err,salt){
	bcrypt.hash(userProfile.password, salt, function(err, hash){
		if(err){
			console.log(err);
		} else{
			userProfile.password = hash;
			User.update(query, userProfile, function(err){
				if(err){
					console.log(err);
				} else{
					req.flash('success', 'Profile Updated Successfully');
					res.redirect('/users/profile/');
					user:userProfile
				}
			});
		}
	});
});
}
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