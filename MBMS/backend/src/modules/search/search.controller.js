// src/modules/search/search.controller.js
const searchService = require('./search.service');

async function handleSearch(req, res, next) {
  try {
    const queryText = req.query.q;
    const userId = req.user.id; // Populated by your auth middleware

    const results = await searchService.executeGlobalSearch(userId, queryText);
    
    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    next(error); // Pass to your global error handling middleware
  }
}

module.exports = {
  handleSearch,
};