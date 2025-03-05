USE simple_helpdesk;

-- DESCRIBE tasks;
-- DESCRIBE applications;
-- DESCRIBE departments;
-- DESCRIBE devices;
-- DESCRIBE it_in_charge;
-- DESCRIBE items;
-- DESCRIBE task_types;

-- ALTER TABLE tasks 
-- MODIFY COLUMN severity ENUM('1', '2', '3', '4', '5') NOT NULL;

-- ALTER TABLE task_types
-- ADD COLUMN description TEXT DEFAULT NULL;

-- DESCRIBE tasks; 
-- SHOW INDEX FROM tasks;



-- ALTER TABLE departments ADD COLUMN departmentNo VARCHAR(50) UNIQUE DEFAULT NULL;
-- ALTER TABLE departments DROP COLUMN departmentNo;

-- -- Insert into task_types
-- INSERT INTO task_types (name) VALUES ('Bug Fix'), ('Feature Request'), ('Hardware Issue');

-- -- Insert into it_in_charge
-- INSERT INTO it_in_charge (name) VALUES ('Weng Castrillon'), ('Anne Ranay');

-- Insert into departments

-- INSERT INTO departments (name, department_no) VALUES ('Unknown, '0'), ('IT', '123'), ('Marketing', '321');

-- -- Insert into items
-- INSERT INTO items (name) VALUES ('Monitor'), ('Keyboard');

-- -- Insert into devices
-- INSERT INTO devices (name) VALUES ('Acer Laptop'), ('Dell Desktop');

-- -- Insert into applications
-- INSERT INTO applications (name) VALUES ('MS Office'), ('Google Chrome');

-- TRUNCATE tasks;
-- INSERT INTO tasks (
--     taskId, taskDate, taskStatus, severity, taskType, taskDescription, 
--     itInCharge, department, departmentNo, requestedBy, approvedBy, 
--     itemName, deviceName, applicationName, dateReq, dateRec, dateStart, dateFin, problemDetails, remarks
-- ) VALUES (
--     'T1041', '2024-03-05', 'Open', '5', 
--     (SELECT id FROM task_types WHERE name = 'Bug Fix'), -- Get taskType ID
--     'Fix login bug', 
--     (SELECT id FROM it_in_charge WHERE name = 'Weng Castrillon'), -- Get IT in charge ID
--     (SELECT id FROM departments WHERE name = 'Marketing'), -- Get department ID
--     '123', 'Alice Smith', 'Bob Johnson',
--     (SELECT id FROM items WHERE name = 'Monitor'), -- Get item ID
--     (SELECT id FROM devices WHERE name = 'Acer Laptop'), -- Get device ID
--     (SELECT id FROM applications WHERE name = 'MS Office'), -- Get application ID
--     '2024-03-04', NULL, NULL, NULL, 'Issue reported by user', 'Pending approval'
-- );

-- SET FOREIGN_KEY_CHECKS = 0; 
-- DELETE FROM task_types WHERE id = 22;
-- DELETE FROM task_types WHERE id = 23;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ALTER TABLE users
-- ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user',
-- ADD COLUMN department INT DEFAULT NULL,
-- ADD CONSTRAINT fk_department FOREIGN KEY (department) REFERENCES departments(id);

-- UPDATE users SET role = 'user' WHERE role IS NULL;
-- UPDATE users SET department = 0 WHERE department IS NULL;
-- ALTER TABLE users MODIFY COLUMN department INT NOT NULL DEFAULT 0;

-- ALTER TABLE users DROP FOREIGN KEY fk_department;
-- ALTER TABLE users DROP COLUMN department;

-- INSERT INTO departments(id, name, department_no) VALUES (0, 'Unknown', 0);
-- ALTER TABLE users ADD COLUMN department INT NOT NULL DEFAULT 0;

-- SET FOREIGN_KEY_CHECKS = 0;
-- UPDATE users SET department = 1 WHERE department = 0;
-- SET FOREIGN_KEY_CHECKS = 1;

-- SET SQL_SAFE_UPDATES = 0;
-- UPDATE users SET department = 1 WHERE department = 0;

-- SELECT users.first_name, users.last_name, departments.name AS dep_name, departments.department_no AS dep_no
-- FROM users
-- LEFT JOIN departments on users.department = departments.id;

-- INSERT INTO departments (name, department_no) VALUES ('Unknown', 0), ('IT', '123'), ('Marketing', '321');

-- SET FOREIGN_KEY_CHECKS = 0
-- ALTER TABLE tasks
-- MODIFY COLUMN it_in_charge

-- ALTER TABLE users
-- ADD COLUMN full_name VARCHAR (200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED AFTER last_name;

-- SHOW INDEX FROM tasks;

-- get foreign key
-- SELECT CONSTRAINT_NAME 
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_NAME = 'it_in_charge' 
-- AND COLUMN_NAME = 'first_name' 
-- AND REFERENCED_TABLE_NAME IS NOT NULL;


-- ALTER TABLE tasks
-- DROP FOREIGN KEY tasks_ibfk_2;

-- ALTER TABLE users DROP COLUMN full_name;

-- ALTER TABLE users 
-- ADD COLUMN full_name VARCHAR(200) GENERATED ALWAYS AS (TRIM(CONCAT(coalesce(first_name, ''), ' ', coalesce(last_name, '')))) STORED AFTER last_name;

--  TRUNCATE tasks;

-- ALTER TABLE tasks
-- MODIFY COLUMN itInCharge VARCHAR(100) NULL,
-- ADD CONSTRAINT fk_it_in_users FOREIGN KEY (approvedBy) REFERENCES users(username) ON DELETE SET NULL;

-- ALTER TABLE tasks
-- MODIFY COLUMN requestedBy VARCHAR(100) NULL,
-- ADD CONSTRAINT fk_requested_by FOREIGN KEY (approvedBy) REFERENCES users(username) ON DELETE SET NULL;
 
-- ALTER TABLE tasks
-- MODIFY COLUMN approvedBy VARCHAR(100) NULL,
-- ADD CONSTRAINT fk_approved_by FOREIGN KEY (approvedBy) REFERENCES users(username) ON DELETE SET NULL;

-- SET FOREIGN_KEY_CHECKS = 0; 
-- DELETE FROM task_types WHERE id = 9;
-- DELETE FROM task_types WHERE id = 10;
-- DELETE FROM task_types WHERE id = 11;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ALTER TABLE tasks
-- DROP FOREIGN KEY fk_it_in_users;

-- ALTER TABLE users DROP FOREIGN KEY user_dept;
-- ALTER TABLE users DROP COLUMN department;
-- ALTER TABLE users ADD COLUMN department INT NOT NULL DEFAULT 1;
-- ALTER TABLE users ADD CONSTRAINT user_dept FOREIGN KEY (department) REFERENCES departments(id) ON DELETE RESTRICT; 

-- for js, add a confirmation to delete department then use the code below for it:
-- UPDATE users SET department = 0 WHERE department = 1;
-- DELETE FROM departments WHERE id = 1;



-- ALTER TABLE users DROP PRIMARY KEY;
-- ALTER TABLE users ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;
-- ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);
-- SET FOREIGN_KEY_CHECKS = 0; 
-- UPDATE users SET department = 0 WHERE department IS NULL;
-- SET FOREIGN_KEY_CHECKS = 1; 

-- ALTER TABLE it_in_charge ADD COLUMN department INT NOT NULL DEFAULT 1;
-- ALTER TABLE it_in_charge ADD CONSTRAINT em_department

-- How can i alter the referenced tables to have an unknown name and set to id = 1 since id is autoincrement
-- ALTER TABLE it_in_charge 
-- UPDATE task_types SET id = 3 WHERE id = 1;
-- INSERT INTO task_types (id, name) VALUES (1, 'Unknown');

-- Step 1: Ensure `department` column exists in `users`
-- ALTER TABLE users ADD COLUMN department INT NOT NULL DEFAULT 1;
-- ALTER TABLE users ADD CONSTRAINT user_dept FOREIGN KEY (department) REFERENCES departments(id) ON DELETE CASCADE;

-- Step 2: Drop existing foreign keys if they exist
-- ALTER TABLE tasks DROP FOREIGN KEY fk_taskType;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_itInCharge;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_department;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_requestedBy;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_approvedBy;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_itemName;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_deviceName;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_applicationName;

-- -- Step 3: Modify columns to allow cascading deletes
-- ALTER TABLE tasks MODIFY COLUMN taskType INT NOT NULL DEFAULT 1;
-- ALTER TABLE tasks MODIFY COLUMN itInCharge INT NOT NULL DEFAULT 1;
-- ALTER TABLE tasks MODIFY COLUMN department INT NOT NULL DEFAULT 1;
-- ALTER TABLE tasks MODIFY COLUMN requestedBy INT NOT NULL DEFAULT 1;
-- ALTER TABLE tasks MODIFY COLUMN approvedBy INT NOT NULL DEFAULT 1;
-- ALTER TABLE tasks MODIFY COLUMN itemName INT NOT NULL DEFAULT 1;
-- ALTER TABLE tasks MODIFY COLUMN deviceName INT NOT NULL DEFAULT 1;
-- ALTER TABLE tasks MODIFY COLUMN applicationName INT NOT NULL DEFAULT 1;

-- -- Step 4: Re-add foreign keys with ON DELETE CASCADE

-- ALTER TABLE tasks ADD CONSTRAINT fk_taskType 
-- FOREIGN KEY (taskType) REFERENCES task_types(id) ON DELETE CASCADE;

-- ALTER TABLE tasks ADD CONSTRAINT fk_itInCharge 
-- FOREIGN KEY (itInCharge) REFERENCES it_in_charge(id) ON DELETE CASCADE;

-- -- ALTER TABLE tasks ADD CONSTRAINT fk_department 
-- -- FOREIGN KEY (department) REFERENCES departments(id) ON DELETE CASCADE;

-- ALTER TABLE tasks ADD CONSTRAINT fk_requestedBy 
-- FOREIGN KEY (requestedBy) REFERENCES it_in_charge(id) ON DELETE CASCADE;

-- ALTER TABLE tasks ADD CONSTRAINT fk_approvedBy 
-- FOREIGN KEY (approvedBy) REFERENCES it_in_charge(id) ON DELETE CASCADE;

-- ALTER TABLE tasks ADD CONSTRAINT fk_itemName 
-- FOREIGN KEY (itemName) REFERENCES items(id) ON DELETE CASCADE;

-- ALTER TABLE tasks ADD CONSTRAINT fk_deviceName 
-- FOREIGN KEY (deviceName) REFERENCES devices(id) ON DELETE CASCADE;

-- ALTER TABLE tasks ADD CONSTRAINT fk_applicationName 
-- FOREIGN KEY (applicationName) REFERENCES applications(id) ON DELETE CASCADE;


-- ALTER TABLE it_in_charge ADD COLUMN department INT NOT NULL DEFAULT 1;
-- ALTER TABLE it_in_charge ADD CONSTRAINT it_in_dept FOREIGN KEY (department) REFERENCES departments(id) ON DELETE RESTRICT;

-- DESCRIBE it_in_charge;
-- ALTER TABLE it_in_charge ADD COLUMN last_name VARCHAR(50) NULL AFTER name;
-- ALTER TABLE it_in_charge RENAME COLUMN name TO first_name;
-- ALTER TABLE it_in_charge ADD COLUMN full_name VARCHAR(200) GENERATED ALWAYS AS (TRIM(CONCAT(coalesce(first_name, ''), ' ', coalesce(last_name, '')))) STORED AFTER last_name;


SELECT kcu.TABLE_NAME, kcu.COLUMN_NAME, kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
WHERE kcu.TABLE_NAME = 'tasks' 
AND kcu.REFERENCED_TABLE_NAME IS NOT NULL;

-- SELECT kcu.TABLE_NAME, kcu.COLUMN_NAME, kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
-- WHERE kcu.TABLE_NAME = 'approved_by' 
-- AND kcu.REFERENCED_TABLE_NAME IS NOT NULL;

-- SELECT kcu.TABLE_NAME, kcu.COLUMN_NAME, kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
-- WHERE kcu.TABLE_NAME = 'requested_by' 
-- AND kcu.REFERENCED_TABLE_NAME IS NOT NULL;

SELECT kcu.TABLE_NAME, kcu.COLUMN_NAME, kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
WHERE kcu.TABLE_NAME = 'it_in_charge' 
AND kcu.REFERENCED_TABLE_NAME IS NOT NULL;

-- ALTER TABLE tasks DROP FOREIGN KEY fk_itInCharge;
-- ALTER TABLE tasks ADD CONSTRAINT fk_itInCharge FOREIGN KEY (itInCharge) REFERENCES users(id) ON DELETE CASCADE;


-- SHOW CREATE TABLE it_in_charge;
-- INSERT INTO it_in_charge (first_name, last_name) VALUES ('Unknown', ''), ('John', 'Doe'), ('James', 'Bond');





-- SET SQL_SAFE_UPDATES = 0;
-- DELETE FROM it_in_charge;
-- SET SQL_SAFE_UPDATES = 1;

-- ALTER TABLE it_in_charge AUTO_INCREMENT = 1;

-- ALTER TABLE it_in_charge DROP FOREIGN KEY fk_it_in_charge_user;

-- ALTER TABLE it_in_charge MODIFY COLUMN name VARCHAR(50) NOT NULL;

-- ALTER TABLE it_in_charge 
-- ADD CONSTRAINT fk_it_in_charge_user FOREIGN KEY (name) 
-- REFERENCES users(username) 
-- ON DELETE CASCADE;

-- ALTER TABLE tasks MODIFY COLUMN itInCharge INT NULL;
-- ALTER TABLE tasks MODIFY COLUMN requestedBy INT  NULL;
-- ALTER TABLE tasks MODIFY COLUMN approvedBy INT NULL;
-- INSERT INTO it_in_charge (name) VALUES ('gbpursuit'), ('lmcastrillon'), ('marcuspilapil'), ('wengcastrillon');

-- Drop Foreign Keys for specified tables
-- ALTER TABLE tasks DROP FOREIGN KEY fk_approvedBy;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_requestedBy;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_itInCharge;
-- ALTER TABLE tasks DROP FOREIGN KEY fk_department;

-- DROP TABLE it_in_charge;
-- DROP TABLE departments;

-- CREATE TABLE `departments` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `name` varchar(100) NOT NULL,
--   `department_no` varchar(50) NOT NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `name` (`name`),
--   UNIQUE KEY `department_no` (`department_no`)
-- );

