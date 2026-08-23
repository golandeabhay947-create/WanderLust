const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi
    .object({
      title: joi.string().required().trim(),
      description: joi.string().required(),
      price: joi.number().min(0).required(),
      location: joi.string().required().trim(),
      country: joi.string().required().trim(),
      category: joi
        .string()
        .valid(
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
        )
        .default("Trending"),
      image: joi.string().allow("", null),
    })
    .required()
    .unknown(true),
});

module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      comment: joi.string().required().trim(),
    })
    .required(),
});
