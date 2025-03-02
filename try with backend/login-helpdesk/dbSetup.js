// import mysql from 'mysql2/promise';
// import path from 'path'; // Ensure path module is imported
// import { exec } from 'child_process'; // Ensure exec is imported
// import fs from 'fs'; // If you haven't already, import fs

// export async function sql_dump() {
//     return new Promise((resolve, reject) => {
//         const dumpFilePath = path.join(__dirname, 'users_dump.sql');
//         process.env.MYSQL_PWD = 'password';  // Replace 'password' with your MySQL root password
        
//         const command = `mysqldump -u root simple_helpdesk users > "${dumpFilePath}"`;

//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 reject(`Error executing mysqldump: ${error}`);
//             } else if (stderr) {
//                 reject(`stderr: ${stderr}`);
//             } else {
//                 resolve(dumpFilePath); // Return the path to the SQL file
//             }
//         });
//     });
// }


// async function read_sql(filePath) {
//     return new Promise((resolve, reject) => {
//         fs.readFile(filePath, 'utf8', (err, data) => {
//             if (err) {
//                 reject(`Error reading SQL file: ${err}`);
//             } else {
//                 const tableInsertPattern = /INSERT INTO `(\w+)` VALUES\s*\((.*?)\);/g;
//                 const matches = [];
//                 let match;

//                 // Find all INSERT statements
//                 while ((match = tableInsertPattern.exec(data)) !== null) {
//                     const tableName = match[1];  // The table name
//                     const valuesString = match[2]; // The values inserted
//                     const records = valuesString.split("),(").map(record => record.replace(/[()]/g, '').split(','));

//                     // Clean each record and store in matches array
//                     records.forEach(record => {
//                         const rowData = {};
//                         record.forEach((field, idx) => {
//                             // Using the table structure to dynamically map fields (if required)
//                             rowData[`field${idx + 1}`] = field.replace(/'/g, ''); // Simple field mapping, you can adjust this to match actual field names
//                         });
//                         matches.push({ table: tableName, data: rowData });
//                     });
//                 }

//                 resolve(matches); // Return array of all table data found
//             }
//         });
//     });
// }

// export async function setup_database() {
//     try {
//         // Create a connection without specifying a database
//         const connection = await mysql.createConnection({
//             host: 'localhost',
//             user: 'root',
//             password: 'password',
//         });

//         // Ensure the database exists
//         await connection.query('CREATE DATABASE IF NOT EXISTS simple_helpdesk');

//         // Use the database
//         const pool = mysql.createPool({
//             host: 'localhost',
//             user: 'root',
//             password: 'password',
//             database: 'simple_helpdesk',
//         });

//         await pool.query(`
//             CREATE TABLE IF NOT EXISTS users (
//                 username VARCHAR(100) UNIQUE NOT NULL PRIMARY KEY,
//                 first_name VARCHAR(100),
//                 last_name VARCHAR(100),
//                 password VARCHAR(255)
//             )
//         `);

//         // await pool.query(`
//         //     ALTER TABLE if not exist users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL;
//         // `);
        
//         //await pool.query(`DROP TABLE IF EXISTS tasks`);

//         await pool.query(`
//             CREATE TABLE IF NOT EXISTS tasks (
//                 id INT AUTO_INCREMENT PRIMARY KEY,
//                 taskId VARCHAR(10) UNIQUE NOT NULL,
//                 taskDate DATE DEFAULT NULL,
//                 taskStatus VARCHAR(50),
//                 severity VARCHAR(50),
//                 taskType VARCHAR(100),
//                 taskDescription TEXT,
//                 itInCharge VARCHAR(100),
//                 department VARCHAR(100), 
//                 departmentNo VARCHAR(100),
//                 requestedBy VARCHAR(100),
//                 approvedBy VARCHAR(100),
//                 itemName VARCHAR(100),
//                 deviceName VARCHAR(100),
//                 applicationName VARCHAR(100),
//                 dateReq DATE DEFAULT NULL,
//                 dateRec DATE DEFAULT NULL,
//                 dateStart DATE DEFAULT NULL,
//                 dateFin DATE DEFAULT NULL
//             )
//         `);

