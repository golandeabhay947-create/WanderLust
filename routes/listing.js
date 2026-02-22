const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const Listing =require("../models/listing.js");
const{isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })



// index and create route 


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
  validateListing,
  isLoggedIn,
  upload.single('listing[image]'),
  wrapAsync(listingController.createListing)
);
  



// new route
router.get("/new", isLoggedIn , listingController.renderNewForm);

// favourit elisting

router.get("/favourites", isLoggedIn, wrapAsync(listingController.showFavourites));

router.post("/:id/favourite", isLoggedIn, wrapAsync(listingController.toggleFavourite));

// edit route
router.get("/:id/edit" ,isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing));




//  show ,  update and delete

router
     .route("/:id")
     .get(wrapAsync(listingController.showListing))
      .put(
  validateListing,
  isLoggedIn,
  isOwner,
    upload.single('listing[image]'),
   wrapAsync(listingController.updateListing))
   .delete(isLoggedIn, isOwner,wrapAsync( listingController.deleteListing));


module.exports = router;