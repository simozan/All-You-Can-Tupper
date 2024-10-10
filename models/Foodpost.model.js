const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const foodPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    foodImage: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
     expiringDate: {
      type: Date,  
      required: true,
    },
    pickUpTime: {
      type: String,
      required: true,
    },
    pickUpPlace: {
      type: String,
      required: true,
    },
    foodType: {
      type: String,
      enum: ["omnivore", "vegan", "vegetarian"]
    },
    alergies: {
      type: String,
      required: true,
    },
    creator: { type: Schema.Types.ObjectId, ref: "User" } ///Deleted mongoose. before Schema because it was giving error
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Foodpost = model("Foodpost", foodPostSchema);

module.exports = Foodpost;