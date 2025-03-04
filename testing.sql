USE simple_helpdesk;

-- DESCRIBE users;
-- DESCRIBE tasks;
-- DESCRIBE applications;
-- DESCRIBE departments;
-- DESCRIBE devices;
-- DESCRIBE it_in_charge;
-- DESCRIBE items;
-- DESCRIBE task_types;



-- ALTER TABLE departments ADD COLUMN departmentNo VARCHAR(50) UNIQUE DEFAULT NULL;
-- ALTER TABLE departments DROP COLUMN departmentNo;

-- -- Insert into task_types
-- INSERT INTO task_types (name) VALUES ('Bug Fix'), ('Feature Request'), ('Hardware Issue');

-- -- Insert into it_in_charge
-- INSERT INTO it_in_charge (name) VALUES ('John Doe'), ('Jane Smith');

-- Insert into departments
-- INSERT INTO departments (name, department_no) VALUES ('IT', '123'), ('Marketing', '321');

-- Insert into items
-- INSERT INTO items (name) VALUES ('Monitor'), ('Keyboard');

-- Insert into devices
-- INSERT INTO devices (name) VALUES ('Acer Laptop'), ('Dell Desktop');

-- Insert into applications
-- INSERT INTO applications (name) VALUES ('MS Office'), ('Google Chrome');

-- SET FOREIGN_KEY_CHECKS = 0;
-- DELETE FROM departments WHERE id = 1;
-- DELETE FROM departments WHERE id = 2;
-- SET FOREIGN_KEY_CHECKS = 1;

-- SET FOREIGN_KEY_CHECKS = 0; 
-- DELETE FROM task_types WHERE id = 24;
-- SET FOREIGN_KEY_CHECKS = 1;

-- TRUNCATE tasks;



SELECT * FROM tasks ORDER BY id DESC;
SELECT * FROM task_types;
SELECT * FROM departments;
SELECT * FROM it_in_charge;
SELECT * FROM items;
SELECT * FROM devices;
SELECT * FROM applications;
SELECT * FROM users;
 
 

-- ALTER TABLE users
-- ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user',
-- ADD COLUMN department INT DEFAULT NULL,
-- ADD CONSTRAINT fk_department FOREIGN KEY (department) REFERENCES departments(id);

-- SELECT username, first_name, last_name, `password`
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

