// Import the required modules
const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

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

liveReloadServer.watch(path.join(__dirname, 'internal'));

const app = express()
app.use(connectLivereload());
app.use('/internal', isAuthenticated, express.static(path.join(__dirname, 'internal')));

// Start the server
const PORT = 3000; // Will change the port next time
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/internal/login.html`);
});