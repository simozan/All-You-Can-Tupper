const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    userlocation: {
      type: String,
      required: true,
    },
    foodPosts: [{ type: Schema.Types.ObjectId, ref: "Foodpost" }],
    // Put-->update user con bio profile pic
    //REMEMBER TO ADD FOODREQUIRED HEREEEE
    bio: {
      type: String,
      default: " ",
    },
    profilePicture: {
      type: String,
      default: "https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-2048x1949-pq9uiebg.png",
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
