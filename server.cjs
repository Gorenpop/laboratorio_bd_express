const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // Reemplaza con el origen de tu aplicación
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());

// Middleware para manejar errores
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Configuración del pool de conexiones a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'ba4byiaeo8tt6rsdzuae-mysql.services.clever-cloud.com',
  user: process.env.DB_USER || 'u43r7jmuzejzntyq',
  database: process.env.DB_NAME || 'ba4byiaeo8tt6rsdzuae',
  password: process.env.DB_PASSWORD || 'Jx2v27HxcFX7jHqbWsZK',
  port: process.env.DB_PORT || 3306
});

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('Bienvenido al servidor Express');
});
// endpoint para traer los municipios
app.get('/api/municipios', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
          p.id,
          p.nombre
      FROM 
          municipios p
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});
// Endpoint para obtener todos los datos de las personas con el nombre del municipio
app.get('/api/personas', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
          p.id,
          p.nombre AS nombre_persona,
          p.edad,
          p.sexo,
          p.email,
          p.esCabezaDeFamilia,
          m.nombre AS nombre_municipio,
          p.direccionVivienda
      FROM 
          personas p
      JOIN 
          municipios m ON p.municipioId = m.id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});


// Endpoint para agregar una nueva persona
app.post('/api/addPersonas', async (req, res) => {
  const { nombre, edad, sexo, email, esCabezaDeFamilia, municipioId, direccionVivienda } = req.body;

  try {
    const sql = 'INSERT INTO personas (nombre, edad, sexo, email, esCabezaDeFamilia, municipioId, direccionVivienda) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await pool.execute(sql, [nombre, edad, sexo, email, esCabezaDeFamilia, municipioId, direccionVivienda]);

    if (result.affectedRows > 0) {
      const persona = {
        id: result.insertId,
        nombre,
        edad,
        sexo,
        email,
        esCabezaDeFamilia,
        municipioId,
        direccionVivienda
      };
      res.status(201).json(persona);
    } else {
      res.status(400).json({ error: 'No se pudo insertar la persona' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al insertar la persona' });
  }
});

// Endpoint para eliminar una persona
app.delete('/api/personasDelete/:id', async (req, res) => {
  const id = req.params.id; 
  try {
    const [result] = await pool.execute('DELETE FROM personas WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }
    
    res.json({ message: 'Persona eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando persona' });
  }
});

//Actualizar una persona
app.put('/api/personasUpdate/:id', async (req, res) => {
  const id = req.params.id;
  const {
    nombre,
    edad,
    sexo,
    email,
    esCabezaDeFamilia,
    municipioId,
    direccionVivienda
  } = req.body;

  console.log(`Updating persona with ID ${id} with new data:`, req.body);

  try {
    const [result] = await pool.execute(
      `UPDATE personas 
       SET 
           nombre = ?,
           edad = ?,
           sexo = ?,
           email = ?,
           esCabezaDeFamilia = ?,
           municipioId = ?,
           direccionVivienda = ?
       WHERE 
           id = ?`,
      [
        nombre,
        edad,
        sexo,
        email,
        esCabezaDeFamilia,
        municipioId,
        direccionVivienda,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Persona no encontrada' });
    }

    res.json({ message: 'Persona actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando persona' });
  }
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});