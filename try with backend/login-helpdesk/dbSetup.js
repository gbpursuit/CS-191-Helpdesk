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

        // Create the `users` table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                password VARCHAR(255),
                UNIQUE(first_name, last_name)
            )
        `);

        // Insert default users if they don’t exist
        const defaultUsers = [
            ['Lorraine', 'Castrillon', 'password123'],
            ['Weng', 'Castrillon', 'password456'],
            ['Gavril', 'Coronel', 'password789'],
            ['Marcus', 'Pilapil', 'password000'],
        ];

        for (const [first_name, last_name, password] of defaultUsers) {
            const [rows] = await pool.query(
                'SELECT 1 FROM users WHERE first_name = ? AND last_name = ? LIMIT 1',
                [first_name, last_name]
            );

            if (rows.length === 0) {
                await pool.query(
                    'INSERT INTO users (first_name, last_name, password) VALUES (?, ?, ?)',
                    [first_name, last_name, password]
                );
            }
        }

        return pool; // Return the connection pool
    } catch (err) {
        console.error('Database setup failed:', err);
        throw err; // Propagate the error to the caller
    }
}
