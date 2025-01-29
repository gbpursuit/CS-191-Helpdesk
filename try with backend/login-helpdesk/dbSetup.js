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
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function dumpToSql() {
    return new Promise((resolve, reject) => {
        const dumpFilePath = path.join(__dirname, 'users_dump.sql');
        process.env.MYSQL_PWD = 'password';  // Replace 'password' with your MySQL root password
        
        const command = `mysqldump -u root simple_helpdesk users > "${dumpFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing mysqldump: ${error}`);
            } else if (stderr) {
                reject(`stderr: ${stderr}`);
            } else {
                resolve(dumpFilePath); // Return the path to the SQL file
            }
        });
    });
}

async function readSql(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Error reading SQL file: ${err}`);
            } else {
                const userInsertPattern = /INSERT INTO `users` .*? \((.*?)\);/g;
                const userMatches = [];
                let match;

                while ((match = userInsertPattern.exec(data)) !== null) {
                    const values = match[1].split(',').map(value => value.trim().replace(/'/g, ''));
                    userMatches.push({
                        username: values[0],
                        first_name: values[1],
                        last_name: values[2],
                        password: values[3]
                    });
                }

                resolve(userMatches); // Return array of user data extracted from dump
            }
        });
    });
}

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

        // Dump the users data to a SQL file
        const dumpFilePath = await dumpToSql();

        // Read the SQL file and extract users
        const existingUsers = await readSql(dumpFilePath);

        // Insert default users if they don’t exist
        for (const user of existingUsers) {
            const [rows] = await pool.query(
                'SELECT 1 FROM users WHERE (first_name = ? AND last_name = ?) OR username = ? LIMIT 1',
                [user.first_name, user.last_name, user.username]
            );

            if (rows.length === 0) {
                await pool.query(
                    'INSERT INTO users (username, first_name, last_name, password) VALUES (?, ?, ?, ?)',
                    [user.username, user.first_name, user.last_name, user.password]
                );
            }
        }

        // Hash the passwords for users if not already hashed
        for (const user of existingUsers) {
            if (user.password && user.password.startsWith('$2')) { // Common start of hashed values
                continue; // Password is already hashed, skip it
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
