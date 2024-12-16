import express from 'express';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const router = express.Router();
const db = new Pool({ connectionString: 'To add db connection' }); //Todo:: db connection 

//Route for user registration 
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    (req.session as any).user = result.rows[0];
    res.redirect('/lobby');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

// route for logging in 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        (req.session as any).user  = { id: user.id, username: user.username, email: user.email };
        return res.redirect('/lobby');
      }
    }
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
});

// Route for logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

export default router;
