// App.js

import React, { useState, useEffect, useCallback } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Platform } from "react-native";
import { io } from "socket.io-client";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider, useTheme } from "./ThemeContext";
import store from "./store";
import HomePage from "./screens/HomePage";
import PedidosScreen from "./screens/PedidosScreen";
import LoginScreen from "./screens/LoginScreen";
import FuncionariosScreen from "./screens/Funcionarios";
import DetalhesFuncionarioScreen from "./screens/DetalhesFuncionarioScreen";
import CriarFuncionarioScreen from "./screens/CriarFuncionarioScreen";
import GerirPedidos from "./screens/GerirPedidos";
import * as NavigationBar from "expo-navigation-bar";
import { colors } from "./config/theme";
import StatsScreen from "./screens/StatsScreen";
import CriarItemScreen from "./screens/CriarItemScreen";
import InventarioScreen from "./screens/InventarioScreen";
import EditaItemScreen from "./screens/EditaItemScreen";
import EditaFuncionarioScreen from "./screens/EditaFuncionariosScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();

const SOCKET_URL = "https://willows-production.up.railway.app";

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
  const { isDarkMode } = useTheme();
  const [socket, setSocket] = useState(null);
  const theme = isDarkMode ? DarkTheme : DefaultTheme;
  const COLORS = isDarkMode ? colors.dark : colors.light;

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

const DrawerContent = (props) => {
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={() => {
          // Handle logout
        }}
        labelStyle={{ color: COLORS.text }}
      />
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="Main" component={TabPrincipal} />
      <Drawer.Screen name="Gestao" component={FuncionariosScreen} />
      <Drawer.Screen name="Estatisticas" component={StatsScreen} />
      <Drawer.Screen name="Inventario" component={InventarioScreen} />
    </Drawer.Navigator>
  );
};

const AppContent = () => {
  const [userToken, setUserToken] = useState(null);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    const changeNavigationBarColor = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync(
          isDarkMode ? "#000000" : "#FFFFFF"
        );
      } catch (err) {
        console.error("Failed to change navigation bar color:", err);
      }
    };

    if (Platform.OS === "android") {
      changeNavigationBarColor();
    }
  }, [isDarkMode]);

  const handleLogin = (token) => {
    setUserToken(token);
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        {!userToken ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            <Stack.Screen name="Estatisticas" component={StatsScreen} />
            <Stack.Screen name="CriarItem" component={CriarItemScreen} />
            <Stack.Screen name="Inventario" component={InventarioScreen} />
            <Stack.Screen name="EditaItem" component={EditaItemScreen} />
            <Stack.Screen
              name="EditaFuncionario"
              component={EditaFuncionarioScreen}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
};

const App = () => {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ReduxProvider>
  );
};

export default App;
