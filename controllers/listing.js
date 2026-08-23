const Listing = require("../models/listing");
const User = require("../models/user");

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";

module.exports.index = async (req, res) => {
  let { category, q } = req.query;
  let query = {};

  // Category filter
  if (category && category.trim() !== "") {
    query.category = category.trim();
  }

  // Global search (title, location, country, or max price)
  if (q && q.trim() !== "") {
    const searchTerm = q.trim();
    if (!isNaN(searchTerm)) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
        { country: { $regex: searchTerm, $options: "i" } },
        { price: { $lte: Number(searchTerm) } },
      ];
    } else {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
        { country: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
      ];
    }
  }

  const allListing = await Listing.find(query).populate("owner");

  res.render("listings/index.ejs", {
    allListing,
    category: category || "",
    searchQuery: q || "",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let listingData = req.body.listing;
  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  } else {
    newListing.image = {
      url: DEFAULT_IMAGE_URL,
      filename: "default_listing_image",
    };
  }

  await newListing.save();
  req.flash("success", "New Listing Created Successfully!");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = (listing.image && listing.image.url) ? listing.image.url : DEFAULT_IMAGE_URL;

  if (originalImageUrl.includes("res.cloudinary.com")) {
    originalImageUrl = originalImageUrl.replace(
      "/upload/",
      "/upload/w_300,h_200,c_fill/"
    );
  } else if (originalImageUrl.includes("unsplash.com")) {
    originalImageUrl = originalImageUrl.replace(/w=\d+/, "w=300");
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you requested does not exist!");
    return res.redirect("/listings");
  }

  Object.assign(listing, req.body.listing);

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await listing.save();
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    req.flash("error", "Listing not found or already deleted!");
    return res.redirect("/listings");
  }

  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};

module.exports.toggleFavourite = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }

  user.favourites = user.favourites || [];
  const isFav = user.favourites.some((fav) => fav.equals(id));

  if (isFav) {
    user.favourites.pull(id);
    req.flash("success", "Removed from your favourites");
  } else {
    user.favourites.push(id);
    req.flash("success", "Added to your favourites ❤️");
  }

  await user.save();

  // If request came with a referer or redirect query, redirect there
  const referer = req.get("Referrer");
  if (referer && !referer.includes("/favourite")) {
    return res.redirect(referer);
  }
  res.redirect(`/listings/${id}`);
};

module.exports.showFavourites = async (req, res) => {
  const user = await User.findById(req.user._id).populate("favourites");
  res.render("listings/favourites.ejs", {
    allListing: (user && user.favourites) ? user.favourites : [],
  });
};