-- CREATE TABLE `app_departments` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `name` varchar(100) NOT NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `name` (`name`)
-- );

-- CREATE TABLE `approved_by` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `first_name` varchar(50) NOT NULL,
--   `last_name` varchar(50) DEFAULT NULL,
--   `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
--   `department` int NOT NULL DEFAULT '1',
--   PRIMARY KEY (`id`),
--   KEY `approved` (`department`),
--   CONSTRAINT `approved` FOREIGN KEY (`department`) REFERENCES `app_departments` (`id`) ON DELETE RESTRICT
-- );

-- CREATE TABLE `requested_by` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `first_name` varchar(50) NOT NULL,
--   `last_name` varchar(50) DEFAULT NULL,
--   `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
--   `department` int NOT NULL DEFAULT '1',
--   PRIMARY KEY (`id`),
--   KEY `requested` (`department`),
--   CONSTRAINT `requested` FOREIGN KEY (`department`) REFERENCES `departments` (`id`) ON DELETE RESTRICT
-- );

-- CREATE TABLE `it_in_charge` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `first_name` varchar(50) NOT NULL,
--   `last_name` varchar(50) DEFAULT NULL,
--   `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
--   PRIMARY KEY (`id`)
-- );

-- SELECT * FROM tasks;
-- TRUNCATE tasks;

-- -- Recreate Foreign Keys with Constraints for each of the three tables
-- ALTER TABLE tasks
--     ADD CONSTRAINT fk_approvedBy FOREIGN KEY (approvedBy) REFERENCES approved_by(id) ON DELETE CASCADE;

-- ALTER TABLE tasks
--     ADD CONSTRAINT fk_requestedBy FOREIGN KEY (requestedBy) REFERENCES requested_by(id) ON DELETE CASCADE;

-- ALTER TABLE tasks
--     ADD CONSTRAINT fk_itInCharge FOREIGN KEY (itInCharge) REFERENCES it_in_charge(id) ON DELETE CASCADE;

-- ALTER TABLE tasks MODIFY COLUMN department VARCHAR(100) NULL DEFAULT NULL;

-- ALTER TABLE users DROP FOREIGN KEY user_dept;
-- ALTER TABLE users DROP COLUMN department;

-- CREATE TABLE user_table

-- ALTER TABLE requestedBy RENAME TO requested_by;

-- ALTER TABLE tasks DROP FOREIGN KEY fk_requestedBy;
-- ALTER TABLE tasks ADD CONSTRAINT fk_requestedBy FOREIGN KEY (requestedBy) REFERENCES requested_by(id) ON DELETE CASCADE;

-- ALTER TABLE tasks DROP FOREIGN KEY fk_approvedBy;
-- ALTER TABLE tasks ADD CONSTRAINT fk_approvedBy FOREIGN KEY (approvedBy) REFERENCES employees(id) ON DELETE CASCADE;

-- CREATE TABLE `app_departments` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `name` varchar(100) NOT NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `name` (`name`)
-- );

-- CREATE TABLE `approved_by` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `first_name` varchar(50) NOT NULL,
--   `last_name` varchar(50) DEFAULT NULL,
--   `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
--   `department` int NOT NULL DEFAULT '1',
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `name` (`first_name`),
--   KEY `approved` (`department`),
--   CONSTRAINT `approved` FOREIGN KEY (`department`) REFERENCES `app_departments` (`id`) ON DELETE RESTRICT
-- );


