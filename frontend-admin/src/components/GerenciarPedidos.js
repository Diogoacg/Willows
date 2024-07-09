import React, { useState, useEffect } from "react";
import axios from "axios";

function GerenciarPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

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

  const atualizarStatus = async (id, novoStatus) => {
    try {
      console.log("Atualizando status do pedido", id, novoStatus);
      await axios.put(`${process.env.REACT_APP_API_URL}/pedidos/${id}`, {
        status: novoStatus,
      });
      console.log("Status atualizado com sucesso");
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao atualizar status", error);
    }
  };

  return (
    <div>
      <h2>Gerenciar Pedidos</h2>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            {pedido.item} - Quantidade: {pedido.quantidade} - Status:{" "}
            {pedido.status}
            <button onClick={() => atualizarStatus(pedido.id, "em_preparo")}>
              Em Preparo
            </button>
            <button onClick={() => atualizarStatus(pedido.id, "pronto")}>
              Pronto
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GerenciarPedidos;
