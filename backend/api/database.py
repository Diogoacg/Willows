import mysql.connector
from mysql.connector import Error

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='cafe_db',
            user='root',
            password='basededados24'
        )
        return connection
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None

def init_db():
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute('CREATE DATABASE IF NOT EXISTS cafe_db')
            cursor.execute('USE cafe_db')
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pedidos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    item VARCHAR(255) NOT NULL,
                    quantidade INT NOT NULL
                )
            ''')
            connection.commit()
        except Error as e:
            print(f"Erro ao inicializar o banco de dados: {e}")
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
