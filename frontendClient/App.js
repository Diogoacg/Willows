import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from "react-native-paper";
import PedidosPopularesScreen from "./screens/PedidosPopularesScreen";
import PesquisaScreen from "./screens/PesquisaScreen";
import LoginScreen from "./screens/LoginScreen";
import HomePage from "./screens/HomePage";

const Tab = createMaterialBottomTabNavigator();

const Stack = createStackNavigator();

const App = () => {
  const [userToken, setUserToken] = useState(null); // Estado para verificar se o usuário está logado

  // Função para definir o token do usuário após o login
  const handleLogin = (token) => {
    setUserToken(token);
  };

  // Se o usuário não estiver logado, exiba a tela de login
  if (!userToken) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Após o login, exiba a tela principal com as abas
  return (
    <PaperProvider>
      <NavigationContainer>
        <StackPrincipal />
      </NavigationContainer>
    </PaperProvider>
  );
};

function TabPrincipal () {
  return (
        <Tab.Navigator
          activeColor="#FFFFFF" // Cor do ícone ativo
          inactiveColor="#FFFFFF" // Cor do ícone inativo
          barStyle={{ backgroundColor: '#f0f0f0'}}>
          <Tab.Screen
            name="Pedidos Populares"
            component={PedidosPopularesScreen}
            options={{
              tabBarIcon: () => (
                <Ionicons
                  name="star-outline"
                  size={21}
                />
              ),
            }}
          />
          <Tab.Screen 
            name="Pesquisa"
            component={PesquisaScreen}
            options={{
              tabBarIcon: () => (
                <Ionicons
                  name="search-outline"
                  size={21}
                />
              ),
            }}
          />
        </Tab.Navigator>
  );
};

function StackPrincipal (){
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomePage"
        component={HomePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PedidosPopulares" 
        component={TabPrincipal}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default App;
