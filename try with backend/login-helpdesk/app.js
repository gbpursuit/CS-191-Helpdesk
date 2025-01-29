import express from 'express';
import fs from 'fs';
import path from 'path';
import connectLivereload from 'connect-livereload';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { server, account } from './functions-app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const easyPath = path.join(__dirname, 'internal')

const app = express();
app.use(connectLivereload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
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
app.use('/internal', express.static(easyPath));

// API to submit a task
app.post('/api/tasks', async (req, res) => {
    try {
        const db = app.locals.db;
        const {
            taskId, taskStatus, taskDate, itInCharge, taskType, taskDescription,
            severity, requestedBy, approvedBy, dateReq, dateRec, dateStart, dateFin
        } = req.body;

        await db.query(`
            INSERT INTO tasks (taskId, taskStatus, taskDate, itInCharge, taskType, taskDescription,
                severity, requestedBy, approvedBy, dateReq, dateRec, dateStart, dateFin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            taskId, 
            taskStatus, 
            taskDate && taskDate !== '--' ? taskDate : null, 
            itInCharge, 
            taskType, 
            taskDescription,
            severity, 
            requestedBy, 
            approvedBy, 
            dateReq && dateReq !== '--' ? dateReq : null, 
            dateRec && dateRec !== '--' ? dateRec : null, 
            dateStart && dateStart !== '--' ? dateStart : null, 
            dateFin && dateFin !== '--' ? dateFin : null
        ]);

        res.status(201).json({ success: true, message: 'Task saved successfully' });
    } catch (err) {
        console.error('Error saving task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API to fetch all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const db = app.locals.db;
        const [tasks] = await db.query('SELECT * FROM tasks ORDER BY id DESC');
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const validViews = ['sign-in', 'create-account'];

// Dynamic route to handle /internal/:page/:view
app.get('/internal/:page/:view?', (req, res) => {
    const { page, view } = req.params;

    // Get all the HTML files in the "internal" folder
    const validPages = fs.readdirSync(easyPath).filter(file => file.endsWith('.html')).map(file => path.basename(file, '.html')); // Remove the ".html" extension
    const publicPages = ['welcome', 'login'];

    if (validPages.includes(page)) {
        // Handle public pages
        if (publicPages.includes(page)) {
            if (page === 'login' && view && validViews.includes(view)) {
                return res.sendFile(path.join(easyPath, `${page}.html`));
            }
            return res.sendFile(path.join(easyPath, `${page}.html`));
        }

        // Handle protected pages (requires authentication)
        server.isAuthenticated(req, res, () => {
            return res.sendFile(path.join(easyPath, `${page}.html`));
        });

    } else {
        res.status(404).send('Page not found');
    }
});

// Login route
app.post('/login/:view', async (req, res) => {
    const { view } = req.params;

    // Validate the view parameter
    if (validViews.includes(view)) {
        if (view === 'sign-in') {
            const { username, password } = req.body; // Only expect username and password for sign-in
            await account.signIn(app, req, res, username, password);
        } else if (view === 'create-account') {
            const { username, name, password } = req.body; // Expect username, name, and password for account creation
            console.log(username);
            console.log(name);
            console.log(password);
            await account.createAccount(app, req, res, username, name, password);
        } 
    } else {
        return res.status(400).json({ error: 'Invalid view' });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.status(200).json({ success: true });
    });
});

// Fallback route for unmatched paths
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
server.launchServer(app);