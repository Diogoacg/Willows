// App.js
import React, { useState, useEffect } from "react";
import "react-native-gesture-handler";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { io } from "socket.io-client";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigation,
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
import StatsScreen from "./screens/StatsScreen";
import CriarItemScreen from "./screens/CriarItemScreen";
import InventarioScreen from "./screens/InventarioScreen";
import EditaItemScreen from "./screens/EditaItemScreen";
import EditaFuncionarioScreen from "./screens/EditaFuncionariosScreen";
import { colors } from "./config/theme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

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

const CustomDrawerHeader = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.primary }]}>
      <Ionicons
        name="menu"
        size={24}
        color={theme.text}
        onPress={() => navigation.openDrawer()}
      />
    </View>
  );
};

const MenuContent = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
          borderBottomWidth: 1,
          borderBottomColor: theme.neutral,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerLeft: () => <CustomDrawerHeader />,
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            {/* Add more header actions here */}
          </View>
        ),
        drawerActiveTintColor: theme.primary, // Cor do texto do item ativo
        drawerActiveBackgroundColor: theme.accent, // Cor de fundo do item ativo
  }}
    >
      <Drawer.Screen name="Pedidos" component={PedidosScreen} />
      <Drawer.Screen name="Funcionarios" component={FuncionariosScreen} />
      <Drawer.Screen name="Inventario" component={InventarioScreen} />
      <Drawer.Screen name="Estatisticas" component={StatsScreen} />
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
            <Stack.Screen name="Menu" component={MenuContent} />
            <Stack.Screen name="Home" component={HomePage} />
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
            <Stack.Screen name="CriarItem" component={CriarItemScreen} />
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

const styles = StyleSheet.create({
  headerContainer: {
    marginLeft: 10,
  },
  headerRightContainer: {
    marginRight: 10,
  },
});

export default App;
