import { REACT_APP_API_URL } from "@env";

export const registarMovimento = async (token, { ingredienteId, quantidade, tipo, observacoes }) => {
  const response = await fetch(`${REACT_APP_API_URL}/movimentos-stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ingredienteId, quantidade, tipo, observacoes }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};

export const obterMovimentos = async (token, { ingredienteId, periodo, tipo } = {}) => {
  const params = new URLSearchParams();
  if (ingredienteId) params.append("ingredienteId", ingredienteId);
  if (periodo) params.append("periodo", periodo);
  if (tipo) params.append("tipo", tipo);

  const response = await fetch(`${REACT_APP_API_URL}/movimentos-stock?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};
