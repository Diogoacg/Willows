import React, { useEffect, useState } from "react";
import { StatusBar, Platform, Alert, AppState } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerNavigator from "./DrawerNavigator";
import LoginScreen from "../screens/LoginScreen";
import CriarItemScreen from "../screens/CriarItemScreen";
import EditaItemScreen from "../screens/EditaItemScreen";
import CriarIngredienteScreen from "../screens/CriarIngredienteScreen";
import EditaIngredienteScreen from "../screens/EditaIngredienteScreen";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import * as NavigationBar from "expo-navigation-bar";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setIsLoggedIn(!!token);
      } catch (error) {
        Alert.alert(
          "Erro",
          "Erro ao verificar o estado de login: " + error.message
        );
        console.error("Error checking login status:", error);
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // App voltou ao primeiro plano
      } else if (nextAppState.match(/inactive|background/)) {
        // App entrou em segundo plano
        await handleLogout();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove(); // Remove o listener
    };
  }, [appState]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(
        isDarkMode ? colors.dark.primary : colors.light.primary
      ).catch((error) =>
        Alert.alert(
          "Erro",
          "Erro ao definir a cor da barra de navegação: " + error.message
        )
      );
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
      // Alert user that login failed
      Alert.alert("Erro", "Erro ao salvar o token de login: " + error.message);
      console.error("Error saving login token:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await AsyncStorage.removeItem("token");
      setIsLoggedIn(false);
    } catch (error) {
      Alert.alert("Erro", "Erro ao fazer logout: " + error.message);
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
    
            <Stack.Screen name="CriarItem" component={CriarItemScreen} />
            <Stack.Screen name="EditaItem" component={EditaItemScreen} />
            <Stack.Screen
              name="CriarIngrediente"
              component={CriarIngredienteScreen}
            />
            <Stack.Screen
              name="EditaIngrediente"
              component={EditaIngredienteScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
