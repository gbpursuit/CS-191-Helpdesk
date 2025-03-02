USE simple_helpdesk;

DESCRIBE users;
DESCRIBE tasks;

SELECT username, first_name, last_name, `password`
FROM users
ORDER BY username;



SELECT *
FROM tasks
ORDER by id;

-- DELETE u1
-- FROM users u1
-- JOIN users u2
--   ON u1.first_name = u2.first_name
--   AND u1.last_name = u2.last_name
--   AND u1.id > u2.id
-- WHERE u1.id > 0;  -- Ensures the WHERE clause includes a key column (id).

