import { REACT_APP_API_URL } from "@env";

// Função para criar um novo item no inventário
export const criarNovoItem = async (token, nome, preco) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, preco }),
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

// Função para obter todos os itens do inventário
export const obterItensDoInventario = async () => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/inventory`);

    if (!response.ok) {
      console.log("response", response);
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    console.log("response", response.data);

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Função para atualizar um item no inventário
export const atualizarItemNoInventario = async (token, id, nome, preco) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, preco }),
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

// Função para deletar um item do inventário
export const deletarItemDoInventario = async (token, id) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/inventory/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Item deletado com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};
