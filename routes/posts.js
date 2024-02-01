const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    picture: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    caption: String,
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    comments: {
        type: Array,
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    },
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
})
module.exports = mongoose.model("post", postSchema);