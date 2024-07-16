import React, { useState, useEffect, useCallback } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import { io } from "socket.io-client";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import store from "./store";
import HomePage from "./screens/HomePage";
import PedidosScreen from "./screens/PedidosScreen";
import LoginScreen from "./screens/LoginScreen";
import FuncionariosScreen from "./screens/Funcionarios";
import DetalhesFuncionarioScreen from "./screens/DetalhesFuncionarioScreen";
import CriarFuncionarioScreen from "./screens/CriarFuncionarioScreen";
import GerirPedidos from "./screens/GerirPedidos";

const COLORS = {
  primary: "#15191d",
  secondary: "#212529",
  accent: "#FF6A3D",
  neutral: "#313b4b",
  text: "#c7c7c7",
};

const SOCKET_URL = "https://willows-production.up.railway.app";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ route, focused, color }) => {
  const iconName =
    route.name === "Pedidos"
      ? focused
        ? "cart"
        : "cart-outline"
      : focused
      ? "settings"
      : "settings-outline";

  return <Ionicons name={iconName} size={focused ? 24 : 20} color={color} />;
};

const TabPrincipal = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("Connected to Socket.IO server"));

    return () => newSocket.disconnect();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon route={route} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: COLORS.neutral,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Pedidos" component={PedidosScreen} />
      <Tab.Screen name="Gerir Pedidos" component={GerirPedidos} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [userToken, setUserToken] = useState(null);

  const handleLogin = useCallback((token) => {
    setUserToken(token);
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: COLORS.primary,
    },
  };

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <View style={styles.wrapper}>
          <StatusBar
            backgroundColor={COLORS.primary}
            barStyle="light-content"
          />
          <NavigationContainer theme={theme}>
            {!userToken ? (
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  cardStyle: { backgroundColor: COLORS.primary },
                  ...TransitionPresets.SlideFromRightIOS,
                }}
              >
                <Stack.Screen name="Login">
                  {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
                </Stack.Screen>
              </Stack.Navigator>
            ) : (
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  cardStyle: { backgroundColor: COLORS.primary },
                  ...TransitionPresets.SlideFromRightIOS,
                }}
              >
                <Stack.Screen name="Home" component={HomePage} />
                <Stack.Screen name="Main" component={TabPrincipal} />
                <Stack.Screen name="GerirPedidos" component={GerirPedidos} />
                <Stack.Screen name="Gestao" component={FuncionariosScreen} />
                <Stack.Screen
                  name="DetalhesFuncionario"
                  component={DetalhesFuncionarioScreen}
                />
                <Stack.Screen
                  name="CriarFuncionario"
                  component={CriarFuncionarioScreen}
                />
              </Stack.Navigator>
            )}
          </NavigationContainer>
        </View>
      </PaperProvider>
    </ReduxProvider>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});

export default App;