-- INSERT INTO it_in_charge (name) VALUES ('Unknown'), ('Gavril Coronel'), ('Lorraine Castrillon'), ('Marcus Pilapil'), ('Weng Castrillon');

-- ALTER TABLE tasks DROP FOREIGN KEY fk_itInCharge;
-- DROP TABLE it_in_charge;
-- CREATE TABLE `it_in_charge` (
--   `id` int NOT NULL AUTO_INCREMENT,
--   `first_name` varchar(50) NOT NULL,
--   `last_name` varchar(50) DEFAULT NULL,
--   `full_name` varchar(200) GENERATED ALWAYS AS (trim(concat(coalesce(`first_name`,_utf8mb4''),_utf8mb4' ',coalesce(`last_name`,_utf8mb4'')))) STORED,
--   PRIMARY KEY (`id`)
-- );

-- ALTER TABLE tasks ADD CONSTRAINT fk_itInCharge FOREIGN KEY (itInCharge) REFERENCES it_in_charge(id) ON DELETE cascade;

-- DESCRIBE users;
-- DESCRIBE tasks;

-- SELECT * FROM users;
-- SELECT * FROM tasks ORDER BY id DESC;

-- SELECT * FROM task_types;
-- SHOW INDEX FROM requested_by;
-- SHOW INDEX FROM approved_by;

