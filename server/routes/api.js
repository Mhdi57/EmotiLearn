const express = require('express');
const router = express.Router();
const History = require('../models/History');

// GET /api/history - Retrieve all history records, sorted by date descending
router.get('/history', async (req, res) => {
  try {
    const history = await History.find().sort({ date: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/history - Create a new history record
router.post('/history', async (req, res) => {
  try {
    const { id, childName, emotion, success, starsEarned, date } = req.body;
    
    // Basic validation
    if (!id || !childName || !emotion || success === undefined || starsEarned === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newHistory = new History({
      id,
      childName,
      emotion,
      success,
      starsEarned,
      date: date || new Date()
    });

    const savedHistory = await newHistory.save();
    res.status(201).json(savedHistory);
  } catch (error) {
    console.error('Error saving history:', error);
    // If it's a duplicate ID, return a more specific error or just return ok since it might be a retry
    if (error.code === 11000) {
       return res.status(409).json({ error: 'History record already exists' });
    }
    res.status(500).json({ error: 'Failed to save history' });
  }
});

// DELETE /api/history/clear - Clear all history (useful for testing or reset)
router.delete('/history/clear', async (req, res) => {
    try {
        await History.deleteMany({});
        res.json({ message: 'History cleared' });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ error: 'Failed to clear history' });
    }
});

module.exports = router;
