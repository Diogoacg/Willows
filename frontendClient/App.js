// App.js

import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import PedidosPopularesScreen from "./screens/PedidosPopularesScreen";
import PesquisaScreen from "./screens/PesquisaScreen";
import LoginScreen from "./screens/LoginScreen";

const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const [userToken, setUserToken] = useState(null); // Estado para verificar se o usuário está logado

  // // Função para definir o token do usuário após o login
  // const handleLogin = (token) => {
  //   setUserToken(token);
  // };

  // // Se o usuário não estiver logado, exiba a tela de login
  // if (!userToken) {
  //   return <LoginScreen onLogin={handleLogin} />;
  // }

  // Após o login, exiba a tela principal com as abas
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Pedidos Populares"
            component={PedidosPopularesScreen}
          />
          <Tab.Screen name="Pesquisa" component={PesquisaScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
