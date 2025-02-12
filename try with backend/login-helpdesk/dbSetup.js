import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function dump_to_sql() {
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

async function read_sql(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Error reading SQL file: ${err}`);
            } else {
                const userInsertPattern = /INSERT INTO `users` VALUES\s*\((.*?)\);/g;
                const userMatches = [];
                let match;

                while ((match = userInsertPattern.exec(data)) !== null) {
                    const userValues = match[1]; // This contains all the user data in a single string
                    const userRecords = userValues.split("),(").map(record => record.replace(/[()]/g, '').split(',')); // Split the string into separate user records (based on `),(` pattern)
                    
                    userRecords.forEach(record => {
                        // Clean each record and push to userMatches
                        userMatches.push({
                            username: record[0].replace(/'/g, ''),
                            first_name: record[1] ? record[1].replace(/'/g, '') : null,
                            last_name: record[2] ? record[2].replace(/'/g, '') : null,
                            password: record[3].replace(/'/g, '')
                        });
                    });
                }

                resolve(userMatches); // Return array of all user data found
            }
        });
    });
}

export async function setup_database() {
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

        // await pool.query(`
        //     ALTER TABLE if not exist users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL;
        // `);
        
        //await pool.query(`DROP TABLE IF EXISTS tasks`);

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

        const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'profile_image'");
        if (columns.length === 0) {
            await pool.query("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL;");
        }
        

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