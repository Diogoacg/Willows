import React, { useState, useEffect } from "react";
import axios from "axios";

function Estatisticas() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/pedidos/stats`
        );
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2>Estatísticas</h2>
      <p>Total de Pedidos: {stats.totalPedidos}</p>
      <p>Total de Itens: {stats.totalItens}</p>
    </div>
  );
}

export default Estatisticas; // Exportando a função Estatisticas como default
