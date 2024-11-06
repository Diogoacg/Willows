import { REACT_APP_API_URL } from "@env";

// Função para criar um novo ingrediente no inventário
export const criarNovoIngrediente = async (token, nome, quantidade, unidade) => {
  console.log(REACT_APP_API_URL);
  console.log(token);
  console.log(nome);
  console.log(quantidade);
  console.log(unidade);
  try {
    const response = await fetch(`${REACT_APP_API_URL}/ingredientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, quantidade, unidade }),
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

// Função para obter todos os ingredientes do inventário
export const obterIngredientesDoInventario = async () => {
  console.log(REACT_APP_API_URL);
  try {
    const response = await fetch(`${REACT_APP_API_URL}/ingredientes`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Função para atualizar um ingrediente no inventário
export const atualizarIngredienteNoInventario = async (
  token,
  id,
  nome,
  quantidade,
  unidade
) => {
  try {
    const bodyData = { nome, quantidade, unidade };

    const response = await fetch(`${REACT_APP_API_URL}/ingredientes/${id}`, {
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

// Função para deletar um ingrediente do inventário
export const deletarIngredienteDoInventario = async (token, id) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/ingredientes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Ingrediente deletado com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};
