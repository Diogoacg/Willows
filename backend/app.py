from flask import Flask
from backend.api.pedidos import ns as pedidos_namespace
from flask_restx import Api
from backend.api.database import init_db

app = Flask(__name__)
api = Api(app, version='1.0', title='API do Café',
          description='Uma API simples para gerenciamento de pedidos de café')

api.add_namespace(pedidos_namespace, path='/cafe')

if __name__ == '__main__':
    init_db()  # Inicializa o banco de dados
    app.run(debug=True)
