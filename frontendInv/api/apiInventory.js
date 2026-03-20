import { REACT_APP_API_URL } from "@env";

export const criarNovoItem = async (token, nome, preco, descricao, categoria, ingredientes) => {
  const response = await fetch(`${REACT_APP_API_URL}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome, preco, descricao, categoria, ingredientes }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

export const obterItensDoInventario = async () => {
  const response = await fetch(`${REACT_APP_API_URL}/inventory`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

// ingredientes: [{ id, quantidade }]
export const atualizarItemNoInventario = async (token, id, nome, preco, descricao, categoria, disponivel, ingredientes) => {
  const response = await fetch(`${REACT_APP_API_URL}/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome, preco, descricao, categoria, disponivel, ingredientes }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

export const deletarItemDoInventario = async (token, id) => {
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

  return { message: "Item eliminado com sucesso" };
};
