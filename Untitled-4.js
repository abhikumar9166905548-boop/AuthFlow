const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
user:String,
videoUrl:String,
caption:String,
likes:[String]
});

module.exports = mongoose.model("Reel",reelSchema);