-- DESCRIBE it_in_charge;
-- DESCRIBE task_types;
-- DESCRIBE items;
-- DESCRIBE devices;
-- DESCRIBE applications;

-- INSERT INTO it_in_charge (first_name, last_name) VALUES ('Unknown', ''), ('Gavril','Coronel'), ('Lorraine', 'Castrillon'), ('Marcus', 'Pilapil'), ('Weng', 'Castrillon');
-- INSERT INTO app_departments (name) VALUES ('Unknown');
-- INSERT INTO approved_by (first_name, last_name) VALUES ('Unknown', ''), ('Jane','Doe');

-- UPDATE approved_by SET id = 1 WHERE id = 5;
-- UPDATE approved_by SET id = 2 WHERE id = 6;




-- DESCRIBE tasks;
-- SELECT * FROM tasks;



-- SELECT * FROM requested_by;
-- SELECT * FROM departments;

-- SELECT * FROM it_in_charge;

-- SELECT * FROM approved_by;
-- SELECT * FROM app_departments;

-- SELECT * FROM items;
-- SELECT * FROM devices;
-- SELECT * FROM applications;


-- SET FOREIGN_KEY_CHECKS = 0; 
-- TRUNCATE it_in_charge;
-- -- DELETE FROM departments WHERE id = 3;
-- -- DELETE FROM requested_by WHERE id = 4;
-- -- DELETE FROM it_in_charge WHERE ID = 13;
-- -- DELETE FROM app_departments WHERE id = 2;
-- -- DELETE FROM approved_by WHERE ID = 7;
-- -- DELETE FROM devices WHERE ID = 9;
-- -- DELETE FROM devices WHERE ID = 10;
-- -- DELETE FROM devices WHERE ID = 5;
-- -- DELETE FROM devices WHERE ID = 6;
-- -- DELETE FROM task_types WHERE ID = 12;
-- -- DELETE FROM task_types WHERE ID = 14;
-- -- DELETE FROM task_types WHERE ID = 15;
-- SET FOREIGN_KEY_CHECKS = 1;

