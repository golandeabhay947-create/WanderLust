if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.create ? connectMongo : connectMongo.default;

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routes
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

// ============================
// Database
// ============================
const dbURL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

mongoose
  .connect(dbURL)
  .then(() => console.log("Connected to DB successfully"))
  .catch((err) => console.log("DB Connection Error:", err));

// ============================
// App Config
// ============================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ============================
// Middlewares
// ============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ============================
// Session & Flash
// ============================
const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET || "thisshouldbeabettersecret!",
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ============================
// Passport
// ============================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ============================
// res.locals
// ============================
app.use(async (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.q = req.query.q || "";

  if (req.user) {
    try {
      const user = await User.findById(req.user._id).populate("favourites");
      res.locals.currUser = user || req.user;
    } catch (e) {
      res.locals.currUser = req.user;
    }
  } else {
    res.locals.currUser = null;
  }

  next();
});

// ============================
// Routes
// ============================
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// ============================
// Home
// ============================
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ============================
// Legal Pages
// ============================
app.get("/terms", (req, res) => {
  res.render("legal/term");
});

app.get("/privacy", (req, res) => {
  res.render("legal/privacy");
});

// ============================
// Error Handling
// ============================

// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Export app for Vercel/serverless
module.exports = app;

// Only listen when run locally; serverless platforms import the app above.
if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  app.listen(port, () => {
    console.log(`WanderLust server is listening on port ${port}`);
  });
}

