const express = require('express');
const router = express.Router();
const Spiel = require('../models/spiel');
const Group = require('../models/group');
const passport = require('passport');
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(MONGO_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;


router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Spiel.find({})
    .then(spiel => {
        res.json({ spiel: spiel });
    })
    .catch(err => {
        res.json({ message: 'Error occured... Please try again.'})
    });
});

router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Spiel.find({_id: req.params.id})
    .then(spiel => {
        res.json({ spiel: spiel });
    })
    .catch(err => {
        res.json({ message: 'Error occured... Please try again.'})
    });
});



router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Spiel.create({
        name: req.body.name,
        group: req.body.group,
        message: req.body.message
    })
    .then(spiel => {
        console.log('New spiel =>>', spiel);
        res.json({spielID: spiel._id})
    })
    .catch(error => { 
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" })
    });
});




// Update one post (by title) route
router.put('/:id', (req, res) => {
    console.log('route is being on PUT')
    Spiel.findById(req.params.id)
        .then(foundSpiel => {
            console.log('Post found', foundSpiel);
            Spiel.findByIdAndUpdate(req.params.id,
                {
                    group: req.body.group ? req.body.group : foundSpiel.group,
                    message: req.body.message ? req.body.message : foundSpiel.message,
                })
                .then(post => {
                    console.log('Post was updated', post);
                    res.redirect(`/spiel`)
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

router.delete('/:id',passport.authenticate('jwt', { session: false }), (req, res) => {
    // Purpose: Update one example in the DB, and return
    console.log('=====> Inside DELETE /examples/:id');
    console.log('=====> req.params');
    console.log(req.params); // object used for finding example by id
    
    Spiel.findByIdAndDelete(req.params.id)
    .then(response => {
        console.log(`Spiel ${req.params.id} was deleted`, response);
        Spiel.find({})
        .then(spiel => {
            res.json({ spiel: spiel });
        })
        .catch(err => {
            res.json({ message: 'Error occured... Please try again.'})
        });
    })
    .catch(err => {
        console.log('Error in example#delete:', err);
        res.json({ message: 'Error occured... Please try again.'});
    });
});

module.exports = router;