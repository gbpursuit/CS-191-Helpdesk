// import 'dotenv/config'; //npm install dotenv
// import dotenv from 'dotenv';
// import express from 'express';
// import path from 'path';
// import connectLivereload from 'connect-livereload';
// import session from 'express-session';
// import multer from 'multer'; //npm install multer
// import { fileURLToPath } from 'url';
// import { server, account, task, limiter } from './functions-app.js';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const easyPath = path.join(__dirname, 'internal')

// const uploadDir = path.join(__dirname, "uploads");

// // Ensure the uploads directory exists
// import fs from "fs";
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// // Set up Multer storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/"); // Save files in the "uploads" directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}_${file.originalname}`); // Unique filename
//     }
// });

// const upload = multer({ storage });

// const app = express();
// app.use(connectLivereload());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Session configuration
// app.use(
//     session({
//         secret: process.env.SESSION_SECRET, // Store secret in .env
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             secure: process.env.COOKIE_SECURE === 'true', // Only secure in production - HTTP
//             httpOnly: true, // Prevents JavaScript access
//             sameSite: 'strict', // CSRF protection
//             maxAge: 60 * 60 * 1000, // you can refresh the timed session
//         },
//     })
// );

// app.get('/session-info', server.is_authenticated, (req, res) => {
//     if (req.session) {
//         const expiresAt = req.session.cookie.expires;
//         res.json({ expiresAt });
//     } else {
//         res.json({ expiresAt: null });
//     }
// })

// // Prevent storing history
// app.use((req, res, next) => {
//     res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//     next();
// });

// // Serve static files from the "internal" folder
// app.use('/internal', express.static(easyPath));

// // API endpoint to get session user / tasks
// app.get('/api/:type', async (req, res, next) => {
//     const { type } = req.params;
//     const db = app.locals.db;

//     try {
//         if (type === 'tasks') {
//             return server.is_authenticated(req, res, async () => {
//                 await task.get_task(db, req, res);
//             });
//         } 

//         if (type === 'users') {
//             return await task.get_user(db, req, res);
//         }
        
//         if (type === 'session-user') {
//             return await task.session_user(db, req, res);
//         }

//         res.status(400).json({ error: 'Invalid task type' });

//     } catch (err) {
//         console.error('Error in task API:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// app.use('/internal/public', express.static(path.join(easyPath, 'public')));
// app.use('/internal/protected', express.static(path.join(easyPath, 'protected')));

// app.get('/internal/:page/:view?', (req, res) => {
//     const { page, view } = req.params;

//     server.get_valid_pages(easyPath, (err, { public: publicPages, protected: protectedPages }) => {
//         if (err) return res.status(500).send('Error reading files');

//         const matchPub = publicPages.find(p => p.endsWith(`/${page}.html`) || p === `${page}.html`);
//         const matchPro = protectedPages.find(p => p.endsWith(`/${page}.html`) || p === `${page}.html`);
        

//         if (matchPub) {
//             if (page === 'login' && (!view || view === 'logged-in')) {
//                 return server.is_authenticated(req, res, () => server.serve_page(res, `${matchPub}`));
//             }
//             return server.serve_page(res, `${matchPub}`);
//         }

//         if (matchPro) {
//             return server.is_authenticated(req, res, () => server.serve_page(res, `${matchPro}`));
//         }

//         return res.status(404).send('Page not found');
//     });
// });

// // API to submit / filter a task
// app.post('/api/tasks/:type', server.is_authenticated, limiter.task_limit, async (req, res) => {
//     const { type } = req.params;
//     const db = app.locals.db;

//     try {
//         switch(type) {
//             case 'add':
//                 await task.add_task(db, req, res);
//                 break;
//             default:
//                 res.status(400).json({ error: 'Invalid task type' });
//         }
//     } catch (err) {
//         console.error('Error in task API:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Serve uploaded images statically
// app.use("/uploads", express.static(uploadDir));

// // API to handle profile image upload
// app.post("/api/upload-profile-image", server.is_authenticated, upload.single("profileImage"), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//     }

//     const db = req.app.locals.db; // Get the database connection
//     const username = req.session.username; // Get user ID from session
//     const imagePath = `/uploads/${req.file.filename}`; // Path to store in DB

//     try {
//         // Update the user's profile image in the database
//         await db.query("UPDATE users SET profile_image = ? WHERE username = ?", [imagePath, username]);
//         res.json({ imageUrl: imagePath, message: "Profile image updated successfully!" });
//     } catch (error) {
//         console.error("Database error:", error);
//         res.status(500).json({ error: "Database update failed" });
//     }
// });

