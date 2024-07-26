// src/components/TabIcon.js
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

const TabIcon = ({ route, focused, color }) => {
  const iconName =
    route.name === "Fazer Pedido"
      ? focused
        ? "cart"
        : "cart-outline"
      : focused
      ? "settings"
      : "settings-outline";
  return <Ionicons name={iconName} size={focused ? 24 : 20} color={color} />;
};

export default TabIcon;
