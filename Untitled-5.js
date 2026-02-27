const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
reelId:String,
user:String,
text:String
});

module.exports = mongoose.model("Comment",commentSchema);