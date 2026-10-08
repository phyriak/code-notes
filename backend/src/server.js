import express from 'express';
import multer from 'multer';
import cors from 'cors';
import pool from './db.js';
import crypto from 'crypto';
import sharp from 'sharp';


const app = express();
console.log('SERVER.JS LOADED');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('REQUEST:', req.method, req.url);
  next();
});

app.use(
  '/uploads',
  express.static('/app/uploads')
);

//Multer
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed'));
    }

    cb(null, true);
  },
});
//

app.get('/api/articles', async (req, res) => {
  console.log('ARTICLES ENDPOINT HIT');

  try {
    const result = await pool.query(
      'SELECT * FROM articles ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    res.status(500).json({
      error: 'Failed to fetch articles',
    });
  }
});


app.post('/api/articles', async (req, res) => {
  const {
    title,
    category,
    description,
    content,
  } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({
      error: 'Title, category and content are required',
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO articles (
        title,
        category,
        description,
        content
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        title,
        category,
        description || null,
        content,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create article:', error);

    res.status(500).json({
      error: 'Failed to create article',
    });
  }
});


app.get('/api/articles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM articles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Article not found',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to fetch article:', error);

    res.status(500).json({
      error: 'Failed to fetch article',
    });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM articles WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Article not found',
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete article:', error);

    res.status(500).json({
      error: 'Failed to delete article',
    });
  }
});


app.put('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    description,
    content,
  } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({
      error: 'Title, category and content are required',
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE articles
      SET
        title = $1,
        category = $2,
        description = $3,
        content = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        title,
        category,
        description || null,
        content,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Article not found',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update article:', error);

    res.status(500).json({
      error: 'Failed to update article',
    });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category
      FROM articles
      WHERE category IS NOT NULL
        AND category <> ''
      ORDER BY category
    `);

    res.json(result.rows.map((row) => row.category));
  } catch (error) {
    console.error('Failed to fetch categories:', error);

    res.status(500).json({
      error: 'Failed to fetch categories',
    });
  }
});

app.post('/api/images', upload.single('image'), async (req, res) => {
  console.log('IMAGE UPLOAD HANDLER');

  if (!req.file) {
    return res.status(400).json({
      error: 'No image uploaded',
    });
  }

  try {
    const filename = `${crypto.randomUUID()}.webp`;
    const outputPath = `/app/uploads/${filename}`;

    await sharp(req.file.buffer)
      .rotate()
      .resize({
        width: 1600,
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
      })
      .toFile(outputPath);

    res.status(201).json({
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error('Failed to process image:', error);

    res.status(500).json({
      error: 'Failed to process image',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP' });
});


const PORT = 3201;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});