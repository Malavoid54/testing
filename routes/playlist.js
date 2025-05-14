const express = require('express');
const router = express.Router();
const db = require('../database');
const database = require('../database');

// Create playlist
router.post('/', async (req, res) => {
  const { userId, name, tags, pinned } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ message: "User ID and Name are required" });
  }

  try {
    await db.query(
      'INSERT INTO Playlists (UserID, Name, Tags, Pinned) VALUES (?, ?, ?, ?)',
      [userId, name, JSON.stringify(tags || []), pinned ? 1 : 0]
    );
    res.status(201).json({ message: "Playlist created successfully" });
  } catch (err) {
    console.error("Playlist creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Edit playlist
router.put('/:playlistId', async (req, res) => {
    const { name, tags, pinned } = req.body;
    const { playlistId } = req.params;

    try {
      const fields = [];
      const values = [];

      if (typeof name !== 'undefined') {
        fields.push("Name = ?");
        values.push(name);
      }
      if (typeof tags !== 'undefined') {
        fields.push("Tags = ?");
        values.push(JSON.stringify(tags));
      }
      if (typeof pinned !== 'undefined') {
        fields.push("Pinned = ?");
        values.push(pinned ? 1 : 0);
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update." });
      }

      values.push(playlistId);

      const query = `UPDATE Playlists SET ${fields.join(', ')} WHERE PlaylistID = ?`;
      await db.query(query, values);

      res.json({ success: true });
    } catch (err) {
      console.error("❌ Playlist update failed:", err);
      res.status(500).json({ error: err.message });
    }
  });


// Delete playlist
router.delete('/:playlistId', async (req, res) => {
  const { playlistId } = req.params;
  try {
    await db.query('DELETE FROM Playlists WHERE PlaylistID = ?', [playlistId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all playlists for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM Playlists WHERE UserID = ? ORDER BY Pinned DESC, Name ASC',
      [userId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a track into a playlist
router.post('/:playlistId/tracks', async (req, res) => {
  const { playlistId } = req.params;
  const { trackId } = req.body;

  try {
    await db.query(
      'INSERT INTO PlaylistTracks (PlaylistID, TrackID) VALUES (?, ?)',
      [playlistId, trackId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new track (if needed) and link it to a playlist
router.post('/addTrack', async (req, res) => {
  const { playlistId, title, album, artist, duration, albumCover, previewUrl } = req.body;

    console.log("🚀 ADD TRACK BODY:", req.body); // ← ADD THIS
    try {
      // Check if the track already exists
      const [existing] = await db.query(
        'SELECT * FROM Tracks WHERE Title = ? AND Album = ?', [title, album]);

    let trackId;
    if (existing.length > 0) {
      trackId = existing[0].TrackID;
    } else {
      const [result] = await db.query(
        'INSERT INTO Tracks (Title, Album, Artist, Duration, AlbumCover, PreviewURL) VALUES (?, ?, ?, ?, ?, ?)',
        [title, album, artist, duration, albumCover, previewUrl]
      );
      trackId = result.insertId;
    }

    await db.query(
      'INSERT INTO PlaylistTracks (PlaylistID, TrackID) VALUES (?, ?)',
      [playlistId, trackId]
    );

      res.json({ success: true });
    } catch (err) {
      console.error("🔥 ADD TRACK ERROR:", err); // ← ADD THIS TOO
      res.status(500).json({ error: err.message });
    }
  });

// Get all tracks in a playlist
router.get('/:playlistId/tracks', async (req, res) => {
  const { playlistId } = req.params;
  try {
    const [results] = await db.query(
      `SELECT t.*, pt.DateAdded
       FROM Tracks t
       JOIN PlaylistTracks pt ON t.TrackID = pt.TrackID
       WHERE pt.PlaylistID = ?`,
      [playlistId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tagging API (optional advanced feature if you prefer normalized Tags table)
router.post('/:playlistId/tags', async (req, res) => {
  const { playlistId } = req.params;
  const { tagId } = req.body;

  try {
    await db.query(
      'INSERT INTO PlaylistTags (PlaylistID, TagID) VALUES (?, ?)',
      [playlistId, tagId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:playlistId/tags', async (req, res) => {
  const { playlistId } = req.params;
  try {
    const [results] = await db.query(
      `SELECT t.* FROM Tags t
       JOIN PlaylistTags pt ON t.TagID = pt.TagID
       WHERE pt.PlaylistID = ?`,
      [playlistId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:playlistId/tags/:tagId', async (req, res) => {
  const { playlistId, tagId } = req.params;
  try {
    await db.query(
      'DELETE FROM PlaylistTags WHERE PlaylistID = ? AND TagID = ?',
      [playlistId, tagId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