// // Login route
// app.post('/api/auth/:action', limiter.login_limit, async (req, res) => {
//     const { action } = req.params;

//     if (action === 'sign-in') {
//         const { username, password } = req.body;
//         return account.sign_in(app, req, res, username, password);
//     } 
    
//     if (action === 'create-account') {
//         const { username, name, password } = req.body;
//         return account.create_account(app, req, res, username, name, password);
//     }

//     return res.status(400).json({ error: 'Invalid authentication action' })
// })

// // Logout route
// app.post('/logout', server.is_authenticated, (req, res) => {

//     req.session.destroy((err) => {
//         if (err) return res.status(500).json({ error: 'Failed to log out' });

//         res.clearCookie('connect.sid', { path: '/' });
//         res.status(200).json({ success: true });
//     });
// });

// // Check if Task is cancelled already 
// app.get('/api/tasks/:taskId', server.is_authenticated, async (req, res) => {
//     try {
//         const db = app.locals.db;
//         const { taskId } = req.params;

//         // Fetch the task
//         const [task] = await db.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);

//         if (task.length === 0) {
//             return res.status(404).json({ error: 'Task not found' });
//         }

//         res.json(task[0]);
//     } catch (err) {
//         console.error('Error fetching task:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Cancel Task (User Role)
// app.put('/api/tasks/:taskId/cancel', server.is_authenticated, async (req, res) => {
//     try {
//         const db = app.locals.db;
//         const { taskId } = req.params;

//         const [taskExists] = await db.query('SELECT * FROM tasks where taskId = ?', [taskId]);
//         if (taskExists.length === 0) {
//             console.warn(`ask ID ${taskId} not found in database.`);
//             return res.status(404).json({ error: 'Task not found' });
//         }

//         const [result] = await db.query(
//             `UPDATE tasks SET taskStatus = ? WHERE taskId = ?`,
//             ['Cancelled', taskId]
//         );

//         if (result.affectedRows > 0) {
//             res.json({ success: true, message: `Task ${taskId} cancalled successfully` });
//         } else {
//             res.status(404).json({ error: 'Task not found' });
//         }
        
//     } catch (err) {
//         console.error('Error canceling task:', err);
//         res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
//     }
// })

// // Edit Tasks
// app.put('/api/tasks/:taskId', server.is_authenticated, async (req, res) => {
//     try {
//         const db = app.locals.db;
//         const taskId = req.params.taskId;

//         // Convert empty values to NULL
//         const convertToNull = (value) => (value === '' ? null : value);
//         const isValidDate = (dateString) => /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;
//         // const formatDate = (date) => (date === null ? "--" : date); 

//         // Normalize values in req.body
//         const validatedFields = Object.fromEntries(
//             Object.entries(req.body).map(([key, value]) => [
//                 key, key.toLowerCase().includes('date') 
//                 ? isValidDate(value) : convertToNull(value)
//             ])
//         );

//         const [existingTasks] = await db.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);

//         if (existingTasks.length === 0) {
//             return res.status(404).json({ error: 'Task not found' });
//         }

//         // Check if the information being updated has new information
//         const existingTask = existingTasks[0];
//         const newTasks = Object.fromEntries(
//             Object.entries(existingTask).map(([key, value]) => [
//                 key, key.toLowerCase().includes('date')
//                     ? (value ? value.toLocaleDateString('en-CA') : null)
//                     : convertToNull(value)
//             ])
//         );

//         const hasChanged = Object.entries(validatedFields).some(([key, newValue]) => {
//             return newTasks[key] !== newValue;
//         });


//         if (!hasChanged) {
//             return res.json({ success: false, message: 'No changes detected, task not updated.' });
//         }

//         const updatedFields = [...Object.values(validatedFields), taskId];

//         const [result] = await db.query(`
//             UPDATE tasks SET 
//                 taskDate = ?, taskStatus = ?, severity = ?, taskType = ?, 
//                 taskDescription = ?, itInCharge = ?, department = ?, departmentNo = ?, 
//                 requestedBy = ?, approvedBy = ?, itemName = ?, deviceName = ?, 
//                 applicationName = ?, dateReq = ?, dateRec = ?, dateStart = ?, dateFin = ?, problemDetails = ?, remarks = ?
//             WHERE taskId = ?
//         `, updatedFields);

