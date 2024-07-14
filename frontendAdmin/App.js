import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";
import HomePage from "./screens/HomePage";
import PedidosScreen from "./screens/PedidosScreen";
import GerenciarPedidos from "./components/GerenciarPedidos";
import LoginScreen from "./screens/LoginScreen";
import FuncionariosScreen from "./screens/Funcionarios";

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const TabPrincipal = () => {
  return (
    <Tab.Navigator
      activeColor="#000"
      inactiveColor="#000"
      barStyle={{ backgroundColor: "#f0f0f0" }}
    >
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="cart-outline"
              size={focused ? 24 : 20}
              color={focused ? '#000' : color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Gerir Pedidos"
        component={GerenciarPedidos}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name="settings-outline"
              size={focused ? 24 : 20}
              color={focused ? '#000' : color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [userToken, setUserToken] = useState(null);

  const handleLogin = (token) => {
    setUserToken(token);
  };

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          {/* {!userToken ? (
            <LoginScreen onLogin={handleLogin} />
          ) : ( */}
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={HomePage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Main"
                component={TabPrincipal}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="GerenciarPedidos"
                component={GerenciarPedidos}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Gestao"
                component={FuncionariosScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;