-- Insert into departments
-- INSERT INTO departments (name, department_no)
-- VALUES 
-- ('Unknown', '0');

-- Insert into app_departments
-- INSERT INTO app_departments (name)
-- VALUES 
-- ('Unknown');

-- Insert into requested_by
-- INSERT INTO requested_by (first_name, last_name)
-- VALUES 
-- ('Unknown', ''), 
-- ('John', 'Doe');

-- -- Insert into approved_by
-- INSERT INTO approved_by (first_name, last_name)
-- VALUES 
-- ('Unknown', ''), 
-- ('John', 'Doe');

-- Insert into it_in_charge
-- INSERT INTO it_in_charge (first_name, last_name)
-- VALUES 
-- ('Unknown', ''),
-- ('Gavril', 'Coronel'), 
-- ('Lorraine', 'Castrillon'), 
-- ('Marcus', 'Pilapil'), 
-- ('Weng', 'Castrillon');



-- Select all records from the users table
SELECT * FROM users;

-- Select all records from the tasks table
SELECT * FROM tasks;

-- Select all records from the requested_by table
SELECT * FROM requested_by;

-- Select all records from the departments table
SELECT * FROM departments;

-- Select all records from the approved_by table
SELECT * FROM approved_by;

-- Select all records from the app_departments table
SELECT * FROM app_departments;

-- Select all records from the it_in_charge table
SELECT * FROM it_in_charge;







-- SELECT *
-- FROM users
-- ORDER BY username;

-- SELECT *
-- FROM tasks
-- ORDER by id;

-- DELETE u1
-- FROM users u1
-- JOIN users u2
--   ON u1.first_name = u2.first_name
--   AND u1.last_name = u2.last_name
--   AND u1.id > u2.id
-- WHERE u1.id > 0;  -- Ensures the WHERE clause includes a key column (id).

