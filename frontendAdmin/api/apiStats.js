import { REACT_APP_API_URL } from "@env";

export const obterLucro = async (token) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/stats/profit`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const obterTotalPedidosDMW = async (token) => {
  try {
    const response = await fetch(
      `${REACT_APP_API_URL}/stats/total-orders-dmw`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const obterLucroTotalPorUsuario = async (token) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/stats/profit-per-user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();

    // Mapeia a resposta para o formato esperado
    const lucroTotalPorUsuario = data.map((item) => ({
      userId: item.userId,
      totalProfit: parseFloat(item.totalProfit).toFixed(2), // Converte para número e fixa duas casas decimais
      totalOrders: item.totalOrders,
      username: item.username,
    }));

    return lucroTotalPorUsuario;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const obterTotalPedidosPorUsuario = async (token) => {
  try {
    const response = await fetch(
      `${REACT_APP_API_URL}/stats/total-orders-per-user`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();

    // Mapeia a resposta para o formato esperado
    const totalPedidosPorUsuario = data.map((item) => ({
      userId: item.userId,
      totalOrders: item.totalOrders,
    }));

    return totalPedidosPorUsuario;
  } catch (error) {
    throw new Error(error.message);
  }
};
