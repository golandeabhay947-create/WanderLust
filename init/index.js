if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB successfully for initialization");
}

const initDB = async () => {
  try {
    await main();

    // Find or create a default owner
    let defaultUser = await User.findOne({ username: "wanderer" });
    if (!defaultUser) {
      defaultUser = await User.findOne({});
    }

    if (!defaultUser) {
      const newUser = new User({
        email: "wanderer@wanderlust.com",
        username: "wanderer",
      });
      defaultUser = await User.register(newUser, "wanderlust123");
      console.log("Created default demo user: 'wanderer'");
    }

    await Listing.deleteMany({});
    const listingsWithOwner = initData.data.map((obj) => ({
      ...obj,
      owner: defaultUser._id,
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log(`Successfully initialized ${listingsWithOwner.length} listings in DB`);
  } catch (err) {
    console.error("Error during database initialization:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

initDB();