//         if (result.affectedRows > 0) {
//             res.json({ success: true, message: 'Task updated successfully' });
//         } else {
//             res.status(404).json({ error: 'Task not found' });
//         }
//     } catch (err) {
//         console.error('Error updating task:', err);
//         res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
//     }
// });

// // Fallback route for unmatched paths
// app.use((req, res) => {
//     res.status(404).send('Page not found');
// });

// // Start the server
// server.update_dump();
// server.launch_server(app);

import 'dotenv/config';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import connectLivereload from 'connect-livereload';
import session from 'express-session';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { server, account, task, limiter, createTrigger } from './functions-app.js';
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const easyPath = path.join(__dirname, 'internal');
const uploadDir = path.join(__dirname, "uploads");

// ---- App Initialization ----
const app = express();
app.use(connectLivereload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Session Configuration ----
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.COOKIE_SECURE === 'true',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
        },
    })
);

// ---- Middleware ----
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files
app.use('/internal', express.static(easyPath));
app.use('/internal/public', express.static(path.join(easyPath, 'public')));
app.use('/internal/protected', express.static(path.join(easyPath, 'protected')));
app.use("/uploads", express.static(uploadDir));

// ---- Profile Picture Logic ----
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

app.post("/api/upload-profile-image", server.is_authenticated, upload.single("profileImage"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const db = req.app.locals.db;
    const username = req.session.username;
    const imagePath = `/uploads/${req.file.filename}`;

    try {
        await db.query("UPDATE users SET profile_image = ? WHERE username = ?", [imagePath, username]);
        res.json({ imageUrl: imagePath, message: "Profile image updated successfully!" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database update failed" });
    }
});

// ---- Authentication Routes ----
app.get('/session-info', server.is_authenticated, (req, res) => {
    if (req.session) {
        const expiresAt = req.session.cookie.expires;
        res.json({ expiresAt });
    } else {
        res.json({ expiresAt: null });
    }
});

// Login Route
app.post('/api/auth/:action', limiter.login_limit, async (req, res) => {
    const { action } = req.params;
    if (action === 'sign-in') return account.sign_in(app, req, res, req.body.username, req.body.password);
    if (action === 'create-account') return account.create_account(app, req, res, req.body.username, req.body.name, req.body.password);
    res.status(400).json({ error: 'Invalid authentication action' });
});

// Logout Route
app.post('/logout', server.is_authenticated, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Failed to log out' });
        res.clearCookie('connect.sid', { path: '/' }).status(200).json({ success: true });
    });
});

// ---- Task Routes ----
const validTables = ['task_types', 'it_in_charge', 'items', 'devices', 'applications', 'requested_by', 'approved_by'];

