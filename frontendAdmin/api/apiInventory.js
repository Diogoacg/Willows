import { REACT_APP_API_URL } from "@env";

// Função para criar um novo item no inventário
export const criarNovoItem = async (token, nome, preco, imageUri) => {
  console.log(REACT_APP_API_URL);
  console.log(token);
  console.log(nome);
  console.log(preco);
  try {
    const response = await fetch(`${REACT_APP_API_URL}/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, preco, imageUri }),
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
  console.log(REACT_APP_API_URL);
  try {
    const response = await fetch(`${REACT_APP_API_URL}/inventory`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Função para atualizar um item no inventário
export const atualizarItemNoInventario = async (
  token,
  id,
  nome,
  preco,
  imageUri = null
) => {
  try {
    const bodyData = { nome, preco };
    if (imageUri) {
      bodyData.imageUri = imageUri;
    }

    const response = await fetch(`${REACT_APP_API_URL}/inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
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
