// import mysql from 'mysql2';

// // Database setup function
// export async function setupDatabase() {
//     return new Promise((resolve, reject) => {
//         const db = mysql.createConnection({
//             host: 'localhost',
//             user: 'root',
//             password: 'password',
//         });

//         db.connect((err) => {
//             if (err) return reject(err);

//             // console.log('Connected to MySQL!');
//             db.query('CREATE DATABASE IF NOT EXISTS simple_helpdesk', (err) => {
//                 if (err) return reject(err);
//                 // console.log('Database created or already exists.');

//                 db.changeUser({ database: 'simple_helpdesk' }, (err) => {
//                     if (err) return reject(err);

//                     const createUsersTable = `
//                         CREATE TABLE IF NOT EXISTS users (
//                             id INT AUTO_INCREMENT PRIMARY KEY,
//                             first_name VARCHAR(100),
//                             last_name VARCHAR(100),
//                             password VARCHAR(255),
//                             UNIQUE(first_name, last_name)  -- Ensures no duplicate users
//                         );
//                     `;

//                     db.query(createUsersTable, (err) => {
//                         if (err) return reject(err);
//                         // console.log('Users table created or already exists.');

//                         // Check if users exist before inserting
//                         const defaultUsers = [
//                             ['Lorraine', 'Castrillon', 'password123'],
//                             ['Weng', 'Castrillon', 'password456'],
//                             ['Gavril', 'Coronel', 'password789'],
//                             ['Marcus', 'Pilapil', 'password000']
//                         ];

//                         defaultUsers.forEach(([first_name, last_name, password]) => {
//                             const checkUserExists = `
//                                 SELECT 1 FROM users WHERE first_name = ? AND last_name = ? LIMIT 1;
//                             `;

//                             db.query(checkUserExists, [first_name, last_name], (err, results) => {
//                                 if (err) return reject(err);

//                                 if (results.length === 0) {
//                                     // Insert if the user does not exist
//                                     const insertUser = `
//                                         INSERT INTO users (first_name, last_name, password)
//                                         VALUES (?, ?, ?);
//                                     `;
//                                     db.query(insertUser, [first_name, last_name, password], (err) => {
//                                         if (err) return reject(err);
//                                         console.log(`${first_name} ${last_name} added.`);
//                                     });
//                                 }
//                             });
//                         });

//                         db.end();
//                         resolve();
//                     });
//                 });
//             });
//         });
//     });
// }


import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Database setup function
export async function setupDatabase() {
    try {
        // Create a connection without specifying a database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
        });

        // Ensure the database exists
        await connection.query('CREATE DATABASE IF NOT EXISTS simple_helpdesk');

        // Use the database
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'simple_helpdesk',
        });

        // await pool.query('DELETE FROM users');
        // await pool.query('DROP TABLE IF EXISTS users');

        // Create the `users` table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                username VARCHAR(100) UNIQUE NOT NULL PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                password VARCHAR(255)
            )
        `);

        // await pool.query(`
        //     CREATE TABLE IF NOT EXISTS users (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         first_name VARCHAR(100),
        //         last_name VARCHAR(100),
        //         password VARCHAR(255)
        //     )
        // `);

        // Create the `tasks` table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                taskId VARCHAR(10) UNIQUE NOT NULL,
                taskStatus VARCHAR(50),
                taskDate DATE DEFAULT NULL,
                itInCharge VARCHAR(100),
                taskType VARCHAR(100),
                taskDescription TEXT,
                severity VARCHAR(50),
                requestedBy VARCHAR(100),
                approvedBy VARCHAR(100),
                dateReq DATE DEFAULT NULL,
                dateRec DATE DEFAULT NULL,
                dateStart DATE DEFAULT NULL,
                dateFin DATE DEFAULT NULL
            )
        `);

        // Insert default users if they don’t exist
        const [existingUsers] = await pool.query('SELECT * FROM users');

        for (const user of existingUsers) {
            const [rows] = await pool.query(
                'SELECT 1 FROM users WHERE (first_name = ? AND last_name = ?) OR username = ? LIMIT 1',
                [user.first_name, user.last_name, user.username]
            );

            if (rows.length === 0) {
                await pool.query(
                    'INSERT INTO users (first_name, last_name, password) VALUES (?, ?, ?, ?)',
                    [user.username, user.first_name, user.last_name, user.password]
                );
            }
        }

        for (const user of existingUsers) {
            if (user.password && user.password.startsWith('$2')) { // Common start of hashed values
                // console.log(`Password for user ${user.first_name} ${user.last_name} is already hashed.`);
                continue;
            }
        
            if (user.password) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
        
                await pool.query(
                    'UPDATE users SET password = ? WHERE username = ?',
                    [hashedPassword, user.username]
                );
            }
        }

        return pool; // Return the connection pool
    } catch (err) {
        console.error('Database setup failed:', err);
        throw err; // Propagate the error to the caller
    }
}