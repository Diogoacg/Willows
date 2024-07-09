import React, { useState, useEffect } from "react";
import axios from "axios";

function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/pedidos`
        );
        setPedidos(response.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos", error);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <div>
      <h2>Meus Pedidos</h2>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            {pedido.item} - Quantidade: {pedido.quantidade} - Status:{" "}
            {pedido.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaPedidos;
