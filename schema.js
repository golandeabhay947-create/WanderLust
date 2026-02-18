const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().min(0),
    location: joi.string().required(),
    country: joi.string().required(),
  }).required().unknown(true),   // 🔥 THIS LINE FIXES IT
});

module.exports.reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().required().min(1).max(5),
    comment: joi.string().required(),
  }).required(),
});
