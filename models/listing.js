const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
 title:{
    type:String,
    required:true
 },
 description:{
    type:String,
 },
  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    filename: {
      type: String,
      default: "listingimage",
    },
  },
  price: {
    type: Number,
    min: 0,
    default: 0,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "Beach",
      "Mountains",
      "Camping",
      "City",
      "Pool",
      "Nature",
      "Heritage",
      "Islands",
    ],
    default: "Trending",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete" , async(listing) =>{
   if(listing){
      await Review.deleteMany({_id: {$in:listing.reviews}});
   }
})

const Listing = mongoose.model("Listing" , listingSchema);
module.exports = Listing;