//         const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'profile_image'");
//         if (columns.length === 0) {
//             await pool.query("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL;");
//         }

//         // Insert default users if they don’t exist
//         const [existingUsers] = await pool.query('SELECT * FROM users');

//         return pool; 
//     } catch (err) {
//         console.error('Database setup failed:', err);
//         throw err; 
//     }
// }

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupPath = path.join(__dirname, 'backup');

// Updated sql_dump
const BACKUP_DIR = backupPath;
const MAX_BACKUPS = 10;

export async function sql_dump() {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Manila' })
            .replace(/[/,: ]/g, '_')
            .replace('__', '_')
            .split('_GMT')[0];

        const filename = `simple_helpdesk_dump_${timestamp}.sql`;
        const dumpFilePath = path.join(BACKUP_DIR, filename);

        console.log('Creating a new dump file:', filename);

        if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PWD) {
            return reject(new Error('Database credentials are missing.'));
        }
        
        const dumpProcess = spawn('mysqldump', [
            '-h', process.env.MYSQL_HOST,
            '-u', process.env.MYSQL_USER,
            `--password=${process.env.MYSQL_PWD}`,
            'simple_helpdesk'
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        // if(!process.env.MYSQL_CNF) {
        //     return reject (new Error('MYSQL_CNF environment variable is not set. '));
        // }

        // const dumpProcess = spawn('mysqldump', ['--defaults-extra-file=' + process.env.MYSQL_CNF, 'simple_helpdesk'], {
        //     stdio: ['ignore', 'pipe', 'pipe']
        // });

        const fileStream = fs.createWriteStream(dumpFilePath);

        dumpProcess.stdout.pipe(fileStream);
        dumpProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));

        dumpProcess.on('error', (err) => {
            console.error('Failed to start mysqldump:', err);
            reject(err);
        })

        dumpProcess.on('close', async(code) => {
            if (code === 0) {
                await cleanup_old_dumps();
                resolve(dumpFilePath);
            } else {
                reject(new Error(`mysqldump process exited with code ${code}`));
            }
        });

        fileStream.on('error', (err) => {
            console.error('Error writing dump file:', err);
            reject(err);
        });
    });
}

async function cleanup_old_dumps(){
    try {
        const files = await fs.promises.readdir(BACKUP_DIR);

        const dumpFiles = await Promise.all(
            files
                .filter(file => file.startsWith('simple_helpdesk_dump_') && file.endsWith('.sql'))
                .map(async file => ({
                    file,
                    time: (await fs.promises.stat(path.join(BACKUP_DIR, file))).mtime
                }))
        );

        dumpFiles.sort((a, b) => a.time - b.time);

        // Delete excess backups if needed
        if (dumpFiles.length > MAX_BACKUPS) {
            const filesToDelete = dumpFiles.slice(0, dumpFiles.length - MAX_BACKUPS);
            await Promise.all(filesToDelete.map(({ file }) =>
                fs.promises.unlink(path.join(BACKUP_DIR, file))
                    .then(() => console.log(`Deleted old dump: ${file}`))
                    .catch(err => console.error(`Failed to delete old dump ${file}:`, err))
            ));
        }

    } catch (err) {
        console.error('Error processing dump files:', err);
    }
}

async function get_dump_file() {
    const files = await fs.promises.readdir(BACKUP_DIR);
    const dumpFiles = files.filter(file => file.startsWith('simple_helpdesk_dump_') && file.endsWith('.sql'));

    if (dumpFiles.length === 0) {
        throw new Error('No backup dump files found.');
    }

    dumpFiles.sort((a, b) => fs.statSync(path.join(BACKUP_DIR, b)).mtime - fs.statSync(path.join(BACKUP_DIR, a)).mtime);
    return path.join(BACKUP_DIR, dumpFiles[0]);
}



