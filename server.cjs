const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3001;


app.use(cors());

const pool = mysql.createPool({
  host: 'ba4byiaeo8tt6rsdzuae-mysql.services.clever-cloud.com',
  user: 'u43r7jmuzejzntyq',
  database: 'ba4byiaeo8tt6rsdzuae',
  password: 'Jx2v27HxcFX7jHqbWsZK',
  port: 3306
});

app.get('/', (req, res) => {
  res.send('Bienvenido al servidor Express');
});

app.get('/api/personas', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM personas');
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
