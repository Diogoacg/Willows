import React, { useState, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import store from "./store";
import HomePage from "./screens/HomePage";
import PedidosScreen from "./screens/PedidosScreen";
import LoginScreen from "./screens/LoginScreen";
import FuncionariosScreen from "./screens/Funcionarios";
import DetalhesFuncionarioScreen from "./screens/DetalhesFuncionarioScreen";
import CriarFuncionarioScreen from "./screens/CriarFuncionarioScreen";
import GerirPedidos from "./screens/GerirPedidos";
import io from "socket.io-client";

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

// URL do servidor Socket.IO (substitua pelo endereço do seu backend)
//const socketUrl = "http://localhost:5000"; // Exemplo de URL, ajuste conforme necessário
const socketUrl = "https://willows-production.up.railway.app";
const TabPrincipal = ({ navigation }) => {
  const [socket, setSocket] = useState(null);

  // Conectar ao servidor Socket.IO ao montar o componente
  useEffect(() => {
    const socket = io(socketUrl);
    setSocket(socket);

    // Lidar com eventos recebidos do servidor
    socket.on("connect", () => {
      console.log("Conectado ao servidor Socket.IO");
    });

    // Retornar uma função de limpeza para desconectar o socket ao desmontar o componente
    return () => {
      socket.disconnect();
    };
  }, []);

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
              color={focused ? "#000" : color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Gerir Pedidos"
        component={GerirPedidos}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="settings-outline"
              size={focused ? 24 : 20}
              color={focused ? "#000" : color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [userToken, setUserToken] = useState(null);

  const [socket, setSocket] = useState(null);

  // Conectar ao servidor Socket.IO ao montar o componente
  useEffect(() => {
    const socket = io(socketUrl);
    setSocket(socket);

    // Lidar com eventos recebidos do servidor
    socket.on("connect", () => {
      console.log("Conectado ao servidor Socket.IO");
    });

    // Retornar uma função de limpeza para desconectar o socket ao desmontar o componente
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogin = (token) => {
    setUserToken(token);
  };

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer>
          {!userToken ? (
            <Stack.Navigator>
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
            </Stack.Navigator>
          ) : (
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
                name="GerirPedidos"
                component={GerirPedidos}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Gestao"
                component={FuncionariosScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DetalhesFuncionario"
                component={DetalhesFuncionarioScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CriarFuncionario"
                component={CriarFuncionarioScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;
