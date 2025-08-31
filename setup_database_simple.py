#!/usr/bin/env python3
"""
Simplified Database Setup Script for Recipe Recommender
This script works with existing database users
"""

import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Setup database tables for the recipe recommender"""
    
    # Database connection parameters
    host = 'localhost'
    user = os.getenv('MYSQL_USER', 'gerald')
    password = os.getenv('MYSQL_PASSWORD', '1234')
    database_name = 'recipe_db'
    
    try:
        # First, try to connect to the specific database
        print(f"Connecting to database '{database_name}'...")
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database_name,
            charset='utf8mb4'
        )
        print("✅ Connected to existing database!")
        
    except pymysql.Error as e:
        if e.args[0] == 1049:  # Database doesn't exist
            print(f"❌ Database '{database_name}' doesn't exist.")
            print("Please create the database manually first:")
            print(f"1. Connect to MySQL as root: mysql -u root -p")
            print(f"2. Create database: CREATE DATABASE {database_name};")
            print(f"3. Grant privileges: GRANT ALL PRIVILEGES ON {database_name}.* TO '{user}'@'localhost';")
            print(f"4. Flush privileges: FLUSH PRIVILEGES;")
            print(f"5. Run this script again.")
            return False
        else:
            print(f"❌ Connection error: {e}")
            return False
    
    try:
        cursor = connection.cursor()
        
        # Create users table
        print("Creating users table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Users table created/verified")
        
        # Create recipes table
        print("Creating recipes table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recipe (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                ingredients TEXT NOT NULL,
                instructions TEXT NOT NULL,
                cooking_time VARCHAR(50),
                difficulty VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_id INT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )
        """)
        print("✅ Recipes table created/verified")
        
        # Commit changes
        connection.commit()
        
        # Show tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"✅ Tables in database: {[table[0] for table in tables]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
        
    finally:
        if 'connection' in locals():
            connection.close()

def create_sample_user():
    """Create a sample user for testing"""
    try:
        from werkzeug.security import generate_password_hash
        
        connection = pymysql.connect(
            host='localhost',
            user=os.getenv('MYSQL_USER', 'gerald'),
            password=os.getenv('MYSQL_PASSWORD', '1234'),
            database='recipe_db',
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Check if sample user exists
        cursor.execute("SELECT id FROM user WHERE username = 'demo'")
        if cursor.fetchone():
            print("✅ Sample user 'demo' already exists")
            return True
        
        # Create sample user
        password_hash = generate_password_hash('demo123')
        cursor.execute("""
            INSERT INTO user (username, email, password_hash)
            VALUES (%s, %s, %s)
        """, ('demo', 'demo@example.com', password_hash))
        
        connection.commit()
        print("✅ Sample user created:")
        print("   Username: demo")
        print("   Password: demo123")
        print("   Email: demo@example.com")
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample user: {e}")
        return False
        
    finally:
        if 'connection' in locals():
            connection.close()

def main():
    """Main setup function"""
    print("🍳 Recipe Recommender Database Setup")
    print("=" * 50)
    
    if setup_database():
        print("\n" + "=" * 50)
        create_sample_user()
        print("\n✅ Database setup completed successfully!")
        print("\n🚀 You can now run: python app.py")
    else:
        print("\n❌ Database setup failed. Please check the error messages above.")

if __name__ == "__main__":
    main()

