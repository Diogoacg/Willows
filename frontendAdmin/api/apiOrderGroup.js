import { REACT_APP_API_URL } from "@env";

// Função para criar um novo grupo de pedidos
export const criarNovoGrupoDePedidos = async (token, orderData) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/order-groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
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
// Função para deletar um grupo de pedidos
export const deletarGrupoDePedidos = async (token, id) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/order-groups/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Grupo de pedidos deletado com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Função para obter todos os grupos de pedidos
export const obterGruposDePedidos = async (token) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/order-groups`, {
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
    console.error("Erro ao buscar grupos de pedidos:", error);
    throw new Error(error.message);
  }
};

// Função para atualizar o status de um grupo de pedidos
export const atualizarStatusDoGrupoDePedidos = async (token, id, status) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/order-groups/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Status do grupo de pedidos atualizado com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// funçao para os a app cliente, na admin usar a funçao obterGruposDePedidos
export const obterPedidosPorUtilizador = async (token, userId) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/order-groups/ordersbyuser/${userId}`,
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