// Updated read_sql
async function read_sql(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Error reading SQL file: ${err}`);
            } else {
                const tableData = [];
                const tablePattern = /INSERT INTO `(.*?)` VALUES\s*\((.*?)\);/g;
                let match;

                while ((match = tablePattern.exec(data)) !== null) {
                    const tableName = match[1];
                    const rawValues = match[2];
                    
                    // Split values by "),(" but handle quotes around commas
                    const rows = rawValues.split('),(').map(row => {
                        let regex = row.split(/,(?=(?:[^\\']|'(?:\\'|[^'])*')*$)/);
                        return regex.map(val => {
                            val = val.replace(/^'(.*)'$/, '$1').replace(/\\'/g, "'").trim();
                            return val === 'NULL' || val === 'null' ? null : val;  // Keep 'NULL' as null
                        });
                        
                        
                    });

                    tableData.push({ table: tableName, data: rows });
                }

                resolve(tableData); // Return array of table data
            }
        });
    });
}

async function alter_tasks_table(pool) {
    try {
        const columns = [
            {name: "problemDetails", type: 'VARCHAR(200)'},
            {name: "remarks", type: 'VARCHAR(200)'}
        ];

        for (const column of columns) {
            const [rows] = await pool.query('SHOW COLUMNS FROM tasks LIKE ?', column.name);

            if (rows.length === 0) {
                await pool.query(`ALTER TABLE tasks ADD COLUMN ${column.name} ${column.type}`);
                console.log(`Column ${column.name} added to tasks table. `);
            } else {
                console.log(`Column ${column.name} already exists in tasks table. `);
            }
        }
    } catch (err) {
        console.error('Error modifying tasks table: ', err);
    }
}

let pool;

export async function setup_database() {

    if (pool) {
        console.log('Returning existing database connection pool.');
        return pool;
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD
        });

        const [databases] = await connection.query(
            'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', 
            ["simple_helpdesk"]
        );

        if (databases.length === 0) {
            console.log('Database does not exist. Creating and restoring from dump...');

            await connection.query(`CREATE DATABASE simple_helpdesk`);
            console.log('Database simple_helpdesk created.');

            await new Promise((resolve, reject) => {
                const restoreProcess = spawn('mysql', [
                    '-h', process.env.MYSQL_HOST,
                    '-u', process.env.MYSQL_USER,
                    `--password=${process.env.MYSQL_PWD}`, // Use --password= format
                    'simple_helpdesk'
                ], { stdio: ['pipe', 'inherit', 'inherit'] });

                // const restoreProcess = spawn('mysql', ['--defaults-extra-file=' + process.env.MYSQL_CNF, 'simple_helpdesk'], {
                //     stdio: ['pipe', 'inherit', 'inherit']
                // });

                fs.createReadStream(dumpFilePath).pipe(restoreProcess.stdin);

                restoreProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('Database restored successfully!');
                        resolve();
                    } else {
                        reject(new Error(`mysql restore process exited with code ${code}`));
                    }
                });
            });
        }

        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD,
            database: process.env.MYSQL_DTB,
        });

        console.log('Database connected successfully');

        // if (databases.length !== 0) {
        //     const dumpFilePath = await get_dump_file();
        //     const sqlData = await read_sql(dumpFilePath);

        //     sqlData.forEach(tableData => {
        //         if (tableData.table === 'tasks') {
        //             tableData.data = tableData.data.map(row => row.slice(1));
        //         }
        //     });

        //     await Promise.all(sqlData.map(async (tableData) => {
        //         const { table, data } = tableData;

        //         const [tableExists] = await pool.query(`SHOW TABLES LIKE ?`, [table]);

        //         if (tableExists.length === 0) {
        //             console.warn(`Table ${table} does not exist!`);
        //             return;
        //         }

        //         const [columns] = await pool.query(`DESCRIBE ${table}`);
        //         const columnNames = columns.map(col => col.Field).filter(field => field !== 'id');
        //         const placeholders = columnNames.map(() => '?').join(',');
        //         const updateClause = columnNames.map(col => `${col} = VALUES(${col})`).join(',');

        //         const insertQuery = `
        //             INSERT INTO ${table} (${columnNames.join(',')})
        //             VALUES (${placeholders})
        //             ON DUPLICATE KEY UPDATE ${updateClause}
        //         `;

        //         await Promise.all(data.map(rowData => pool.query(insertQuery, rowData)));

        //         console.log(`Data for table ${table} inserted successfully.`);
        //     }));
        // }

        return pool;
    } catch (err) {
        console.error('Database setup failed:', err);
        throw err;
    }
}


