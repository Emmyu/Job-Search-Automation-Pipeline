"use strict";

const { createApp } = require("./dist/app.js");

let app;

module.exports = (req, res) => {
  if (!app) app = createApp();
  return app(req, res);
};
