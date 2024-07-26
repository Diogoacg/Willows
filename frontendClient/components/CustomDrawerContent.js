// src/components/CustomDrawerContent.js
import React from "react";
import { View, Pressable, Text, StyleSheet, Alert } from "react-native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const CustomDrawerContent = ({ navigation, state, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? colors.dark : colors.light;

  const handleLogout = async () => {
    try {
      await onLogout();
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Erro", "Erro ao fazer logout: " + error.message);
      console.error("Failed to logout:", error);
    }
  };

  const iconMapping = {
    Pedidos: "cart-outline",
    Funcionarios: "people-outline",
    Inventario: "cube-outline",
    Estatisticas: "stats-chart-outline",
  };

  const themeIcon = isDarkMode ? "moon-outline" : "sunny-outline";

  return (
    <View style={[styles.drawerContainer, { backgroundColor: theme.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.text }]}>WILLOW'S</Text>
      </View>
      <View style={styles.menuOptions}>
        {state.routeNames.map((name, index) => {
          // Check if the current route is the selected one
          const isSelected = state.index === index;
          return (
            <Pressable
              key={name}
              onPress={() => navigation.navigate(name)}
              style={[
                styles.drawerItem,
                isSelected && {
                  backgroundColor: `rgba(${theme.accentRgb}, 0.8)`,
                },
              ]}
            >
              <Ionicons
                name={iconMapping[name]}
                size={20}
                color={theme.text}
                style={styles.icon}
              />
              <Text style={[styles.drawerItemText, { color: theme.text }]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={toggleTheme} style={styles.drawerItem}>
        <Ionicons
          name={themeIcon}
          size={24}
          color={theme.text}
          style={styles.icon}
        />
      </Pressable>
      <Pressable onPress={handleLogout} style={styles.drawerItem}>
        <Ionicons
          name="log-out-outline"
          size={24}
          color={theme.accent}
          style={styles.icon}
        />
        <Text style={[styles.drawerItemText, { color: theme.accent }]}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: hp("4%"),
  },
  header: {
    marginTop: hp("4%"),
    marginBottom: hp("1%"),
  },
  headerText: {
    fontSize: wp('5.7%'),
    fontWeight: "bold",
  },
  menuOptions: {
    flex: 1,
    marginTop: hp("4%"),
    justifyContent: "flex-start",
  },
  drawerItem: {
    marginBottom: hp("4%"),
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: hp("1%"), // Add some vertical padding
    paddingHorizontal: wp("3%"), // Add some horizontal padding
    borderRadius: wp('2%'),
  },
  drawerItemText: {
    fontSize: wp('4%'),
    marginLeft: wp('2.5%'),
  },
  icon: {
    marginRight: wp('2.5%'),
  },
});

export default CustomDrawerContent;
