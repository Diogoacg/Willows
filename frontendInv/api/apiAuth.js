import { REACT_APP_AUTH_URL } from "@env";

// // Função para realizar login para um utilizador
// export const realizarLogin = async (loginData) => {
//   try {
//     const response = await fetch(`${REACT_APP_AUTH_URL}/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(loginData),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message);
//     }

//     return await response.json();
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// Função para login utizador com role de admin
export const realizarLoginAdmin = async (loginData) => {
  console.log(loginData);
  try {
    const response = await fetch(`${REACT_APP_AUTH_URL}/login-admin`, {
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
    console.log(response);
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
export const atualizarInformacoesDoUsuario = async (
  token,
  userId,
  userData
) => {
  console.log(userData);
  try {
    const response = await fetch(
      `${REACT_APP_AUTH_URL}/update-role/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      }
    );

    // Verifique o status da resposta e o conteúdo
    const responseText = await response.text();

    if (!response.ok) {
      const errorData = JSON.parse(responseText);
      throw new Error(errorData.message || "Erro desconhecido");
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
