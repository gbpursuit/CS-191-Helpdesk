import livereload from 'livereload';
import bcrypt from 'bcrypt';
import portfinder from 'portfinder';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sql_dump, setup_database, restore_existing_database } from './dbSetup.js';
import rateLimit from 'express-rate-limit'; // npm install express-rate-limit
import validator from 'validator'; // npm install validator
import cron from 'node-cron';

import http from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const watchPath = path.join(__dirname, 'internal');

const users = new Map();
let io;

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

    start_server: async function(app, sessionMiddleware) {
        try {
            portfinder.basePort = 3000; // Starting point for finding the port
            const availablePort = await portfinder.getPortPromise();

            const httpServer = http.createServer(app);
            io = new Server (httpServer, {
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST', 'PUT']
                }
            });

            io.use((socket, next) => {
                sessionMiddleware(socket.request, socket.request.res || {}, next);
            });

            io.on('connection', (socket) => {
                console.log('A user has opened the webpage: ', socket.id);
            
                socket.on('registerUser', (userId) => {
                    let sockets = users.get(userId);
                    if (!sockets) {
                        sockets = new Set(); 
                        users.set(userId, sockets);  
                    }
            
                    sockets.add(socket.id);
            
                    console.log(`User ${userId} has been successfully registered with socket ID: ${socket.id}`);
                    console.log('Active users after registration: ', users);
                });
            
                socket.on('message', (msg) => {
                    console.log('Received message: ', msg);
                });
            
                socket.on('addTask', (addedCheck) => {
                    const { task, user } = addedCheck;
                    
                    if (task) {
                        users.forEach((socketIds, userId) => {
                            if (userId !== user) {
                                console.log('Executing addTask to other users');
                                socketIds.forEach(socketId => {
                                    io.to(socketId).emit('loadTask', { taskFile: task });
                                });
                            }
                        });
                    }
                });

                socket.on('updateTask', (addedCheck) => {

                    let defineTask = null;

                    function emit_user(task) {
                        users.forEach((socketIds, userId) => {
                            if (userId !== user) {
                                console.log('Executing updateTask to other users');
                                socketIds.forEach(socketId => {
                                    io.to(socketId).emit(task);
                                });
                            }
                        });
                    }

                    console.log('updateTask called');
                    const { check, user } = addedCheck;
                    if (check === 'update') {
                        defineTask = 'updateLoadTask';
                    } else {
                        defineTask = 'cancelLoadTask';
                    }
                    emit_user(defineTask);
                })

                socket.on('updateTable', (updateCheck) => {
                    if (updateCheck) {
                        io.emit('loadReferenceTable')
                    }
                })
            
                socket.on('updateSocket', (userId) => {
                    let sockets = users.get(userId);
                    if (!sockets) {
                        sockets = new Set();  // If no sockets exist, create a new Set
                        users.set(userId, sockets);
                    }
            
                    sockets.add(socket.id);
                    console.log(`User ${userId} has successfully updated their socket.id: ${socket.id}`);
                    console.log('Active users after updating: ', users);
                });

                socket.on('logout', (userId) => {
                    console.log(`User ${userId} has successfully logged out.`);
            
                    users.forEach((socketIds, userId) => {
                        if (socketIds.has(socket.id)) {
                            socketIds.delete(socket.id);
                            if (socketIds.size === 0) {
                                users.delete(userId);  
                            }
                        }
                    });
                    console.log(`Active users after ${userId} logged out: `, users);
                })
            
                socket.on('disconnect', () => {
                    console.log(`User with socket ID ${socket.id} has disconnected`);
            
                    users.forEach((socketIds, userId) => {
                        if (socketIds.has(socket.id)) {
                            socketIds.delete(socket.id);  
                        }
                    });
            
                    console.log('Active users after disconnection: ', users);
                });
            });

            // Now that we have an available port, start the server
            httpServer.listen(availablePort, () => {
                console.log(`Server running on http://localhost:${availablePort}/internal/welcome`);
            });
        } catch (err) {
            console.error('Error finding an available port:', err);
        }
    },

    launch_server: async function(app, sessionMiddleware) {
        try {
            // await restore_existing_database();
            const db = await setup_database();
            app.locals.db = db;
    
            // Start livereload and the server
            // await createTrigger(db);
            await server.start_live_reload();
            await server.start_server(app, sessionMiddleware);
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
        console.log("Server started. Scheduling database dump...");
        cron.schedule("0 18 * * *", async () => {
            console.log("Executing schedule database dump..."); // Runs kapag 6pm na
            try {
                const filePath = await sql_dump();
                console.log(`Database dump updated at: ${filePath}`);
            } catch (error) {
                console.error(`Dump failed: ${error}`);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Manila"
        });

        console.log("Updating database dump is scheduled to run at 6 PM daily.");

        // let time = 5 * 60 * 1000; // 5 * 60 * 1000 5 minutes
        // setInterval(() => {
        //     sql_dump()
        //         .then((filePath) => console.log(`Database dump updated at: ${filePath}`))
        //         .catch((error) => console.error(`Dump failed: ${error}`));
        // }, time); // 5 minutes
    },

    serve_page: function(res, filePath) {
        return res.sendFile(filePath);
    },

    get_valid_pages: function(easyPath, callback) {
        const publicPath = path.join(easyPath, 'public');
        const protectedPath = path.join(easyPath, 'protected');

        async function get_all_files(dir, baseDir = '') {
            let results = [];
            try {
                const files = await fs.promises.readdir(dir, {withFileTypes: true});
                for (const file of files) {
                    const absPath = path.join(dir, file.name);
                    const relPath = path.join(dir, file.name);

                    if(file.isDirectory()){
                        const subFiles = await get_all_files(absPath, relPath);
                        results = results.concat(subFiles);
                    } else if (file.name.endsWith('.html')) {
                        results.push(relPath);
                    }
                }

            } catch (err) {
                console.error(`Error reading directory ${dir}:`, err);
            }
            // console.log(results);
            return results;
        }

        Promise.all([
            get_all_files(publicPath),
            get_all_files(protectedPath)
        ])
        .then(([publicFiles, protectedFiles]) => {
            callback(null, {
                public: publicFiles.filter(file => file.endsWith('.html')).map(file => file.replace(/\\/g, '/')),
                protected: protectedFiles.filter(file => file.endsWith('.html')).map(file => file.replace(/\\/g, '/'))
            })
        })
    }
}

export const account = {
    sign_in: async function(app, req, res, username, password) {


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
            return res.status(200).json({ success: true, username: user.username });

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

            // req.session.username = username;
            return res.status(200).json({ success: true, message: 'Account created successfully' });
    
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    get_user: async function (db, req, res) {
        try {
            const [rows] = await db.query(`SELECT username, full_name FROM users ORDER BY username`);

            if (rows.length < 0) {
                res.status(404).json({ error: 'No username found.' });
            } else {
                res.status(200).json(rows);
            }

        } catch(err) {
            console.error('Error fetching uers:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    is_admin: async function(db, req, res) {
        try {
            const [rows] = await db.query(
                'SELECT password, COUNT(*) AS userCount FROM users WHERE username = ?',
                [req.body.username]
            );
    
            const user = rows[0];
    
            if (!user || user.userCount === 0) {
                return res.json({ itExists: 0, error: 'User not found' });
            }
            const match = await bcrypt.compare(req.body.password, user.password);
    
            if (!match) {
                return res.json({ itExists: 0, error: 'Invalid password' });
            }
    
            // If user exists and password matches
            return res.json({ itExists: 1 });


        } catch (err) {
            console.error("Error verifying admin credentials:", err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const task = { 

    fetching_tasks: async function (db, bool = false, query = null, type = null, order = 'DESC', filterBy = null, value = null) {
        let conditions = [];
        let params = [];

        if(bool && type && query) {
            if (Array.isArray(type)) {
                let typeConditions = type.map(t => {
                    return t === "taskType" ? 'task_types.name LIKE ?' : '?? LIKE ?';
                }).join (' OR ');
                conditions.push(`(${typeConditions})`);
                type.forEach(t => {
                    if (t === 'taskType') {
                        params.push(`%${query}%`);
                    } else {
                        params.push(t, `%${query}%`);
                    }
                });
            }
            else {
                conditions.push(`?? LIKE ?`);
                params.push(type, `%${query}%`);
            }
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
        let sortField = ['taskDate', 'department'].includes(filterBy) ? filterBy : 'tasks.id';
        
        // Replace the id values with actual names in their respective tables
        let baseQuery = `
            SELECT 
                tasks.id,
                tasks.taskId,
                tasks.taskDate,
                tasks.taskStatus,
                tasks.severity,
                task_types.name AS taskType, 
                tasks.taskDescription,
                tasks.problemDetails,
                tasks.remarks,
                itUser.full_name AS itInCharge,
                tasks.department, 
                tasks.departmentNo,
                requestedUser.full_name AS requestedBy,  
                approvedUser.full_name AS approvedBy,    
                items.name AS itemName, 
                devices.name AS deviceName, 
                applications.name AS applicationName, 
                tasks.dateReq,
                tasks.dateRec,
                tasks.dateStart,
                tasks.dateFin
            FROM tasks
            LEFT JOIN task_types ON tasks.taskType = task_types.id
            LEFT JOIN it_in_charge AS itUser ON tasks.itInCharge = itUser.id
			LEFT JOIN requested_by AS requestedUser ON tasks.requestedBy = requestedUser.id
			LEFT JOIN departments ON requestedUser.department = departments.id
			LEFT JOIN approved_by AS approvedUser ON tasks.approvedBy = approvedUser.id
			LEFT JOIN app_departments ON approvedUser.department = app_departments.id
            LEFT JOIN items ON tasks.itemName = items.id
            LEFT JOIN devices ON tasks.deviceName = devices.id
            LEFT JOIN applications ON tasks.applicationName = applications.id
            ${whereClause}
            ORDER BY ?? ${sortOrder}
        `;

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

    get_single_task: async function(db, taskId) {
        const [newTask] = await db.query(`
            SELECT 
                tasks.id,
                tasks.taskId,
                tasks.taskDate,
                tasks.taskStatus,
                tasks.severity,
                task_types.name AS taskType, 
                tasks.taskDescription,
                tasks.problemDetails,
                tasks.remarks,
                itUser.full_name AS itInCharge,
                tasks.department, 
                tasks.departmentNo,
                requestedUser.full_name AS requestedBy,  
                approvedUser.full_name AS approvedBy,    
                items.name AS itemName, 
                devices.name AS deviceName, 
                applications.name AS applicationName, 
                tasks.dateReq,
                tasks.dateRec,
                tasks.dateStart,
                tasks.dateFin
            FROM tasks
            LEFT JOIN task_types ON tasks.taskType = task_types.id
            LEFT JOIN it_in_charge AS itUser ON tasks.itInCharge = itUser.id
			LEFT JOIN requested_by AS requestedUser ON tasks.requestedBy = requestedUser.id
			LEFT JOIN departments ON requestedUser.department = departments.id
			LEFT JOIN approved_by AS approvedUser ON tasks.approvedBy = approvedUser.id
			LEFT JOIN app_departments ON approvedUser.department = app_departments.id
            LEFT JOIN items ON tasks.itemName = items.id
            LEFT JOIN devices ON tasks.deviceName = devices.id
            LEFT JOIN applications ON tasks.applicationName = applications.id
            WHERE tasks.taskId = ?
            `, [taskId]);

        return newTask[0];

    },

    add_task: async function (db, req, res, validTables) {
        try {
            const {
                taskId, taskDate, taskStatus, severity, taskType, taskDescription,
                itInCharge, department, departmentNo, requestedBy, approvedBy, itemName, deviceName, applicationName,
                dateReq, dateRec, dateStart, dateFin, problemDetails, remarks
            } = req.body;
       
            async function get_or_insert(table, column, value) {
                if (!value) return null;

                if (validTables.includes(table) && value === '--') {
                    const [existing] = await db.query(`SELECT id FROM ${table} WHERE ${column} = ?`, ['Unknown']);
                    if (existing.length) return existing[0].id;
                }
           
                const [existing] = await db.query(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
                if (existing.length) return existing[0].id;

                let req_full_name, req_parts, req_first, req_last;
            
                if (column === 'full_name') {
                    req_full_name = value.trim();
                    req_parts = req_full_name.split(/\s+/);
                    req_first = req_parts[0];
                    req_last = req_parts.length > 1 ? req_parts.slice(1).join(' ') : '';

                    const [result] = await db.query(`INSERT INTO ${table} (first_name, last_name) VALUES (?, ?)`, [req_first, req_last]);
                    return result.insertId; 
                    // throw new Error("Cannot insert into a generated column: full_name");
                }
            
                const [result] = await db.query(`INSERT INTO ${table} (${column}) VALUES (?)`, [value]);
                return result.insertId; 
            } 

            // Convert incoming text values to their corresponding IDs
            const taskTypeId = await get_or_insert('task_types', 'name', taskType);
            const itInChargeId = await get_or_insert('it_in_charge', 'full_name', itInCharge);
            const requestedById = await get_or_insert('requested_by', 'full_name', requestedBy);
            const approvedById = await get_or_insert('approved_by', 'full_name', approvedBy);
            
            // const departmentId = await get_or_insert('departments', 'name', department);
            const itemId = await get_or_insert('items', 'name', itemName);
            const deviceId = await get_or_insert('devices', 'name', deviceName);
            const applicationId = await get_or_insert('applications', 'name', applicationName);
    
            const convertDate = (date) => date && date !== '--' ? date : null;
            const severityNumber = parseInt(severity, 10);
    
            await db.query(`
                INSERT INTO tasks (taskId, taskDate, taskStatus, severity, taskType, taskDescription, 
                    itInCharge, department, departmentNo, requestedBy, approvedBy, 
                    itemName, deviceName, applicationName, dateReq, dateRec, dateStart, dateFin, 
                    problemDetails, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                taskId, convertDate(taskDate), taskStatus, severityNumber, 
                taskTypeId, taskDescription, itInChargeId, department, 
                departmentNo, requestedById, approvedById, itemId, 
                deviceId, applicationId, convertDate(dateReq),
                convertDate(dateRec), convertDate(dateStart), convertDate(dateFin), problemDetails, remarks
            ]);
    
            // console.log(req.session.username, res);
            // socket.emit('addTask', { task: get_single_task(taskId), user: req.session.username });
            res.status(201).json({ success: true, message: 'Task saved successfully' });
    
        } catch (err) {
            console.error('Error saving task:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    
    update_task: async function(db, req, res) {
        try {
            const taskId = req.params.taskId;

            // Convert empty values to NULL
            const convertToNull = (value) => (value === '' ? null : value);
            const isValidDate = (dateString) => /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;

            async function get_or_insert(table, column, value) {
                if (!value) return null;
            
                // Check if value exists
                // if (column === 'full_name') {
                //     const [existing] = await db.query(`SELECT username FROM ${table} WHERE full_name = ?`, [value]);
                //     return existing.length ? existing[0].username : null;
                // }
            
                const [existing] = await db.query(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
                if (existing.length) return existing[0].id;
            
                // If column is full_name, we should NEVER insert it
                // if (column === 'full_name') {
                //     throw new Error("Cannot insert into a generated column: full_name");
                // }
            
                // Insert new value and return ID
                const [result] = await db.query(`INSERT INTO ${table} (${column}) VALUES (?)`, [value]);
                return result.insertId; // return the id of newly created value
            }

            const validatedFields = Object.fromEntries(
                await Promise.all(Object.entries(req.body).map(async ([key, value]) => {
                    if (key.toLowerCase().includes('date')) return [key, isValidDate(value)];
    
                    // Convert names to IDs for relevant fields
                    if (key === "taskType") value = await get_or_insert('task_types', 'name', value);
                    if (key === "itInCharge") value = await get_or_insert('it_in_charge', 'full_name', value);
                    if (key === "requestedBy") value = await get_or_insert('requested_by', 'full_name', value);
                    if (key === "approvedBy") value = await get_or_insert('approved_by', 'full_name', value);
                    // if (key === "department") value = await get_or_insert('departments', 'name', value);
                    if (key === "itemName") value = await get_or_insert('items', 'name', value);
                    if (key === "deviceName") value = await get_or_insert('devices', 'name', value);
                    if (key === "applicationName") value = await get_or_insert('applications', 'name', value);
                    if (key === "severity") value = parseInt(value, 10);
    
                    return [key, convertToNull(value)];
                }))
            );
    
            const [existingTasks] = await db.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);
    
            if (existingTasks.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
    
            // Check if the information being updated has new information
            const existingTask = existingTasks[0];
            const newTasks = Object.fromEntries(
                Object.entries(existingTask).map(([key, value]) => [
                    key, key.toLowerCase().includes('date')
                        ? (value ? value.toLocaleDateString('en-CA') : null)
                        : convertToNull(value)
                ])
            );
    
            const hasChanged = Object.entries(validatedFields).some(([key, newValue]) => {
                return newTasks[key] !== newValue;
            });    
    

            if (!hasChanged) {
                return res.json({ success: false, message: 'No changes detected, task not updated.' });
            }
    
            const updatedFields = [...Object.values(validatedFields), taskId];
    
            const [result] = await db.query(`
                UPDATE tasks SET 
                    taskDate = ?, taskStatus = ?, severity = ?, taskType = ?, 
                    taskDescription = ?, itInCharge = ?, department = ?, departmentNo = ?, 
                    requestedBy = ?, approvedBy = ?, itemName = ?, deviceName = ?, 
                    applicationName = ?, dateReq = ?, dateRec = ?, dateStart = ?, dateFin = ?, problemDetails = ?, remarks = ?
                WHERE taskId = ?
            `, updatedFields);
    
            if (result.affectedRows > 0) {
                res.json({ success: true, message: 'Task updated successfully' });
            } else {
                res.status(404).json({ error: 'Task not found' });
            }
        } catch (err) {
            console.error('Error updating task:', err);
            res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
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

    // search_and_filter: function(checking) {
    //     let search_task = ['taskType', 'taskDescription', 'problemDetails', 'remarks'];
    //     let filter_task = ['taskType', 'taskDescription', 'taskDate', 'requestedBy', 'taskStatus', 'department', 'severity' ];




    // },

    get_task: async function (db, req, res) {
        const { search, filterBy, value } = req.query; 
    
        let type = ['taskType', 'taskDescription', 'problemDetails', 'remarks'];

        try {
            let tasks;
            
            if (search && filterBy && value) {
                // Apply both search for taskType and filter for another field
                if (filterBy == 'taskDate' || filterBy == 'department') {
                    tasks = await task.fetching_tasks(db, true, search, type, value, filterBy, value);
                } else {
                    tasks = await task.fetching_tasks(db, true, search, type, 'DESC', filterBy, value);
                }
            } else if (search) {
                // Apply only search for taskType
                tasks = await task.fetching_tasks(db, true, search, type, 'DESC');
            } else if (filterBy && value) {
                // Apply only filter
                if (filterBy == 'taskDate' || filterBy == 'department') {
                    tasks = await task.fetching_tasks(db, false, null, filterBy, value);
                } else {
                    tasks = await task.fetching_tasks(db, true, value, filterBy, 'DESC');
                }
            } else {
                tasks = await task.fetching_tasks(db, false, null, 'id');
            }
    
            res.status(200).json(tasks);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    get_reference_table: async function(db, req, res, tableName, validTables) {
        try {
            // const validTables = ['task_types', 'it_in_charge', 'departments', 'items', 'devices', 'applications', 'users'];

            if (!validTables.includes(tableName)) {
                return res.status(400).json({ error: 'Invalid reference table' });
            }
            
            let rows;

            // Optimize pa paps
            if (tableName === 'requested_by') {
                [rows] = await db.query(`
                    SELECT requested_by.id, requested_by.full_name, departments.name, departments.department_no
                    FROM requested_by 
                    LEFT JOIN departments ON requested_by.department = departments.id
                    WHERE requested_by.id != 1
                    ORDER BY id DESC
                `);
            } else if(tableName == "approved_by") {
                [rows] = await db.query(`
                    SELECT approved_by.id, approved_by.full_name, app_departments.name
                    FROM approved_by 
                    LEFT JOIN app_departments ON approved_by.department = app_departments.id
                    WHERE approved_by.id != 1
                    ORDER BY id DESC
                `);
            } else if (tableName === 'it_in_charge') {
                [rows] = await db.query(`
                    SELECT id, full_name FROM it_in_charge 
                    WHERE id != 1
                    ORDER BY id DESC
                `);   
            } else {
                [rows] = await db.query(`SELECT * FROM ?? WHERE id != 1 ORDER BY id DESC`, [tableName]);
            }
            
            return res.json(rows);
            

        } catch(err) {
            console.error('Error fetching referenced table:', err);
            res.status(500).json({ err: 'Internal server error' });
        }
    },

    add_reference: async function(db, req, res, tableName, validTables) {

        let counter = 0;
        try {
            if (!validTables.includes(tableName)) {
                return res.status(400).json({ error: 'Invalid reference table' });
            }

            console.log("Counter:", counter++);

            let query = "";
            let values = [];

            switch(tableName) {
                case 'requested_by':
                    let req_full_name = req.body.reqName.trim();
                    let req_parts = req_full_name.split(/\s+/);
                    let req_first  = req_parts[0];
                    let req_last = req_parts.length > 1 ? req_parts.slice(1).join(' ') : '';
            
                    let req_query = `SELECT id FROM departments WHERE name = ?`;
                    let req_values = [req.body.reqDept];
            
                    const [req_result] = await db.query(req_query, req_values);
            
                    if (req_result.length > 0) {
                        let existingDepartment = req_result[0];
                
                        if (existingDepartment.department_no !== req.body.reqContact) {
                            console.log('Contact number mismatch: Current contact number:', existingDepartment.department_no, 'Provided contact number:', req.body.reqContact);
                
                            const updateDeptQuery = `UPDATE departments SET department_no = ? WHERE id = ?`;
                            const updateDeptValues = [req.body.reqContact, existingDepartment.id];
                
                            // Perform the update
                            await db.query(updateDeptQuery, updateDeptValues);
                            console.log('Contact number updated to:', req.body.reqContact);
                        }
                
                        let departmentId = existingDepartment.id;
                        query = `INSERT INTO requested_by (first_name, last_name, department) VALUES (?, ?, ?)`;
                        values = [req_first, req_last, departmentId];
                
                    } else {
                        console.log('Department not found, inserting new department...');
                        let insertDeptQuery = `INSERT INTO departments (name, department_no) VALUES (?, ?)`;
                        let insertValues = [req.body.reqDept, req.body.reqContact];
                
                        const [insertDeptResult] = await db.query(insertDeptQuery, insertValues);
                        let departmentId = insertDeptResult.insertId;
                        query = `INSERT INTO requested_by (first_name, last_name, department) VALUES (?, ?, ?)`;
                        values = [req_first, req_last, departmentId];
                    }
            
                    break;
            
                case 'approved_by':
                    let app_full_name = req.body.approvedName.trim();
                    let app_parts = app_full_name.split(/\s+/);
                    let app_first = app_parts[0];
                    let app_last = app_parts.length > 1 ? app_parts.slice(1).join(' ') : '';
                
                    let app_query = `SELECT id FROM app_departments WHERE name = ?`;
                    let app_values = [req.body.approvedDept];
            
                    const [app_result] = await db.query(app_query, app_values);
                    console.log("App",app_result);
                    if (app_result.length > 0) {
                        let departmentId = app_result[0].id;
                        query = `INSERT INTO approved_by (first_name, last_name, department) VALUES (?, ?, ?)`;
                        values = [app_first, app_last, departmentId];
                    } else {
                        let insertDeptQuery = `INSERT INTO app_departments (name) VALUES (?)`;
                        let insertValues = [req.body.approvedDept];
            
                        const [insertDeptResult] = await db.query(insertDeptQuery, insertValues);
                        let departmentId = insertDeptResult.insertId;
                        query = `INSERT INTO approved_by (first_name, last_name, department) VALUES (?, ?, ?)`;
                        values = [app_first, app_last, departmentId];
                    }
                
                    break;
                
                case 'task_types':
                    query = `INSERT INTO task_types (name, description) VALUES (?, ?)`;
                    values = [req.body.newTask, req.body.newDescription];
                    break;
                case 'it_in_charge':

                    let it_full_name = req.body.newIt.trim();
                    let it_parts = it_full_name.split('/\s+/');
                    let it_first  = it_parts[0];
                    let it_last = it_parts.length > 1 ? nameParts.slice(1).join(' ') : '';

                    query = `INSERT INTO it_in_charge (first_name, last_name) VALUES (?, ?)`;
                    values = [it_first, it_last];
                    break;
                case 'items':
                    query = `INSERT INTO items (name) VALUES (?)`;
                    values = [req.body.newItem];
                    break;
                case 'devices':
                    query = `INSERT INTO devices (name) VALUES (?)`;
                    values = [req.body.newDevice];
                    break;
                case 'applications':
                    query = `INSERT INTO applications (name) VALUES (?)`;
                    values = [req.body.newApp];
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid table selection' });
            }

            const [result] = await db.query(query, values); // Execute the query
            res.status(201).json({ message: `Record inserted into ${tableName}`, result });

            // if (tableName === 'users') {
            //     [rows] = await db.query(`INSERT INTO users VALUES`)
            // }

        } catch (err) {
            console.error("Error adding to referenced table:", err);
            res.status(500).json({ err: 'Internal server error'});
        }
    },

    update_reference: async function(db, req, res, tableName, validTables) {
         try {
            if (!validTables.includes(tableName)) {
                return res.status(400).json({ error: 'Invalid reference table' });
            }

            let query = "";
            let values = [];
    
            switch(tableName) {
                case 'task_types':
                    query = `UPDATE task_types SET name = ?, description = ? WHERE id = ?`;
                    values = [req.body.val.name, req.body.val.description, req.body.id];
                    break;
                case 'requested_by':
                case 'approved_by':
                    let req_full_name = req.body.val.full_name.trim();
                    let req_parts = req_full_name.split(/\s+/);
                    let req_first  = req_parts[0];
                    let req_last = req_parts.length > 1 ? req_parts.slice(1).join(' ') : '';

                    let department = (tableName == 'requested_by') ? 'departments' : 'app_departments';

                    let req_query = `SELECT id FROM ${department} WHERE name = ?`;
                    let req_values = [req.body.val.name];

                    const [req_result] = await db.query(req_query, req_values);

                    console.log(req_result);

                    if (req_result.length > 0) {
                        let existingDepartment = req_result[0];
                        console.log(existingDepartment);

                        const updateDeptQuery = (tableName == 'requested_by') ? 
                        `UPDATE departments SET department_no = ? WHERE id = ?` :
                        `UPDATE app_departments SET name = ? WHERE id = ?`;

                        const updateDeptValues = (tableName == 'requested_by') ?
                        [req.body.val.department_no, existingDepartment.id] :
                        [req.body.val.name, existingDepartment.id]
                
  
                        // Perform the update
                        await db.query(updateDeptQuery, updateDeptValues);
                        console.log('Contact number updated to:', req.body.val.department_no);
                
                        let departmentId = existingDepartment.id;
                        query = `UPDATE ${tableName} SET first_name = ?, last_name = ?, department = ? WHERE id = ?`;
                        values = [req_first, req_last, departmentId, req.body.id];
                
                    } else {
                        console.log('Department not found, inserting new department...');
                        let insertDeptQuery = (tableName == 'requested_by') ? 
                        `INSERT INTO departments (name, department_no) VALUES (?, ?)` :
                        `INSERT INTO app_departments (name) VALUES (?)`;
                        let insertValues = (tableName == 'requested_by') ?
                        [req.body.val.name, req.body.val.department_no] : [req.body.val.name]
                        // let insertDeptQuery = `INSERT INTO departments (name, department_no) VALUES (?, ?)`;
                        // let insertValues = [req.body.val.dep_name, req.body.val.dep_no];

                        const [insertDeptResult] = await db.query(insertDeptQuery, insertValues);

                        let departmentId = insertDeptResult.insertId;
                        query = `UPDATE ${tableName} SET first_name =?, last_name =?, department = ? WHERE id = ?`;
                        values = [req_first, req_last, departmentId, req.body.id];
                    }
                    break;
                case 'it_in_charge':
                    let it_full_name = req.body.val.full_name.trim();
                    let it_parts = it_full_name.split('/\s+/');
                    let it_first  = it_parts[0];
                    let it_last = it_parts.length > 1 ? nameParts.slice(1).join(' ') : '';

                    query = `UPDATE it_in_charge SET first_name = ?, last_name = ? WHERE id = ?`;
                    values = [it_first, it_last, req.body.id];
                    break;
                case 'items':
                    query = `UPDATE items SET name = ? WHERE id = ?`;
                    values = [req.body.val.name, req.body.id];
                    break;
                case 'devices':
                    query = `UPDATE devices SET name = ? WHERE id = ?`;
                    values = [req.body.val.name, req.body.id];
                    break;
                case 'applications':
                    query = `UPDATE applications SET name = ? WHERE id = ?`;
                    values = [req.body.val.name, req.body.id];
                    break;
            

                default: 
                    return res.status(400).json({ error: 'Invalid table selection' });
            }

            const [result] = await db.query(query, values);
            res.status(201).json({ message: `Updated ${tableName} Record:`, result });
            // res.status(201).json({ success: true });
         } catch(err) {
            console.error("Error updating referenced table:", err);
            res.status(500).json({ err: 'Internal server error'});
         }
    },

    search_reference: async function(db, req, res, validTables) {
        const { table, lookupSearch, check } = req.query;
        try {

            if (check === 'false') {
                return task.get_reference_table(db, req, res, table, validTables);
            }

            if (!validTables.includes(table)) {
                return res.status(400).json({ error: 'Invalid table name' });
            }

            const tableColumns = {
                'task_types': ['name', 'description'],
                'requested_by': ['full_name'], 
                'approved_by': ['full_name'], 
                'it_in_charge': ['full_name'],
                'devices': ['name'],
                'items': ['name'],
                'applications': ['name']
            }
            const tableJoins = {
                'requested_by': {
                    department: ['departments.name', 'departments.department_no'] 
                },
                'approved_by': {
                    department: ['app_departments.name']  
                }
            };

            let selectedColumns = tableColumns[table].map(col => `${table}.${col}`);
            if (tableJoins[table]) {
                selectedColumns.push(...tableJoins[table].department);
            }
            
            const tableId = table === 'requested_by' ? 'requested_by.id' : (table === 'approved_by' ? 'approved_by.id' : 'id');
            let baseQuery = `SELECT ${selectedColumns.join(', ')} FROM ${table}`;
            
            if (tableJoins[table]) {
                baseQuery += ` LEFT JOIN ${table === 'requested_by' ? 'departments' : 'app_departments'} ON ${table}.department = ${table === 'requested_by' ? 'departments.id' : 'app_departments.id'}`
            }

            let whereClause = selectedColumns.map(col => `${col} LIKE ?`).join(' OR ');
            whereClause = `(${whereClause}) AND ${tableId} != 1`;
            console.log(whereClause);
            baseQuery += ` WHERE ${whereClause} ORDER BY ${tableId} DESC`;

            let queryParams = selectedColumns.map(() => `%${lookupSearch}%`);

            const [results] = await db.query(baseQuery, queryParams);

            console.log(results);
    
            res.status(200).json(results);
        } catch (err) {
            console.error("Error searching referenced table:", err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export const limiter = {
    login_limit: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // Max 10 task submissions per 15 minutes
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

const referencedTables = ["applications", "approved_by", "requested_by", "it_in_charge", "devices", "items", "task_types"];

const checkTable = (tableName) => {
    switch (tableName) {
        case "applications": return { columnName: "applicationName", identifier: "name" };
        case "approved_by": return { columnName: "approvedBy", identifier: "full_name" };
        case "requested_by": return { columnName: "requestedBy", identifier: "full_name" };
        case "it_in_charge": return { columnName: "itInCharge", identifier: "full_name" };
        case "devices": return { columnName: "deviceName", identifier: "name" };
        case "items": return { columnName: "itemName", identifier: "name" };
        case "task_types": return { columnName: "taskType", identifier: "name" };
        default: return { columnName: "", identifier: "" };
    }
};


export const createTrigger = async (db) => {
    for (const table of referencedTables) {
        const { columnName, identifier } = checkTable(table);
        if (!columnName || !identifier) continue; // Skip if table isn't properly mapped

        const name = `after_delete_${table}`;
        const query = `
            CREATE TRIGGER ${name}
            AFTER DELETE ON ${table}
            FOR EACH ROW
            BEGIN
                UPDATE tasks
                SET ${columnName} = (SELECT id FROM ${table} WHERE ${identifier} = 'Unknown' LIMIT 1)
                WHERE ${columnName} IS NULL;
            END;
        `;

        try {
            await db.query(`DROP TRIGGER IF EXISTS ${name}`);
            await db.query(query);
            console.log(`Trigger ${name} created successfully!`);
        } catch (err) {
            if (err.code === 'ER_TRG_ALREADY_EXISTS') {
                console.log(`Trigger ${name} already exists.`);
            } else {
                console.error(`Error creating trigger ${name}:`, err);
            }
        }
    }
};

