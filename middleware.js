const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema}= require("./schema.js");
const Review = require("./models/review");



module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "To add Listing you must be logged in !!");
     return res.redirect("/login")
  }
  next();
}

module.exports.saveRedirectUrl = (req,res,next) =>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner =  async (req,res,next) =>{
  let {id} = req.params;
let listing =  await Listing.findById(id);

if(!listing.owner._id.equals(res.locals.currUser._id)){
  req.flash("error", "You don't have permission to edit listing");
     return res.redirect(`/listings/${id}`);

}
next();
};

module.exports.validateListing = (req,res,next) =>{
 let {error} = listingSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
 throw new ExpressError(400,errMsg);
    }else{
      next();
    }
};

module.exports.validateReview= (req,res,next) =>{
 let {error} = reviewSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
 throw new ExpressError(400,errMsg);
    }else{
      next();
    }
};



module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect("back");
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not allowed to do that");
    return res.redirect("back");
  }

  next();
};
