import { REACT_APP_API_URL } from "@env";

// Função para realizar login
export const realizarLogin = async (loginData) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
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

// Função para realizar logout
export const realizarLogout = async (token) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Logout realizado com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Função para registrar um novo usuário
export const registrarNovoUsuario = async (userData) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
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

// Função para atualizar informações do usuário
export const atualizarInformacoesDoUsuario = async (token, userData) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/auth/update-info`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Informações do usuário atualizadas com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};
