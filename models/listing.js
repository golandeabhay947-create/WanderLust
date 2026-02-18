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
 image:{
   url: {
        type: String,
 },
    filename: {
        type: String
    },
   },
 price:{
    type:Number,
 },
 location:{
    type:String,
 },
 country:{
    type:String,
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
    "Islands"
  ],
  required: true
},

 reviews:[
   {
   type:Schema.Types.ObjectId,
   ref:"Review"
   },
],
owner:{
   type:Schema.Types.ObjectId,
   ref:"User",
}
});

listingSchema.post("findOneAndDelete" , async(listing) =>{
   if(listing){
      await Review.deleteMany({_id: {$in:listing.reviews}});
   }
})

const Listing = mongoose.model("Listing" , listingSchema);
module.exports = Listing;
