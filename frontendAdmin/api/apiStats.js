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

export const obterLucroTotalPorUsuario = async (token, userId) => {
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

    // Filtra os dados para encontrar o lucro total do usuário específico
    const lucroTotalPorUsuario = data.find((item) => item.userId === userId);

    if (!lucroTotalPorUsuario) {
      throw new Error(
        `Lucro total não encontrado para o usuário com ID ${userId}`
      );
    }

    return lucroTotalPorUsuario;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const obterTotalPedidosPorUsuario = async (token, userId) => {
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

    const totalPedidosPorUsuario = data.find((item) => item.userId === userId);

    return totalPedidosPorUsuario;
  } catch (error) {
    throw new Error(error.message);
  }
};
