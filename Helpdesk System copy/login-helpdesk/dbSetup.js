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

async function get_latest_dump_file() {
    try {
        const files = await fs.promises.readdir(BACKUP_DIR);
        const dumpFiles = files
            .filter(file => file.startsWith('simple_helpdesk_dump_') && file.endsWith('.sql'))
            .map(file => ({
                file,
                time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
            }))
            .sort((a, b) => b.time - a.time); 

        if (dumpFiles.length === 0) {
            throw new Error('No backup dump files found.');
        }

        return path.join(BACKUP_DIR, dumpFiles[0].file);
    } catch (err) {
        console.error('Error retrieving latest dump file:', err);
        throw err;
    }
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

async function create_new_tables(pool) {
    try {
        console.log('Creating new tables');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS task_types (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS departments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL,
                department_no VARCHAR(50) UNIQUE NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS it_in_charge (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS devices (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        console.log('Table creation successful.')
    } catch (err) {
        console.error('Error modifying tasks table: ', err);
    }
}

async function alter_and_add(pool) {
    try {
        // console.log('Adding new generated full_name column in users...');
        // await pool.query(`
        //     ALTER TABLE users 
        //     ADD COLUMN full_name VARCHAR(200) 
        //     GENERATED ALWAYS AS (
        //         TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
        //     ) STORED AFTER last_name;
        // `);

        // console.log('Dropping foreign key constraints on tasks...');
        // await pool.query(`ALTER TABLE tasks DROP FOREIGN KEY tasks_ibfk_2;`);

        // console.log('Truncating tasks table...');
        // await pool.query(`TRUNCATE TABLE tasks;`);

        // console.log('Modifying itInCharge column and adding foreign key to users...');
        // await pool.query(`
        //     ALTER TABLE tasks
        //     MODIFY COLUMN itInCharge VARCHAR(100) NULL,
        //     ADD CONSTRAINT fk_it_in_users 
        //     FOREIGN KEY (itInCharge) REFERENCES users(username) ON DELETE SET NULL;
        // `);

        // console.log('Modifying requestedBy column and adding foreign key to users...');
        // await pool.query(`
        //     ALTER TABLE tasks
        //     MODIFY COLUMN requestedBy VARCHAR(100) NULL,
        //     ADD CONSTRAINT fk_requested_by 
        //     FOREIGN KEY (requestedBy) REFERENCES users(username) ON DELETE SET NULL;
        // `);

        // console.log('Modifying approvedBy column and adding foreign key to users...');
        // await pool.query(`
        //     ALTER TABLE tasks
        //     MODIFY COLUMN approvedBy VARCHAR(100) NULL,
        //     ADD CONSTRAINT fk_approved_by 
        //     FOREIGN KEY (approvedBy) REFERENCES users(username) ON DELETE SET NULL;
        // `);

        // console.log('Database modifications completed successfully.');
        // console.log('You can check MySQL for the updated table structure.');

    } catch (err) {
        console.error('Error modifying database schema: ', err);
    }
}

// async function alter_and_add(pool) {
//     try {

//         console.log('Dropping existing tasks table');
//         await pool.query(`DROP TABLE IF EXISTS tasks`);

//         console.log('Recreating tasks table with updated structure...');
//         await pool.query(`
//             CREATE TABLE IF NOT EXISTS tasks (
//                 id INT NOT NULL AUTO_INCREMENT,
//                 taskId VARCHAR(10) NOT NULL UNIQUE,
//                 taskDate DATE DEFAULT NULL,
//                 taskStatus VARCHAR(50) DEFAULT NULL,
//                 severity TINYINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
//                 taskType INT DEFAULT NULL,
//                 taskDescription TEXT,
//                 itInCharge INT DEFAULT NULL,
//                 department INT DEFAULT NULL,
//                 departmentNo VARCHAR(50) DEFAULT NULL,
//                 requestedBy VARCHAR(100) DEFAULT NULL,
//                 approvedBy VARCHAR(100) DEFAULT NULL,
//                 itemName INT DEFAULT NULL,
//                 deviceName INT DEFAULT NULL,
//                 applicationName INT DEFAULT NULL,
//                 dateReq DATE DEFAULT NULL,
//                 dateRec DATE DEFAULT NULL,
//                 dateStart DATE DEFAULT NULL,
//                 dateFin DATE DEFAULT NULL,
//                 problemDetails TEXT,
//                 remarks TEXT,
//                 PRIMARY KEY (id),
//                 FOREIGN KEY (taskType) REFERENCES task_types(id),
//                 FOREIGN KEY (itInCharge) REFERENCES it_in_charge(id),
//                 FOREIGN KEY (department) REFERENCES departments(id),
//                 FOREIGN KEY (itemName) REFERENCES items(id),
//                 FOREIGN KEY (deviceName) REFERENCES devices(id),
//                 FOREIGN KEY (applicationName) REFERENCES applications(id)
//             );
//         `);

//         console.log('Tasks table recreated successfully.');
//         console.log('You can check MySQL for the newly updated database layout.');
        
//     } catch (err) {
//         console.error('Error modifying tasks table: ', err);
//     }
// }

let pool;

async function restore_database(dumpFilePath) {
    return new Promise((resolve, reject) => {
        console.log(`Restoring database from: ${dumpFilePath}`);

        const restoreProcess = spawn('mysql', [
            '-h', process.env.MYSQL_HOST,
            '-u', process.env.MYSQL_USER,
            `--password=${process.env.MYSQL_PWD}`,
            process.env.MYSQL_DTB
        ], { stdio: ['pipe', 'inherit', 'inherit'] });

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
            await connection.query(`CREATE DATABASE ${process.env.MYSQL_DTB}`);
            console.log(`Database ${process.env.MYSQL_DTB} created.`);

            const dumpFilePath = await get_latest_dump_file();
            if (dumpFilePath) {
                await restore_database(dumpFilePath);
            }
        }

        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD,
            database: process.env.MYSQL_DTB,
        });

        console.log('Database connected successfully');

        // await create_new_tables(pool);
        // await alter_and_add(pool);

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

// Used for debugging and testing -- developers lang
export async function restore_existing_database() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PWD,
            database: process.env.MYSQL_DTB
        });

        console.log('Disabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

        console.log('Dropping all tables in the database...');
        const [tables] = await connection.query(`SHOW TABLES`);
        if (tables.length > 0) {
            for (let row of tables) {
                const tableName = Object.values(row)[0];
                console.log(`Dropping table: ${tableName}`);
                await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
            }
        }

        console.log('Re-enabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

        const dumpFilePath = await get_latest_dump_file();
        console.log(`Restoring database from: ${dumpFilePath}`);

        await new Promise((resolve, reject) => {
            const restoreProcess = spawn('mysql', [
                '-h', process.env.MYSQL_HOST,
                '-u', process.env.MYSQL_USER,
                `--password=${process.env.MYSQL_PWD}`, // Use --password= format
                process.env.MYSQL_DTB
            ], { stdio: ['pipe', 'inherit', 'inherit'] });

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

        await connection.end();
    } catch (err) {
        console.error('Error restoring database:', err);
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