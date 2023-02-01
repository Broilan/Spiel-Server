// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Spiel = require('../models/spiel');
const Group = require('../models/group');
const multer = require('multer');
const { JWT_SECRET } = process.env;


// DB Models
const User = require('../models/user');

const fileStorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  })

  const upload = multer({storage: fileStorageEngine})


// Controllers
router.get('/test', (req, res) => {
    res.json({ message: 'User endpoint OK! ✅' });
});

router.get('/:id', (req, res) => {
    // Purpose: Fetch one example from DB and return
    console.log('=====> Inside GET /users/:id');

    User.findById(req.params.id)
    .then(example => {
        res.json({ example: example });
    })
    .catch(err => {
        console.log('Error in user#show:', err);
        res.json({ message: 'Error occured... Please try again.'})
    });
});


router.get('/:id/spiels', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('route is being on PUT')
    User.findById( req.params.id )
        .then(FoundUser => {
            console.log('User found', FoundUser);
            Spiel.find({name: FoundUser.name})
            .then(FoundSpiel => {
                res.json({ Spiels: FoundSpiel });
                })
        })
        .catch(error => {
            console.log('error', error)
            res.json({ message: "Error ocurred, please try again" })
        })
});


router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('route is being on PUT')
    User.findById(req.params.id)
        .then(foundUser => {
            console.log('user found', foundUser);
            User.findByIdAndUpdate(req.params.id,
                {
                    name: req.body.name ? req.body.name : foundUser.name,
                    bio: req.body.bio ? req.body.bio : foundUser.bio,
                    email: req.body.email ? req.body.email : foundUser.email,
                })
                .then(User => {
                    console.log('User was updated, old info ---->', User);
                })
                .catch(error => {
                    console.log('error', error)
                    res.json({ message: "Error ocurred, please try again" })
                })
        })
        .catch(error => {
            console.log('error', error)
            res.json({ message: "Error ocurred, please try again" })
        })
});

router.put('/:id/group/:idx', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('route is being on PUT')
    User.findById(req.params.id)
    .then(foundUser => {
        const userGroups = foundUser.groups
        console.log("found user groups ==>", userGroups)
    
    Group.findById(req.params.idx)
        .then(foundGroup => {
            console.log('group found', foundGroup._id);
            const fGroup = String(foundGroup._id)
            userGroups.push(fGroup)
            console.log("groups added ===>", userGroups)
            User.findByIdAndUpdate(req.params.id,
                {
                    groups: userGroups
                })
                .then(User => {
                    res.json({User: User})
                    console.log('User was updated, old info ---->', User);
                })
                .catch(error => {
                    console.log('error', error)
                    res.json({ message: "Error ocurred, please try again" })
                })
        })
        .catch(error => {
            console.log('error', error)
            res.json({ message: "Error ocurred, please try again" })
        })})

});

router.put('/:id/spiels/:idx', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('route is being on PUT')
    User.findById(req.params.id)
    .then(foundUser => {
        const userSpiels = foundUser.spiels
        console.log("found user spiels ==>", userSpiels)
    
    Spiel.findById(req.params.idx)
        .then(foundSpiel => {
            console.log('spiel found', foundSpiel);
            const fGroup = String(foundSpiel._id)
            userSpiels.push(fGroup)
            console.log("spiels added ===>", userSpiels)
            User.findByIdAndUpdate(req.params.id,
                {
                    spiels: userSpiels
                })
                .then(User => {
                    res.json({User: User})
                    console.log('User was updated, old info ---->', User);
                })
                .catch(error => {
                    console.log('error', error)
                    res.json({ message: "Error ocurred, please try again" })
                })
        })
        .catch(error => {
            console.log('error', error)
            res.json({ message: "Error ocurred, please try again" })
        })})

});

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.find({})
    .then(user => {
        res.json({ user: user });
    })
    .catch(err => {
        res.json({ message: 'Error occured... Please try again.'})
    });
});

router.get('/:id/group', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('route is being on get')
    User.findById( req.params.id )
        .then(FoundUser => {
            console.log('User found', FoundUser);
            Group.find({_id: FoundUser.groups})
            .then(FoundGroup => {
                console.log("found groups", FoundGroup)
                res.json({ FoundGroup: FoundGroup });
                })
        })
        .catch(error => {
            console.log('error', error)
            res.json({ message: "Error ocurred, please try again" })
        })
});

