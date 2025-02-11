import express from 'express';
import path from 'path';
import connectLivereload from 'connect-livereload';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { server, account, task, limiter } from './functions-app.js';

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

// Prevent storing history
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static files from the "internal" folder
app.use('/internal', express.static(easyPath));

// API endpoint to get session user
app.get('/api/:type', async (req, res) => {
    const { type } = req.params;
    const db = app.locals.db;

    try {
        switch(type) {
            case 'session-user':
                await task.sessionUser(db, req, res);
                break;
            case 'tasks':
                await task.getTask(db, req, res);
                break;
            default:
                res.status(400).json({ error: 'Invalid task type' });
        }
    } catch (err) {
        console.error('Error in task API:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/check-session', (req, res) => {
    if (req.session && req.session.username) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

app.use('/internal/public', express.static(path.join(easyPath, 'public')));
app.use('/internal/protected', express.static(path.join(easyPath, 'protected')));

const validViews = ['sign-in'];

app.get('/internal/:page/:view?', (req, res) => {
    const { page, view } = req.params;

    server.getValidPages(easyPath, (err, { public: publicPages, protected: protectedPages }) => {
        if (err) return res.status(500).send('Error reading files');

        if (publicPages.includes(page)) {
            if (page === 'login' && (!view || validViews.includes(page))) {
                return server.isAuthenticated(req, res, () => servePage(res, path.join(easyPath, 'public', `${page}.html`)));
            }
            return server.servePage(res, path.join(easyPath, 'public', `${page}.html`));
        }

        if (protectedPages.includes(page)) {
            return server.isAuthenticated(req, res, () => {
                server.servePage(res, path.join(easyPath, 'protected', `${page}.html`));
            });
        }

        return res.status(404).send('Page not found');
    });
});

// API to submit / filter a task
app.post('/api/tasks/:type', async (req, res) => {
    const { type } = req.params;
    const db = app.locals.db;

    try {
        switch(type) {
            case 'add':
                await task.addTask(db, req, res);
                break;
            case 'search-input':
                await task.searchTask(db, req, res);
                break;
            case 'filterBy':
                await task.filterBy(db, req, res);
                break;
            default:
                res.status(400).json({ error: 'Invalid task type' });
        }
    } catch (err) {
        console.error('Error in task API:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
app.post('/api/auth/:action', async (req, res) => {
    const { action } = req.params;

    if (action === 'sign-in') {
        const { username, password } = req.body;
        return account.signIn(app, req, res, username, password);
    } 
    
    if (action === 'create-account') {
        const { username, name, password } = req.body;
        return account.createAccount(app, req, res, username, name, password);
    }

    return res.status(400).json({ error: 'Invalid authentication action' })
})

// Logout route
app.post('/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Failed to log out' });

        res.clearCookie('connect.sid', { path: '/' });
        res.status(200).json({ success: true });
    });
});

// Delete Tasks
app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
        const db = app.locals.db;
        const { taskId } = req.params;

        console.log(`Attempting to delete task with ID: ${taskId}`);

        // Check if task exists before deleting
        const [taskExists] = await db.query('SELECT * FROM tasks WHERE taskId = ?', [taskId]);
        if (taskExists.length === 0) {
            console.warn(`Task ID ${taskId} not found in database.`);
            return res.status(404).json({ error: 'Task not found' });
        }

        // Execute DELETE query
        const [result] = await db.query('DELETE FROM tasks WHERE taskId = ?', [taskId]);

        if (result.affectedRows > 0) {
            console.log(`Task ID ${taskId} successfully deleted.`);
            res.json({ success: true, message: 'Task deleted successfully' });
        } else {
            console.error(`Task ID ${taskId} not deleted. Check database constraints.`);
            res.status(500).json({ error: 'Failed to delete task' });
        }

    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Edit Tasks
app.put('/api/tasks/:taskId', async (req, res) => {
    try {
        const db = app.locals.db;
        const taskId = req.params.taskId;

        // const {
        //     taskDate, taskStatus, severity, taskType, taskDescription,
        //     itInCharge, department, departmentNo, requestedBy, approvedBy, itemName, deviceName, applicationName,
        //     dateReq, dateRec, dateStart, dateFin
        // } = req.body;

        // Convert empty values to NULL
        const convertToNull = (value) => (value === '' ? null : value);
        const isValidDate = (dateString) => /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;

        const validatedFields = Object.fromEntries(
            Object.entries(req.body).map(([key, value]) => [
                key, key.toLowerCase().includes('date') ? isValidDate(value) : convertToNull(value)
            ])
        );

        // const updatedFields = [
        //     isValidDate(taskDate), convertToNull(taskStatus), convertToNull(severity), convertToNull(taskType),
        //     convertToNull(taskDescription), convertToNull(itInCharge), convertToNull(department), convertToNull(departmentNo),
        //     convertToNull(requestedBy), convertToNull(approvedBy), convertToNull(itemName), convertToNull(deviceName),
        //     convertToNull(applicationName), isValidDate(dateReq), isValidDate(dateRec), isValidDate(dateStart),
        //     isValidDate(dateFin), taskId
        // ];

        const updatedFields = [...Object.values(validatedFields), taskId];

        const [result] = await db.query(`
            UPDATE tasks SET 
                taskDate = ?, taskStatus = ?, severity = ?, taskType = ?, 
                taskDescription = ?, itInCharge = ?, department = ?, departmentNo = ?, 
                requestedBy = ?, approvedBy = ?, itemName = ?, deviceName = ?, 
                applicationName = ?, dateReq = ?, dateRec = ?, dateStart = ?, dateFin = ?
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
});

// Fallback route for unmatched paths
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start the server
server.launchServer(app);