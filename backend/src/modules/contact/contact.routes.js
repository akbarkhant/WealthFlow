// routes/contact.routes.js
const { Router } = require("express");
const contactController = require("./contact.controller.js");

const router = Router();

// POST /api/contact - Matches client utility calls: api.post("/contact", form)
router.post("/", contactController.submitContact);

module.exports = router