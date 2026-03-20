import { REACT_APP_API_URL } from "@env";

export const obterIngredientesDoInventario = async (token) => {
  const response = await fetch(`${REACT_APP_API_URL}/ingredientes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};
