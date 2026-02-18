const Listing = require("../models/listing");



module.exports.index = async (req, res) => {
  let { category, q } = req.query;

  let query = {};

  // ✅ Category filter
  if (category) {
    query.category = category;
  }

  // ✅ Global search
  if (q) {
    let searchQuery;

    if (!isNaN(q)) {
      // If user typed number → include price filter
      searchQuery = {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { location: { $regex: q, $options: "i" } },
          { price: { $lte: Number(q) } }
        ]
      };
    } else {
      searchQuery = {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { location: { $regex: q, $options: "i" } }
        ]
      };
    }

    // Merge category + search
    query = { ...query, ...searchQuery };
  }

  const allListing = await Listing.find(query);

  res.render("listings/index.ejs", { 
    allListing, 
    category 
  });
};




module.exports.renderNewForm = (req,res) =>{
 res.render("listings/new.ejs")
};

module.exports.showListing = async (req,res) =>{
 let {id} = req.params;
 const listing = await Listing.findById(id).populate({path:"reviews" , populate:{path:"author"}}).populate("owner");
  if(!listing){
  req.flash("error","Listing does not exist");
  return res.redirect("/listings");
  }
 res.render("listings/show.ejs",{listing});
};


module.exports.createListing = async(req,res,next) =>{
 let url = req.file.path;
 let filename = req.file.filename;
  let listing = req.body.listing;
 const newListing = new Listing(listing);
 newListing.owner = req.user._id;
 newListing.image = {url,filename};
  await newListing.save();
  req.flash("success","New Listing Created!");
  res.redirect("/listings");
};

module.exports.editListing =  async(req,res) =>{
 let {id} = req.params;
 const listing = await Listing.findById(id);
  if(!listing){
  req.flash("error","Listing does not exist");
  return res.redirect("/listings");
  }
 let originalImageUrl = listing.image.url;

if (originalImageUrl.includes("res.cloudinary.com")) {
  originalImageUrl = originalImageUrl.replace(
    "/upload/",
    "/upload/w_250,h_300,c_fill/"
  );
} 
else if (originalImageUrl.includes("unsplash.com")) {
  originalImageUrl = originalImageUrl.replace(/w=\d+/, "w=250");
}

 res.render("listings/edit.ejs",{listing , originalImageUrl});
};

module.exports.updateListing = async (req,res) =>{
  let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing });

  if(typeof req.file !== "undefined"){
let url = req.file.path;
 let filename = req.file.filename;
 listing.image = {url , filename};
 await listing.save();
  }
  
    req.flash("success","Listing updated Successfully!");

  res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req,res) =>{
  let {id} = req.params;
  await Listing.findByIdAndDelete(id);
    req.flash("success"," Listing Deleted!");

  res.redirect("/listings");
};