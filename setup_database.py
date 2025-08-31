import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Setup MySQL database and tables for the recipe recommender"""
    
    # Database connection parameters
    host = 'localhost'
    user = os.getenv('MYSQL_USER', 'root')  # Get from environment or default to 'root'
    password = os.getenv('MYSQL_PASSWORD', '')  # Get from environment or default to empty
    database_name = 'recipe_db'
    
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database if it doesn't exist
        print(f"Creating database '{database_name}' if it doesn't exist...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
        cursor.execute(f"USE {database_name}")
        
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
        
        # Commit changes
        connection.commit()
        print("Database setup completed successfully!")
        
        # Show tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"Tables created: {[table[0] for table in tables]}")
        
    except Exception as e:
        print(f"Error setting up database: {e}")
        print("\nMake sure:")
        print("1. MySQL server is running")
        print("2. MySQL credentials are correct")
        print("3. MySQL user has CREATE privileges")
        
    finally:
        if 'connection' in locals():
            connection.close()

def create_sample_user():
    """Create a sample user for testing"""
    try:
        from werkzeug.security import generate_password_hash
        
        # Get database parameters
        host = 'localhost'
        user = os.getenv('MYSQL_USER', 'root')
        password = os.getenv('MYSQL_PASSWORD', '')
        database_name = 'recipe_db'
        
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database_name,
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Check if sample user exists
        cursor.execute("SELECT id FROM user WHERE username = 'demo'")
        if cursor.fetchone():
            print("Sample user 'demo' already exists")
            return
        
        # Create sample user
        password_hash = generate_password_hash('demo123')
        cursor.execute("""
            INSERT INTO user (username, email, password_hash)
            VALUES (%s, %s, %s)
        """, ('demo', 'demo@example.com', password_hash))
        
        connection.commit()
        print("Sample user created:")
        print("Username: demo")
        print("Password: demo123")
        print("Email: demo@example.com")
        
    except Exception as e:
        print(f"Error creating sample user: {e}")
        
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    print("Setting up Recipe Recommender Database...")
    print("=" * 50)
    
    setup_database()
    print("\n" + "=" * 50)
    create_sample_user()
    
    print("\nSetup complete!")
    print("\nNext steps:")
    print("1. Update your .env file with your MySQL credentials")
    print("2. Add your OpenAI API key to the .env file")
    print("3. Run 'python app.py' to start the application")
