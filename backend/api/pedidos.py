from flask_restx import Namespace, Resource, fields
from backend.api.database import get_db_connection
from mysql.connector import Error

ns = Namespace('pedidos', description='Operações de pedidos')

pedido_model = ns.model('Pedido', {
    'item': fields.String(required=True, description='Nome do item'),
    'quantidade': fields.Integer(required=True, description='Quantidade do item')
})

pedido_list_model = ns.model('ListaPedidos', {
    'id': fields.Integer(readonly=True, description='ID do pedido'),
    'item': fields.String(required=True, description='Nome do item'),
    'quantidade': fields.Integer(required=True, description='Quantidade do item')
})

@ns.route('/pedido')
class Pedido(Resource):
    @ns.expect(pedido_model)
    @ns.response(201, 'Pedido criado com sucesso')
    def post(self):
        data = ns.payload
        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor()
                cursor.execute('INSERT INTO pedidos (item, quantidade) VALUES (%s, %s)',
                               (data['item'], data['quantidade']))
                connection.commit()
                return {"message": "Pedido criado com sucesso!"}, 201
            except Error as e:
                return {"error": str(e)}, 500
            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        else:
            return {"error": "Não foi possível conectar ao banco de dados"}, 500

@ns.route('/pedidos')
class ListaPedidos(Resource):
    @ns.marshal_list_with(pedido_list_model)
    def get(self):
        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor(dictionary=True)
                cursor.execute('SELECT * FROM pedidos')
                pedidos = cursor.fetchall()
                return pedidos
            except Error as e:
                return {"error": str(e)}, 500
            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        else:
            return {"error": "Não foi possível conectar ao banco de dados"}, 500
