import livereload from 'livereload';
import bcrypt from 'bcrypt';
import portfinder from 'portfinder';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase, dumpToSql } from './dbSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const watchPath = path.join(__dirname, 'internal');

export const server = {
    startLiveReload: async function() {
        try {
            portfinder.basePort = 35729;
            const availablePort = await portfinder.getPortPromise();
    
            const liveReloadServer = livereload.createServer({
                exts: ['html', 'css', 'js'],
                delay: 100,
                port: availablePort,
            });
    
            liveReloadServer.watch(watchPath);
            // console.log(`Livereload server running on port ${availablePort}`);
        } catch (err) {
            console.error('Error finding an available port for livereload:', err);
        }
    },

    startServer: async function(app) {
        try {
            portfinder.basePort = 3000; // Starting point for finding the port
            const availablePort = await portfinder.getPortPromise();

            // Now that we have an available port, start the server
            app.listen(availablePort, () => {
                console.log(`Server running on http://localhost:${availablePort}/internal/welcome`);
            });
        } catch (err) {
            console.error('Error finding an available port:', err);
        }
    },

    launchServer: async function(app) {
        try {
            const db = await setupDatabase();
            app.locals.db = db;
    
            // Start livereload and the server
            await server.startLiveReload();
            await server.startServer(app);
        } catch (err) {
            console.error('Failed to set up the database:', err);
            process.exit(1); // Exit on critical failure
        } 
    },

    isAuthenticated: function(req, res, next) {
        if (req.session && req.session.username) {
            return next();  // Proceed if authenticated
        }
    
        // res.send('<h1>Redirecting...</h1><p>You are not logged in. Redirecting to the welcome page...</p>');
        setTimeout(() => {
            return res.redirect('/internal/welcome');
        }, 1000);  // Adjust the delay time as needed (in milliseconds)
    }
}

export const account = {
    signIn: async function(app, req, res, username, password) {
        try {
            const [rows] = await app.locals.db.query(
                `SELECT * FROM users WHERE CONCAT(first_name, IFNULL(CONCAT(' ', last_name), '')) = ? OR username = ? LIMIT 1`,
                [username, username]
            );
            // 'SELECT 1 FROM users WHERE CONCAT(first_name, IFNULL(CONCAT(' ', last_name), '') OR username = ? LIMIT 1',
            // [user.first_name, user.last_name, user.username]

            if (rows.length > 0) {
                const user = rows[0];
                const match = await bcrypt.compare(password, user.password); 

                if (match) {
                    req.session.username = username; 
                    return res.status(200).json({ success: true });
                }
            }
            return res.status(401).json({ error: 'Invalid username or password' });
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    createAccount: async function(app, req, res, username, name, password) {
        try {
            const [first_name, last_name] = name.split(' '); // last name is null if undefined
    
            const [rows] = await app.locals.db.query(
                `SELECT * FROM users WHERE CONCAT(first_name, IFNULL(CONCAT(' ', last_name), '')) = ? OR username = ? LIMIT 1`,
                [name, username]
            );
    
            if (rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            await app.locals.db.query(
                'INSERT INTO users (username, first_name, last_name, password) VALUES (?, ?, ?, ?)',
                [username, first_name, last_name, hashedPassword]
            );
            await dumpToSql();
            return res.status(200).json({ success: true, message: 'Account created successfully' });
    
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}