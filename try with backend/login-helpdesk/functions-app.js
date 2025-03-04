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
            await restore_existing_database();
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

        if(bool && type && query) {
            if (Array.isArray(type)) {
                let typeConditions = type.map(() => `?? LIKE ?`).join(' OR ');
                conditions.push(`(${typeConditions})`);
                type.forEach(t => {
                    params.push(t, `%${query}%`);
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
        // let baseQuery = `SELECT * FROM tasks ${whereClause} ORDER BY ?? ${sortOrder}`;

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
                itInCharge.full_name AS itInCharge,
                departments.name AS department, 
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
            LEFT JOIN users AS itInCharge ON tasks.itInCharge = itInCharge.username
            LEFT JOIN departments ON tasks.department = departments.id
            LEFT JOIN users AS requestedUser ON tasks.requestedBy = requestedUser.username
            LEFT JOIN users AS approvedUser ON tasks.approvedBy = approvedUser.username
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

    add_task: async function (db, req, res) {
        try {
            const {
                taskId, taskDate, taskStatus, severity, taskType, taskDescription,
                itInCharge, department, departmentNo, requestedBy, approvedBy, itemName, deviceName, applicationName,
                dateReq, dateRec, dateStart, dateFin, problemDetails, remarks
            } = req.body;
    
            // async function get_or_insert(table, column, value) {
            //     if (!value) return null; // Handle NULL values
    
            //     // Check if value exists
            //     const [existing] = await db.query(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
            //     if (existing.length) return existing[0].id;
    
            //     // Insert new value and return ID
            //     const [result] = await db.query(`INSERT INTO ${table} (${column}) VALUES (?)`, [value]);
            //     return result.insertId; // return the id of newly created value
            // }
    
            async function get_or_insert(table, column, value) {
                if (!value) return null;
            
                // Check if value exists
                if (column === 'full_name') {
                    const [existing] = await db.query(`SELECT username FROM ${table} WHERE full_name = ?`, [value]);
                    return existing.length ? existing[0].username : null;
                }
            
                const [existing] = await db.query(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
                if (existing.length) return existing[0].id;
            
                if (column === 'full_name') {
                    throw new Error("Cannot insert into a generated column: full_name");
                }
            
                const [result] = await db.query(`INSERT INTO ${table} (${column}) VALUES (?)`, [value]);
                return result.insertId; 
            }

            // Convert incoming text values to their corresponding IDs
            const taskTypeId = await get_or_insert('task_types', 'name', taskType);
            const itInChargeId = await get_or_insert('users', 'full_name', itInCharge);
            const requestedById = await get_or_insert('users', 'full_name', requestedBy);
            const approvedById = await get_or_insert('users', 'full_name', approvedBy);
            const departmentId = await get_or_insert('departments', 'name', department);
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
                taskTypeId, taskDescription, itInChargeId, departmentId, 
                departmentNo, requestedById, approvedById, itemId, 
                deviceId, applicationId, convertDate(dateReq),
                convertDate(dateRec), convertDate(dateStart), convertDate(dateFin), problemDetails, remarks
            ]);
    
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
                if (column === 'full_name') {
                    const [existing] = await db.query(`SELECT username FROM ${table} WHERE full_name = ?`, [value]);
                    return existing.length ? existing[0].username : null;
                }
            
                const [existing] = await db.query(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
                if (existing.length) return existing[0].id;
            
                // If column is full_name, we should NEVER insert it
                if (column === 'full_name') {
                    throw new Error("Cannot insert into a generated column: full_name");
                }
            
                // Insert new value and return ID
                const [result] = await db.query(`INSERT INTO ${table} (${column}) VALUES (?)`, [value]);
                return result.insertId; // return the id of newly created value
            }

            const validatedFields = Object.fromEntries(
                await Promise.all(Object.entries(req.body).map(async ([key, value]) => {
                    if (key.toLowerCase().includes('date')) return [key, isValidDate(value)];
    
                    // Convert names to IDs for relevant fields
                    if (key === "taskType") value = await get_or_insert('task_types', 'name', value);
                    if (key === "itInCharge") value = await get_or_insert('users', 'full_name', value);
                    if (key === "requestedBy") value = await get_or_insert('users', 'full_name', value);
                    if (key === "approvedBy") value = await get_or_insert('users', 'full_name', value);
                    if (key === "department") value = await get_or_insert('departments', 'name', value);
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
    },

    get_reference_table: async function(db, req, res, tableName) {
        try {
            const validTables = ['task_types', 'it_in_charge', 'departments', 'items', 'devices', 'applications', 'users'];

            if (!validTables.includes(tableName)) {
                return res.status(400).json({ error: 'Invalid reference table' });
            }
            
            let rows;
            
            if (tableName === 'departments') {
                [rows] = await db.query(`SELECT * FROM departments WHERE id != 1`);
            } else if (tableName === 'users') {
                [rows] = await db.query(`
                    SELECT users.username, users.full_name, departments.name AS dep_name, departments.department_no AS dep_no
                    FROM users 
                    LEFT JOIN departments ON users.department = departments.id
                `);
            } else {
                [rows] = await db.query(`SELECT * FROM ??`, [tableName]);
            }
            
            res.json(rows);
            

        } catch(err) {
            console.error('Error fetching referenced table:', err);
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