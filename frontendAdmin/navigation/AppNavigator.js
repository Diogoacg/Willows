// src/navigation/AppNavigator.js
import React, { useEffect, useState } from "react";
import { StatusBar, Platform } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerNavigator from "./DrawerNavigator";
import LoginScreen from "../screens/LoginScreen";
import DetalhesFuncionarioScreen from "../screens/DetalhesFuncionarioScreen";
import CriarFuncionarioScreen from "../screens/CriarFuncionarioScreen";
import EditaFuncionarioScreen from "../screens/EditaFuncionariosScreen";
import CriarItemScreen from "../screens/CriarItemScreen";
import EditaItemScreen from "../screens/EditaItemScreen";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import * as NavigationBar from "expo-navigation-bar";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(
        isDarkMode ? "#000000" : "#FFFFFF"
      ).catch(console.error);
    }
  }, [isDarkMode]);

  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(
      isDarkMode ? colors.dark.primary : colors.light.primary
    );
  }, [isDarkMode]);

  const handleLogin = async (token) => {
    try {
      await AsyncStorage.setItem("token", token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error saving login token:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await AsyncStorage.removeItem("token");
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main">
              {(props) => (
                <DrawerNavigator {...props} onLogout={handleLogout} />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="DetalhesFuncionario"
              component={DetalhesFuncionarioScreen}
            />
            <Stack.Screen
              name="CriarFuncionario"
              component={CriarFuncionarioScreen}
            />
            <Stack.Screen
              name="EditaFuncionario"
              component={EditaFuncionarioScreen}
            />
            <Stack.Screen name="CriarItem" component={CriarItemScreen} />
            <Stack.Screen name="EditaItem" component={EditaItemScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
