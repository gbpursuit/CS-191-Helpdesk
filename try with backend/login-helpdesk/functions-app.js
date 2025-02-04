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
    },

    checkSession: function(req, res, next) {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ loggedIn: false });
        }
        next();
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
            // await dumpToSql();
            req.session.username = username;
            return res.status(200).json({ success: true, message: 'Account created successfully' });
    
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const task = { 

    fetchingTasks: async function (db, bool = false, query = null, type = null, order = 'DESC', filterBy = null, value = null) {
        let baseQuery = `SELECT * FROM tasks`;
        const params = [];
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        console.log(bool, query, type, order, filterBy, value);
    
        if (bool && type && query) {
            baseQuery += ` WHERE ?? LIKE ?`; 
            params.push(type, `%${query}%`);
        }
        
        if (filterBy && value && filterBy !== 'taskDate' && filterBy !== 'department') {
            if (params.length > 0) {
                baseQuery += ` AND ?? = ?`;
            } else {
                baseQuery += ` WHERE ?? = ?`;
            }
            params.push(filterBy, value);
        }
        
        let sortField = 'id'; 
        if (filterBy === 'taskDate' || filterBy === 'department' || type === 'taskDate' || type === 'department') {
            sortField = filterBy || type;
        }
        
        baseQuery += ` ORDER BY ?? ${sortOrder}`;
        params.push(sortField);

    
        console.log(baseQuery);
        console.log(params);
    
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

    addTask: async function (db, req, res) {
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

    sessionUser: async function(db, req, res) {
        try {
            if (req.session && req.session.username) {
                // Check if session value matches username OR full name
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

    // getTask: async function (db, req, res) {
    //     try {
    //         const formattedTasks = await task.fetchingTasks(db, false, null, 'id');
            
    //         res.json(formattedTasks);
    //     } catch (err) {
    //         console.error('Error fetching tasks:', err);
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // }

    getTask: async function (db, req, res) {
        const { search, filterBy, value } = req.query; // Get search and filter values from the URL
    
        try {
            let tasks;
            
            if (search && filterBy && value) {
                // Apply both search for taskType and filter for another field
                if (filterBy == 'taskDate' || filterBy == 'department') {
                    tasks = await task.fetchingTasks(db, true, search, 'taskType', value, filterBy, value);
                } else {
                    tasks = await task.fetchingTasks(db, true, search, 'taskType', 'DESC', filterBy, value);
                }
            } else if (search) {
                // Apply only search for taskType
                tasks = await task.fetchingTasks(db, true, search, 'taskType', 'DESC');
            } else if (filterBy && value) {
                // Apply only filter
                if (filterBy == 'taskDate' || filterBy == 'department') {
                    tasks = await task.fetchingTasks(db, false, null, filterBy, value);
                } else {
                    tasks = await task.fetchingTasks(db, true, value, filterBy, 'DESC');
                }
            } else {
                // Fetch all tasks if no search or filter is provided
                tasks = await task.fetchingTasks(db, false, null, 'id');
            }
    
            res.status(200).json(tasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
}