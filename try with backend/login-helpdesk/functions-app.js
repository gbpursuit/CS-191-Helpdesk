import livereload from 'livereload';
import bcrypt from 'bcrypt';
import portfinder from 'portfinder';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql_dump, setup_database } from './dbSetup.js';
import rateLimit from 'express-rate-limit'; // npm install express-rate-limit
import validator from 'validator'; // npm install validator

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const watchPath = path.join(__dirname, 'internal');

export const server = {
    start_live_reload: async function() {
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

    start_server: async function(app) {
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

    launch_server: async function(app) {
        try {
            const db = await setup_database();
            app.locals.db = db;
    
            // Start livereload and the server
            await server.start_live_reload();
            await server.start_server(app);
        } catch (err) {
            console.error('Failed to set up the database:', err);
            process.exit(1); // Exit on critical failure
        } 
    },

    is_authenticated: function(req, res, next) {
        if (req.session && req.session.username) {
            return next();  // Proceed if authenticated
        }
        return res.redirect('/internal/welcome');
    
        // setTimeout(() => {
        //     return res.redirect('/internal/welcome');
        // }, 1000);  // Adjust the delay time as needed (in milliseconds)
    },

    update_dump: function() {
        let time = 5 * 60 * 1000; // 5 * 60 * 1000 5 minutes
        setInterval(() => {
            sql_dump()
                .then((filePath) => console.log(`Database dump updated at: ${filePath}`))
                .catch((error) => console.error(`Dump failed: ${error}`));
        }, time); // 5 minutes
    },

    serve_page: function(res, filePath) {
        return res.sendFile(filePath);
    },

    get_valid_pages: function(easyPath, callback) {
        const publicPath = path.join(easyPath, 'public');
        const protectedPath = path.join(easyPath, 'protected');

        Promise.all([
            fs.promises.readdir(publicPath),
            fs.promises.readdir(protectedPath)
        ])
        .then(([publicFiles, protectedFiles]) => {
            callback(null, {
                public: publicFiles.filter(file => file.endsWith('.html')).map(file => path.basename(file, '.html')),
                protected: protectedFiles.filter(file => file.endsWith('.html')).map(file => path.basename(file, '.html'))
            })
        })
    }

}

export const account = {
    sign_in: async function(app, req, res, username, password) {
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            const [rows] = await app.locals.db.query(
                `SELECT username, password FROM users WHERE username = ? LIMIT 1`,
                [username]
            );

            if (!rows.length) throw new Error('User not found');

            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) throw new Error('Invalid password');

            req.session.username = user.username;
            return res.status(200).json({ success: true });

        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    create_account: async function(app, req, res, username, name, password) {

        username = username?.trim();
        name = name?.trim();
        password = password?.trim();

        if (!username || !name || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate username (letters at numbers lang)
        if (!validator.isAlphanumeric(username)) {
            return res.status(400).json({ error: 'Invalid username. Only letters and numbers allowed.' });
        }

        // Validate full name (letters and spaces lang)
        if (!validator.matches(name, /^[a-zA-Z\s]+$/)) {
            return res.status(400).json({ error: 'Invalid name. Only letters and spaces allowed.' });
        }

        // Validate password length
        // if (!validator.isLength(password, { min: 8 })) {
        //     return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        // }

        // Clean / Sanitize Inputs
        username = username.trim();
        name = name.trim();
        password = password.trim();

        try {
            const [first_name, ...lastParts] = name.split(' ');
            const last_name = lastParts.length ? lastParts.join(' ') : null;
    
            const [rows] = await app.locals.db.query(
                `SELECT * FROM users WHERE username = ? LIMIT 1`,
                [username]
            );

            if (rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
            await app.locals.db.query(
                'INSERT INTO users (username, first_name, last_name, password) VALUES (?, ?, ?, ?)',
                [username, first_name, last_name, hashedPassword]
            );

            req.session.username = username;
            return res.status(200).json({ success: true, message: 'Account created successfully' });
    
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const task = { 

    fetching_tasks: async function (db, bool = false, query = null, type = null, order = 'DESC', filterBy = null, value = null) {
        let conditions = [];
        let params = [];
        
        if (bool && type && query) {
            conditions.push(`?? LIKE ?`);
            params.push(type, `%${query}%`);
        }
        
        if (filterBy && value && !['taskDate', 'department'].includes(filterBy)) {
            if (params.length > 0) {
                conditions.push(`?? = ?`);
            } else {
                conditions.push(`?? = ?`);
            }
            params.push(filterBy, value);
        }
        
        let whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        let sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC'
        let sortField = ['taskDate', 'department'].includes(filterBy) ? filterBy : 'id';
        let baseQuery = `SELECT * FROM tasks ${whereClause} ORDER BY ?? ${sortOrder}`;
        
        params.push(sortField);

        const [tasks] = await db.query(baseQuery, params);
    
        return tasks.map(task => ({
            ...task,
            taskDate: task.taskDate ? new Date(task.taskDate).toLocaleDateString('en-CA') : null,
            dateReq: task.dateReq ? new Date(task.dateReq).toLocaleDateString('en-CA') : null,
            dateRec: task.dateRec ? new Date(task.dateRec).toLocaleDateString('en-CA') : null,
            dateStart: task.dateStart ? new Date(task.dateStart).toLocaleDateString('en-CA') : null,
            dateFin: task.dateFin ? new Date(task.dateFin).toLocaleDateString('en-CA') : null
        }));
    },

    add_task: async function (db, req, res) {
        try {
            const {
                taskId, taskDate, taskStatus, severity, taskType, taskDescription,
                itInCharge, department, departmentNo, requestedBy, approvedBy, itemName, deviceName, applicationName,
                dateReq, dateRec, dateStart, dateFin
            } = req.body;
    
            // Ensure dates are valid and empty strings are converted to NULL
            const convertDate = (date) => date && date !== '--' ? date : null;
    
            await db.query(`
                INSERT INTO tasks (taskId, taskDate, taskStatus, severity, taskType, taskDescription, itInCharge, department, departmentNo,
                    requestedBy, approvedBy, itemName, deviceName, applicationName, dateReq, dateRec, dateStart, dateFin)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                taskId, convertDate(taskDate), taskStatus,  severity, 
                taskType, taskDescription, itInCharge, department, 
                departmentNo, requestedBy,  approvedBy,  itemName, 
                deviceName, applicationName, convertDate(dateReq),
                convertDate(dateRec), convertDate(dateStart), convertDate(dateFin)
            ]);
    
            res.status(201).json({ success: true, message: 'Task saved successfully' });
        } catch (err) {
            console.error('Error saving task:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    session_user: async function(db, req, res) {
        try {
            if (req.session && req.session.username) {
                const [rows] = await db.query(
                    `SELECT username, first_name, last_name FROM users 
                    WHERE CONCAT(first_name, IFNULL(CONCAT(' ', last_name), '')) = ? OR username = ? 
                    LIMIT 1`,
                    [req.session.username, req.session.username]
                );

                if (rows.length > 0) {
                    const user = rows[0];
                    const fullName = user.first_name + (user.last_name ? ` ${user.last_name}` : '');

                    req.session.username = user.username; // username (key)
                    req.session.fullName = fullName; // full name of user

                    return res.json({ username: user.username, fullName });
                } else {
                    return res.status(404).json({ error: 'User not found' });
                }
            }

            return res.status(401).json({ error: 'Unauthorized' });
        } catch (err) {
            console.error('Error retrieving session user:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    get_task: async function (db, req, res) {
        const { search, filterBy, value } = req.query; // Get search and filter values from the URL
    
        try {
            let tasks;
            
            if (search && filterBy && value) {
                // Apply both search for taskType and filter for another field
                if (filterBy == 'taskDate' || filterBy == 'department') {
                    tasks = await task.fetching_tasks(db, true, search, 'taskType', value, filterBy, value);
                } else {
                    tasks = await task.fetching_tasks(db, true, search, 'taskType', 'DESC', filterBy, value);
                }
            } else if (search) {
                // Apply only search for taskType
                tasks = await task.fetching_tasks(db, true, search, 'taskType', 'DESC');
            } else if (filterBy && value) {
                // Apply only filter
                if (filterBy == 'taskDate' || filterBy == 'department') {
                    tasks = await task.fetching_tasks(db, false, null, filterBy, value);
                } else {
                    tasks = await task.fetching_tasks(db, true, value, filterBy, 'DESC');
                }
            } else {
                // Fetch all tasks if no search or filter is provided
                tasks = await task.fetching_tasks(db, false, null, 'id');
            }
    
            res.status(200).json(tasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    get_user: async function (db, req, res) {
        try {
            const [rows] = await db.query(`SELECT username, first_name, last_name FROM users ORDER BY username`);

            if (rows.length < 0) {
                res.status(404).json({ error: 'No username found.' });
            } else {
                res.status(200).json(rows);
            }

        } catch(err) {
            console.error('Error fetching uers:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
}

export const limiter = {
    login_limit: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // Max 10 task submissions per 15 minutes
        message: { error: 'Too many requests, please try again later.' }
    }),

    task_limit: rateLimit({
        windowMs: 10 * 60 * 1000, 
        max: 50, 
        message: { error: 'Task submission limit exceeded, try again later.' }
    }),

    delete_limit: rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 10,
        message: { error: 'Too many delete requests, try again later.'}
    }),

};