"use strict";

const { createApp } = require("../dist/app.js");

const app = createApp();

module.exports = (req, res) => app(req, res);
