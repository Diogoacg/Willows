// src/navigators/DrawerNavigator.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

// Import screens
import TabNavigator from "./TabNavigator";
import FuncionariosScreen from "../screens/Funcionarios";
import InventarioScreen from "../screens/InventarioScreen";
import StatsScreen from "../screens/StatsScreen";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ onLogout }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} onLogout={onLogout} />
      )}
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
        gestureEnabled: true, // Enable swipe gestures
      }}
    >
      <Drawer.Screen name="Pedidos" component={TabNavigator} />
      <Drawer.Screen name="Funcionarios" component={FuncionariosScreen} />
      <Drawer.Screen name="Inventario" component={InventarioScreen} />
      <Drawer.Screen name="Estatisticas" component={StatsScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
