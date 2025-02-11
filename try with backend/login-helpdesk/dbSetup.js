import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                username VARCHAR(100) UNIQUE NOT NULL PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                password VARCHAR(255)
            )
        `);
        
        // await pool.query(`DROP TABLE IF EXISTS tasks`);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                taskId VARCHAR(10) UNIQUE NOT NULL,
                taskDate DATE DEFAULT NULL,
                taskStatus VARCHAR(50),
                severity VARCHAR(50),
                taskType VARCHAR(100),
                taskDescription TEXT,
                itInCharge VARCHAR(100),
                department VARCHAR(100), 
                departmentNo VARCHAR(100),
                requestedBy VARCHAR(100),
                approvedBy VARCHAR(100),
                itemName VARCHAR(100),
                deviceName VARCHAR(100),
                applicationName VARCHAR(100),
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
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await pool.query(
                    'INSERT INTO users (username, first_name, last_name, password) VALUES (?, ?, ?, ?)',
                    [user.username, user.first_name, user.last_name, hashedPassword]
                );
            }
        }

        return pool; 
    } catch (err) {
        console.error('Database setup failed:', err);
        throw err; 
    }
}



        // await pool.query(`
        //     CREATE TABLE IF NOT EXISTS tasks (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         taskId VARCHAR(10) UNIQUE NOT NULL,
        //         taskStatus VARCHAR(50),
        //         taskDate DATE DEFAULT NULL,
        //         itInCharge VARCHAR(100),
        //         taskType VARCHAR(100),
        //         taskDescription TEXT,
        //         severity VARCHAR(50),
        //         requestedBy VARCHAR(100),
        //         approvedBy VARCHAR(100),
        //         dateReq DATE DEFAULT NULL,
        //         dateRec DATE DEFAULT NULL,
        //         dateStart DATE DEFAULT NULL,
        //         dateFin DATE DEFAULT NULL
        //     )
        // `);

        // const existingTable = await pool.query('SELECT * FROM table');

        // // Dump the users data to a SQL file
        // const dumpFilePath = await dumpToSql();

        // // // Read the SQL file and extract users
        // const existingUsers = await readSql(dumpFilePath);
        // const existingUsers = [
        //     ['lmcastrillon', 'Lorraine', 'Castrillon', 'password123'],
        //     ['wengcastrillon', 'Weng', 'Castrillon', 'password456'],
        //     ['gbpursuit', 'Gavril', 'Coronel', 'password789'],
        //     ['marcuspilapil', 'Marcus', 'Pilapil', 'password000'],
        //     ['newDummy', 'Dummy', 'Account', 'dummypassword'],
        //     ['g', 'gg', null, 'ggg'],
        // ];

                // Hash the passwords for users if not already hashed
        // for (const user of existingUsers) {
        //     if (user.password && user.password.startsWith('$2')) { // Common start of hashed values
        //         continue; // Password is already hashed, skip it
        //     }

        //     if (user.password) {
        //         const hashedPassword = await bcrypt.hash(user.password, 10);

        //         await pool.query(
        //             'UPDATE users SET password = ? WHERE username = ?',
        //             [hashedPassword, user.username]
        //         );
        //     }
        // }