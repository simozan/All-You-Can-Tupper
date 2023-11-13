const express = require('express');
const isLoggedIn = require('../middleware/isLoggedIn');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  let data = {
    layout: false
  }
  res.render("index", data);
});

module.exports = router;
