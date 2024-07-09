import React, { useState } from "react";
import axios from "axios";

function FazerPedido() {
  const [item, setItem] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/pedidos`, {
        item,
        quantidade,
      });
      alert("Pedido feito com sucesso!");
      setItem("");
      setQuantidade(1);
    } catch (error) {
      alert("Erro ao fazer pedido");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        placeholder="Item"
        required
      />
      <input
        type="number"
        value={quantidade}
        onChange={(e) => setQuantidade(parseInt(e.target.value))}
        min="1"
        required
      />
      <button type="submit">Fazer Pedido</button>
    </form>
  );
}

export default FazerPedido;
