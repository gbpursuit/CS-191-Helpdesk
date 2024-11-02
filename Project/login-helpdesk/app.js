// Import the required modules
const express = require('express');
const path = require('path');

// Middleware to simulate authentication
function isAuthenticated(req, res, next) {
    // Replace with final logic if ever
    const authenticated = true;
    if (authenticated) {
        return next();
    }
    res.status(403).send('Access Denied');
}

const app = express()
app.use('/internal', isAuthenticated, express.static(path.join(__dirname, 'internal')));

// Start the server
const PORT = 3000; // You can change the port if needed
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});