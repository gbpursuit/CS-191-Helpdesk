import livereload from 'livereload';
import portfinder from 'portfinder';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDatabase } from './dbSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const watchPath = path.join(__dirname, 'internal');

export async function startLiveReload() {
    try {
        // Find the first available port for livereload (starting from 35729)
        portfinder.basePort = 35729;
        const availablePort = await portfinder.getPortPromise();

        // Create livereload server on the available port
        const liveReloadServer = livereload.createServer({
            exts: ['html', 'css', 'js'],
            delay: 100,
            port: availablePort, // Use the dynamically found available port
        });

        // Watch the target directory
        liveReloadServer.watch(watchPath);

        // console.log(`Livereload server running on port ${availablePort}`);
    } catch (err) {
        console.error('Error finding an available port for livereload:', err);
    }
}

export async function startServer(app) {
    try {
        // Find the first available port starting from 3000
        portfinder.basePort = 3000; // Starting point for finding the port
        const availablePort = await portfinder.getPortPromise();

        // Now that we have an available port, start the server
        app.listen(availablePort, () => {
            console.log(`Server running on http://localhost:${availablePort}/internal/enter`);
        });
    } catch (err) {
        console.error('Error finding an available port:', err);
    }
}

export function isAuthenticated(req, res, next) {
    if (req.session && req.session.username) {
        return next();
    }
    return res.redirect('/internal/login.html');
}
    
export async function launchServer(app){
    try {
        await setupDatabase();
        console.log('Database setup complete.');

        await startLiveReload();
        await startServer(app);
    } catch (err) {
        console.error('Failed to set up the database:', err);
    }
}