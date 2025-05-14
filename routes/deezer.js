const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/search', async (req, res) => {
  const query = req.query.q;
  const filter = req.query.filter || 'track';

  const endpoints = {
    track: 'https://api.deezer.com/search',
    artist: 'https://api.deezer.com/search/artist',
    album: 'https://api.deezer.com/search/album'
  };

  try {
    const response = await axios.get(endpoints[filter], {
      params: { q: query }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Deezer', details: err.message });
  }
});

module.exports = router;

