import { REACT_APP_API_URL } from "@env";

export const criarNovoIngrediente = async (token, { nome, quantidade, unidade, quantidadeMinima, toleranciaVariancia }) => {
  const response = await fetch(`${REACT_APP_API_URL}/ingredientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome, quantidade, unidade, quantidadeMinima, toleranciaVariancia }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

export const obterIngredientesDoInventario = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${REACT_APP_API_URL}/ingredientes`, { headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

export const atualizarIngredienteNoInventario = async (token, id, { nome, quantidade, unidade, quantidadeMinima, toleranciaVariancia }) => {
  const response = await fetch(`${REACT_APP_API_URL}/ingredientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nome, quantidade, unidade, quantidadeMinima, toleranciaVariancia }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

export const deletarIngredienteDoInventario = async (token, id) => {
  const response = await fetch(`${REACT_APP_API_URL}/ingredientes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return { message: "Ingrediente eliminado com sucesso" };
};
