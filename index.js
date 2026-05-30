"use strict";

/** Vercel may invoke a root index handler for GET / — delegate to the Express app. */
module.exports = require("./api/app.js");