// export async function setup_database() {

//     if (pool) {
//         console.log('Returning existing database connection pool.');
//         return pool;
//     }

//     try {
//         const connection = await mysql.createConnection({
//             host: process.env.MYSQL_HOST,
//             user: process.env.MYSQL_USER,
//             password: process.env.MYSQL_PWD
//         });

//         const [databases] = await connection.query(
//             'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', 
//             ["simple_helpdesk"]
//         );

//         if (databases.length === 0) {
//             console.log('Database does not exist. Restoring from dump...');
//             const dumpFilePath = await sql_dump();

//             await new Promise((resolve, reject) => {
//                 const restoreProcess = spawn('mysql', ['--defaults-extra-file=' + process.env.MYSQL_CNF, 'simple_helpdesk'], {
//                     stdio: ['pipe', 'inherit', 'inherit']
//                 });

//                 fs.createReadStream(dumpFilePath).pipe(restoreProcess.stdin);

//                 restoreProcess.on('close', (code) => {
//                     if (code === 0) {
//                         console.log('Database restored successfully!');
//                         resolve();
//                     } else {
//                         reject(new Error(`mysql restore process exited with code ${code}`));
//                     }
//                 });
//             });
//         }

//         pool = mysql.createPool({
//             host: process.env.MYSQL_HOST,
//             user: process.env.MYSQL_USER,
//             password: process.env.MYSQL_PWD,
//             database: process.env.MYSQL_DTB,
//             waitForConnections: true,
//             connectionLimit: 1,
//             queueLimit: 0
//         });       

//         if (databases.length !== 0) {
//             const dumpFilePath = await sql_dump();
//             const sqlData = await read_sql(dumpFilePath);

//             sqlData.forEach(tableData => {
//                 if (tableData.table === 'tasks') {
//                     tableData.data = tableData.data.map(row => row.slice(1));
//                 }
//             });

//             await Promise.all(sqlData.map(async (tableData) => {
//                 const { table, data } = tableData;

//                 const conn = await pool.getConnection(); // Hold the connection
//                 try {
//                     const [tableExists] = await conn.query(`SHOW TABLES LIKE ?`, [table]);

//                     if (tableExists.length === 0) {
//                         console.warn(`Table ${table} does not exist!`);
//                         return;
//                     }

//                     const [columns] = await conn.query(`DESCRIBE ${table}`);
//                     const columnNames = columns.map(col => col.Field).filter(field => field !== 'id');
//                     const placeholders = columnNames.map(() => '?').join(',');
//                     const updateClause = columnNames.map(col => `${col} = VALUES(${col})`).join(',');

//                     const insertQuery = `
//                         INSERT INTO ${table} (${columnNames.join(',')})
//                         VALUES (${placeholders})
//                         ON DUPLICATE KEY UPDATE ${updateClause}
//                     `;

//                     await Promise.all(data.map(rowData => conn.query(insertQuery, rowData)));

//                     console.log(`Data for table ${table} inserted successfully.`);
//                 } finally {
//                     await new Promise(resolve => setTimeout(resolve, 10000)); // Hold for 10 seconds
//                     conn.release(); // Ensure connection is released back to the pool
//                 }
//             }));
//         }

//         return pool;
//     } catch (err) {
//         console.error('Database setup failed:', err);
//         throw err;
//     }
// }