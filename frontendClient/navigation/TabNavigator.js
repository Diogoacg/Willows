// src/navigation/TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PedidosScreen from "../screens/PedidosScreen";
import GerirPedidos from "../screens/GerirPedidos";
import TabIcon from "../components/TabIcon";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

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
      <Tab.Screen name="Fazer Pedido" component={PedidosScreen} />
      <Tab.Screen name="Gerir Pedidos" component={GerirPedidos} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
