-- Recipe Recommender Database Setup Script
-- Run this script as MySQL root user

-- Create the database
CREATE DATABASE IF NOT EXISTS recipe_db;

-- Grant privileges to the gerald user
GRANT ALL PRIVILEGES ON recipe_db.* TO 'gerald'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show the result
SHOW DATABASES;
SELECT User, Host, Db FROM mysql.db WHERE Db = 'recipe_db';

