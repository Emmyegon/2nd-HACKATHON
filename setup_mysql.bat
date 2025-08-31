@echo off
echo 🍳 Recipe Recommender MySQL Setup
echo ======================================
echo.
echo This script will help you create the database and grant privileges.
echo You need to run this as a user with MySQL root access.
echo.
echo 1. Make sure MySQL server is running
echo 2. You will be prompted for the MySQL root password
echo 3. The script will create the recipe_db database
echo 4. It will grant privileges to the gerald user
echo.
pause

echo.
echo Connecting to MySQL as root...
mysql -u root -p < create_database.sql

echo.
echo Database setup complete!
echo Now you can run: python setup_database_simple.py
pause

