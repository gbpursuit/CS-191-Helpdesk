import express from 'express';
import path from 'path';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const liveReloadServer = livereload.createServer({
    exts: ["html", "css", "js"],
    delay: 100,
});

// Middleware to simulate authentication
function isAuthenticated(req, res, next) {
    const authenticated = true;
    if (authenticated) {
        return next();
    }
    res.status(403).send('Access Denied');
}

// Watch the 'internal' directory
liveReloadServer.watch(path.join(__dirname, 'internal'));

const app = express();
app.use(connectLivereload());
app.use('/internal', isAuthenticated, express.static(path.join(__dirname, 'internal')));

// Start the server
const PORT = 3000; // Will change the port next time
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/internal/login.html`);
});
