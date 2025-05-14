var express = require('express');
var database = require('../database');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/app', function (req, res, next) {
  res.redirect('/index.html');
});

router.get('/login', function (req, res, next) {
  res.redirect('/login.html');
});

router.get('/signup', function (req, res, next) {
  res.redirect('/signup.html');
});

// Route to get database
router.get('/database', async function (req, res, next) {
  try {
    const [rows] = await database.query('SELECT * FROM Users');
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Database Page</title>
        <style>
          body { margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: gray; }
        </style>
      </head>
      <body>
        <h1>List of users</h1>
        <table>
          <thead>
            <tr>
              <th>UserID</th>
              <th>Username</th>
              <th>Password</th>
              <th>CreationDate</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const row of rows) {
      html += `
        <tr>
          <td>${row.UserID}</td>
          <td>${row.Username}</td>
          <td>${row.Password}</td>
          <td>${row.CreationDate}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
        <h2>Add User</h2>
        <form action="/add-user" method="POST">
          <input type="text" name="Username" placeholder="Username" required><br>
          <input type="text" name="Password" placeholder="Password" required><br>
          <input type="submit" value="Add User">
        </form>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    next(err);
  }
});

router.post('/add-user', async function (req, res, next) {
  try {
    const { Username, Password } = req.body;
    await database.query('INSERT INTO Users (Username, Password) VALUES (?, ?)', [Username, Password]);
    res.json(true);
  } catch (err) {
    next(err);
  }
});

router.get('/search-user', async function (req, res, next) {
  try {
    const { Username } = req.query;
    const [rows] = await database.query('SELECT * FROM Users WHERE Username = ?', [Username]);
    if (rows.length === 0) {
      // If user doesnt exist, return false
      res.json(false);
    } else {
      // If user exists, return true
      res.json(true);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/search-userpw', async function (req, res, next) {
  try {
    const { Username, Password } = req.query;
    const [rows] = await database.query('SELECT Password FROM Users WHERE Username = ?', [Username]);
    if (rows.length > 0 && rows[0].Password === Password) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/get-user', async function (req, res, next) {
  try {
    const { Username } = req.query;
    const [rows] = await database.query('SELECT * FROM Users WHERE BINARY Username = ?', [Username]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    next(err);
  }
});

router.get('/playlistDB', async function (req, res, next) {
  try {
    const { PLID } = req.query;
    const [pl] = await database.query('SELECT * FROM Playlists');
    const [tracks] = await database.query(`
      SELECT pt.PlaylistID, pt.TrackID, t.Title, t.Artist, t.Album, pt.DateAdded
      FROM PlaylistTracks pt
      JOIN Tracks t ON pt.TrackID = t.TrackID
      WHERE pt.PlaylistID = ?`, [PLID]);
    let html = `
    <!DOCTYPE html>
      <html>
      <head>
        <title>Playlist Database</title>
        <style>
          body { margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: gray; }
        </style>
      </head>
      <body>
        <h1>List of users</h1>
        <table>
          <thead>
            <tr>
              <th>PlaylistID</th>
              <th>UserID</th>
              <th>Name</th>
              <th>Tags</th>
              <th>Pinned</th>
              <th>DateCreated</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const row of pl) {
      html += `
        <tr>
          <td>${row.PlaylistID}</td>
          <td>${row.UserID}</td>
          <td>${row.Name}</td>
          <td>${row.Tags}</td>
          <td>${row.Pinned}</td>
          <td>${row.DateCreated}</td>
        </tr>
      `;
    }

    html += `
          </tbody>
        </table>
        <h2>Playlist Tracks</h2>
    `;
      html += `
        <table>
          <thead>
            <tr>
              <th>PlaylistID</th>
              <th>TrackID</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              <th>DateAdded</th>
            </tr>
          </thead>
          <tbody>
      `;
      for (const row of tracks) {
      html += `
        <tr>
          <td>${row.PlaylistID}</td>
          <td>${row.TrackID}</td>
          <td>${row.Title}</td>
          <td>${row.Artist}</td>
          <td>${row.Album}</td>
          <td>${row.DateAdded}</td>
        </tr>
      `;
      }
      html += `
        </tbody>
        </table>
            </body>
      </html>
      `;
      res.send(html);
  } catch(err) {
    next(err);
  }
});

module.exports = router;