router.post('/signup', (req, res) => {
    // POST - adding the new user to the database
    console.log('===> Inside of /signup');
    console.log('===> /register -> req.body',req.body);
    console.log(req.file)

    User.findOne({ email: req.body.email })
    .then(user => {
        // if email already exists, a user will come back
        if (user) {
            // send a 400 response
            return res.status(400).json({ message: 'Email already exists' });
        } else {
            // Create a new user
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                bio: "add a bio!",
                image: "pfp",
                password: req.body.password,
                spiels: [],
                groups: []
            });

            // Salt and hash the password - before saving the user
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw Error;

                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) console.log('==> Error inside of hash', err);
                    // Change the password in newUser to the hash
                    newUser.password = hash;
                    newUser.save()
                    .then(createdUser => res.json({ user: createdUser}))
                    .catch(err => {
                        console.log('error with creating new user', err);
                        res.json({ message: 'Error occured... Please try again.'});
                    });
                });
            });
        }
    })
    .catch(err => { 
        console.log('Error finding user', err);
        res.json({ message: 'Error occured... Please try again.'})
    })
});



router.post('/login', async (req, res) => {
    // POST - finding a user and returning the user
    console.log('===> Inside of /login');
    console.log('===> /login -> req.body', req.body);

    const foundUser = await User.findOne({ email: req.body.email });

    if (foundUser) {
        // user is in the DB
        let isMatch = await bcrypt.compare(req.body.password, foundUser.password);
        console.log('Does the passwords match?', isMatch);
        if (isMatch) {
            // if user match, then we want to send a JSON Web Token
            // Create a token payload
            // add an expiredToken = Date.now()
            // save the user
            const payload = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name
            }

            jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) {
                    res.status(400).json({ message: 'Session has endedd, please log in again'});
                }
                const legit = jwt.verify(token, JWT_SECRET, { expiresIn: 60 });
                console.log('===> legit', legit);
                res.json({ success: true, token: `Bearer ${token}`, userData: legit });
            });

        } else {
            return res.status(400).json({ message: 'Email or Password is incorrect' });
        }
    } else {
        return res.status(400).json({ message: 'User not found' });
    }
});

// private
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('====> inside /profile');
    console.log(req.body);
    console.log('====> user')
    console.log(req.user);
    const { id, name, bio, email, image } = req.user; // object with user object inside
    res.json({ id, name, email, bio, image });
});

router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('route is being on PUT')
    User.findById(req.params.id)
        .then(foundUser => {
            console.log('user found', foundUser);
            User.findByIdAndUpdate(req.params.id,
                {
                    name: req.body.name ? req.body.name : foundUser.name,
                    bio: req.body.bio ? req.body.bio : foundUser.bio,
                    email: req.body.email ? req.body.email : foundUser.email,
                })
                .then(User => {
                    console.log('User was updated, old info ---->', User);
                })
                .catch(error => {
                    console.log('error', error)
                    res.json({ message: "Error ocurred, please try again" })
                })
        })
        .catch(error => {
            console.log('error', error)
            res.json({ message: "Error ocurred, please try again" })
        })

});

//change your pfp
router.put('/:id', upload.single('image'),passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('route is being on xyz')
    console.log(req.file)

    User.findById(req.params.id)
        .then(foundUser => {
            console.log('user found', foundUser);
            User.findByIdAndUpdate(req.params.id,
                {
                    name: req.body.name ? req.body.name : foundUser.name,
                    email: req.body.email ? req.body.email : foundUser.email,
                    password: req.body.password ? req.body.password : foundUser.password,
                    image: req.file.filename ? req.file.filename : foundUser.image,
                })
                .then(post => {
                    console.log('Post was updated', post);
                    res.header("Authorization", req.headers["Authorization"])
                    res.redirect(`/users/:id/profile`)
                })
                .catch(error => {
                    console.log('error', error)
                    res.json({ message: "Error ocurred, please try again" })
                })
        })
        .catch(error => {
            console.log('error', error)
            res.json({ message: "Error ocurred, please try again" })
        })

});



router.get('/messages', passport.authenticate('jwt', { session: false }), async (req, res) => {
    console.log('====> inside /messages');
    console.log(req.body);
    console.log('====> user')
    console.log(req.user);
    const { id, name, email } = req.user; // object with user object inside
    const messageArray = ['message 1', 'message 2', 'message 3', 'message 4', 'message 5', 'message 6', 'message 7', 'message 8', 'message 9'];
    const sameUser = await User.findById(id);
    res.json({ id, name, email, message: messageArray, sameUser });
});

// Exports
module.exports = router;