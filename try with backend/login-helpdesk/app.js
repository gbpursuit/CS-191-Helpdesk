import express from 'express';
import path from 'path';
import connectLivereload from 'connect-livereload';
import session from 'express-session';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { isAuthenticated, launchServer } from './functions-app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'simple_helpdesk',
});

const app = express();
app.use(connectLivereload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);

// API endpoint to get session user
app.get('/api/session-user', (req, res) => {
    if (req.session && req.session.username) {
        return res.json({ username: req.session.username });
    }
    return res.status(401).json({ error: 'Unauthorized' });
});

// Serve static files from the "internal" folder
app.use('/internal', express.static(path.join(__dirname, 'internal')));

// Dynamic route to handle /internal/:page/:view
app.get('/internal/:page/:view?', (req, res) => {
    const { page, view } = req.params; 

    // Valid pages and views
    const validPages = ['enter', 'login', 'dashboard', 'summary'];  // gusto ko gawing /home/dashboard 
    const validViews = ['sign-in', 'create-account'];               // or /home/summary

    // Check for valid pages
    if (validPages.includes(page)) {
        if (page === 'login' && view) {
            if (validViews.includes(view)) {
                return res.sendFile(path.join(__dirname, 'internal', `${page}.html`));
            }
            return res.status(404).send('Invalid view');
        }

        return res.sendFile(path.join(__dirname, 'internal', `${page}.html`));
    }

    res.status(404).send('Page not found');
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.query(
            `SELECT * FROM users WHERE CONCAT(first_name, ' ', last_name) = ? AND password = ?`,
            [username, password]
        );

        if (rows.length > 0) {
            req.session.username = username;
            return res.status(200).json({ success: true });
        }

        return res.status(401).json({ error: 'Invalid username or password' });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({error: 'Failed to log out' });
        }
        res.status(200).json({ success: true });
    });
});

// Fallback route for unmatched paths (optional)
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the Application and Launch
launchServer(app);







// (async () => {
//     try {
//         await setupDatabase();
//         console.log('Database setup complete.');

//         await startLiveReload();
//         await startServer();
//     } catch (err) {
//         console.error('Failed to set up the database:', err);
//     }
// })();