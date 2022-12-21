const express = require('express');
const router = express.Router();
const Group = require('../models/group');
const User = require('../models/user')
const passport = require('passport');
const mongoose = require('mongoose');

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(MONGO_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

//find groups by group name
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Group.find({})
    .then(group => {
        res.json({ group: group });
    })
    .catch(err => {
        res.json({ message: 'Error occured... Please try again.'})
    });
});


//find all groups
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    // Purpose: Fetch one example from DB and return
    console.log('=====> Inside GET /examples/:id');
    Group.find({})
    .then(group => {
        res.json({ group: group });
    })
    .catch(err => {
        console.log('Error in example#show:', err);
        res.json({ message: 'Error occured... Please try again.'})
    });
});

//user can create a group

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Group.create({
        groupName: req.body.groupName,
        description: req.body.description
    })
    .then(group => {
        console.log('New group =>>', group);
        console.log(req)
        res.header("Authorization", req.headers["Authorization"])
        res.redirect("/group");
    })
    .catch(error => { 
        console.log('error', error) 
        res.json({ message: "Error ocurred, please try again" })
    });
});

//user can edit the group
router.put('/:groupName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Group.findOneAndUpdate(req.params.groupName, req.body, { new: true })
    .then(updatedExample => {
        console.log('Example updated', updatedExample);
        res.redirect(`/group/${req.params.groupName}`);
    })
    .catch(err => {
        console.log('Error in example#update:', err);
        res.json({ message: 'Error occured... Please try again.'});
    });
});

//user can delete a group
router.delete('/:id',passport.authenticate('jwt', { session: false }), (req, res) => {
    Group.findByIdAndDelete(req.params.id)
    .then(response => {
        console.log(`Group ${req.params.id} was deleted`, response);
        res.header("Authorization", req.headers["Authorization"])
        res.redirect("/group");
    })
    .catch(err => {
        console.log('Error in example#delete:', err);
        res.json({ message: 'Error occured... Please try again.'});
    });
});

module.exports = router;