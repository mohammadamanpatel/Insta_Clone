const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.set('strictQuery', false) 
// maanlo conn nhi hua to ye fn use ignore kardega aur error nhi aa paayega

const DBConnection = async () => {
    try {
        const { connection } = await mongoose.connect(
           // Mongo_String
        );
        if (connection) {
            console.log('yes DB is connected', connection.host);
        }
    }
    catch (e) {
        console.log(e);
        process.exit(1)
    }
}
DBConnection()
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  picture: {
    type: String,
    default: "def.png"
  },
  contact: String,
  bio: String,
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story" 
    }
  ],
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post" 
    }
  ],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post" 
  }],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user" 
    } 
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user" 
    }
  ]
})

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