// API endpoint to get session user / tasks
app.get('/api/:type/:table?', async (req, res, next) => {
    const { type, table: refTable} = req.params;
    const db = app.locals.db;

    try {
        const actions = {
            'tasks': () => server.is_authenticated(req, res, async () => await task.get_task(db, req, res)),
            'users': async () => await task.get_user(db, req, res),
            'session-user': async () => await task.session_user(db, req, res),
            'ref-table': async() => await task.get_reference_table(db, req, res, refTable, validTables)
        };

        return actions[type] ? await actions[type]() : res.status(400).json({ error: 'Invalid task type' });
    } catch (err) {
        console.error('Error in task API:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API to submit a task
app.post('/api/tasks/:type', server.is_authenticated, limiter.task_limit, async (req, res) => {
    const { type } = req.params;
    const db = app.locals.db;

    try {
        const actions = {
            'add': async () => await task.add_task(db, req, res, validTables)
        };

        return actions[type] ? await actions[type]() : res.status(400).json({ error: 'Invalid task type' });
    } catch (err) {
        console.error('Error in task API:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check if Task is cancelled already 
app.get('/api/tasks/:taskId', server.is_authenticated, async (req, res) => {
    try {
        const db = app.locals.db;
        const { taskId } = req.params;
        const [task] = await db.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);
        if (task.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.json(task[0]);
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel Task (User Role)
app.put('/api/tasks/:taskId/cancel', server.is_authenticated, async (req, res) => {
    try {
        const db = app.locals.db;
        const { taskId } = req.params;

        const [taskExists] = await db.query('SELECT * FROM tasks where taskId = ?', [taskId]);
        if (taskExists.length === 0) {
            console.warn(`ask ID ${taskId} not found in database.`);
            return res.status(404).json({ error: 'Task not found' });
        }

        const [result] = await db.query(
            `UPDATE tasks SET taskStatus = ? WHERE taskId = ?`,
            ['Cancelled', taskId]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: `Task ${taskId} cancalled successfully` });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
        
    } catch (err) {
        console.error('Error canceling task:', err);
        res.status(500).json({ error: err.sqlMessage || 'Internal server error' });
    }
})

// Edit Tasks
app.put('/api/tasks/:taskId', server.is_authenticated, async (req, res) => {
    try {
        await task.update_task(app.locals.db, req, res);
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/internal/:page/:view?', (req, res) => {
    const { page, view } = req.params;
    server.get_valid_pages(easyPath, (err, { public: publicPages, protected: protectedPages }) => {
        if (err) return res.status(500).send('Error reading files');
        
        const matchPub = publicPages.find(p => p.endsWith(`/${page}.html`) || p === `${page}.html`);
        const matchPro = protectedPages.find(p => p.endsWith(`/${page}.html`) || p === `${page}.html`);
        
        if (matchPub) {
            if (page === 'login' && (!view || view === 'logged-in')) {
                return server.is_authenticated(req, res, () => server.serve_page(res, `${matchPub}`));
            }
            return server.serve_page(res, `${matchPub}`);
        }
        if (matchPro) return server.is_authenticated(req, res, () => server.serve_page(res, `${matchPro}`));
        return res.status(404).send('Page not found');
    });
});

// Lookup Tables

// API Endpoint for Task Add, Edit, Delete
app.post('/api/ref-table/:table', server.is_authenticated, async(req, res) => {
    const { table: refTable} = req.params;
    const db = app.locals.db;

    try {
        await task.add_reference(db, req, res, refTable, validTables);
    } catch (err) {
        console.error('Error in adding in reference table:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/edit-table/:table', server.is_authenticated, async(req, res) => {
    const { table: refTable } = req.params;
    const db = app.locals.db;

    try {
        await task.update_reference(db, req, res, refTable, validTables);
    } catch(err) {
        console.error('Error in adding in reference table:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/delete-table/:table/:id', server.is_authenticated, async (req, res) => {
    const { table: refTable, id } = req.params;
    const db = app.locals.db;

    if (!validTables.includes(refTable)) {
        console.error("Received invalid table name:", refTable);
        return res.status(400).json({ error: `Invalid table name: ${refTable}` });
    }

    try {
        const [result] = await db.query(`DELETE FROM ?? WHERE id = ?`, [refTable, parseInt(id)]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: `Row deleted successfully` });
        } else {
            res.status(404).json({ error: "Row not found" });
        }
    } catch (err) {
        console.error('Error deleting row:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/search-table/:table/:query/:check', server.is_authenticated, async(req, res) => {
    const { table, query, check } = req.params;
    // const { query, check } = req.query;
    const db = app.locals.db;

    console.log(table, query, check);

    if (!validTables.includes(table)) {
        console.error("Received invalid table name:", table);
        return res.status(400).json({ error: `Invalid table name: ${table}` });
    }

    try {
        await task.search_reference(db, req, res, table, query, check, validTables);

    } catch (err) {
        console.error(`Error deleting row:`, err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Fallback route for unmatched paths
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// ---- Start Server ----
server.update_dump();
server.launch_server(app);

// Delete Tasks -- for admin only (future implement)
// app.delete('/api/tasks/:taskId', server.is_authenticated, limiter.delete_limit, async (req, res) => {
//     try {
//         const db = app.locals.db;
//         const { taskId } = req.params;

//         console.log(`Attempting to delete task with ID: ${taskId}`);

//         // Check if task exists before deleting
//         const [taskExists] = await db.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);
//         if (taskExists.length === 0) {
//             console.warn(`Task ID ${taskId} not found in database.`);
//             return res.status(404).json({ error: 'Task not found' });
//         }

//         // Execute DELETE query
//         const [result] = await db.query('DELETE FROM tasks WHERE taskId = ?', [taskId]);

//         if (result.affectedRows > 0) {
//             console.log(`Task ID ${taskId} successfully deleted.`);
//             res.json({ success: true, message: 'Task deleted successfully' });
//         } else {
//             console.error(`Task ID ${taskId} not deleted. Check database constraints.`);
//             res.status(500).json({ error: 'Failed to delete task' });
//         }

//     } catch (err) {
//         console.error('Error deleting task:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });