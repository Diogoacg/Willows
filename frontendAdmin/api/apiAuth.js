import { REACT_APP_AUTH_URL } from "@env";

// Função para realizar login
export const realizarLogin = async (loginData) => {
  try {
    const response = await fetch(`${REACT_APP_AUTH_URL}/login`, {
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

// Função para registar um novo utilizador
export const registarNovoUtilizador = async (
  token,
  username,
  email,
  password,
  role
) => {
  console.log("userData", { username, email, password, role });
  try {
    const response = await fetch(`${REACT_APP_AUTH_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, role }),
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

// Função para atualizar informações do utilizador
export const atualizarInformacoesDoUsuario = async (token, userData) => {
  try {
    const response = await fetch(
      `${REACT_APP_AUTH_URL}/update-role/${userData.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Informações do usuário atualizadas com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// delete user

export const deleteUser = async (token, userId) => {
  try {
    const response = await fetch(`${REACT_APP_AUTH_URL}/delete/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return { message: "Utilizador eliminado com sucesso" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Função para obter todos os utilizadores
export const obterTodosOsUtilizadores = async (token) => {
  try {
    const response = await fetch(`${REACT_APP_AUTH_URL}/all`, {
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
    throw new Error(error.message);
  }
};

// Função para obter informações de um utilizador
export const obterInformacoesDoUtilizador = async (token, userId) => {
  try {
    const response = await fetch(`${REACT_APP_AUTH_URL}/${userId}`, {
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
    throw new Error(error.message);
  }
};
