const mongoose = require('mongoose');
const { Schema } = mongoose;

const groupSchema = new Schema({
    groupName: String,
    description: String,
    date: {
        type: Date,
        default: Date.now()
    }

})

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
