import { REACT_APP_API_URL } from "@env";

export const obterVarianciaIngredientes = async (token, periodo = "semana") => {
  const response = await fetch(`${REACT_APP_API_URL}/stats/variancia-ingredientes?periodo=${periodo}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};
