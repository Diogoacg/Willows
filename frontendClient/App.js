// App.js

import React from "react";
import { StyleSheet, Text, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import FazerPedido from "./components/FazerPedido";
import ListaPedidos from "./components/ListaPedidos";
import LoginScreen from "./screens/LoginScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FazerPedido" component={FazerPedido} />
        <Stack.Screen name="ListaPedidos" component={ListaPedidos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Café App - Cliente</Text>
      <FazerPedido />
      <ListaPedidos />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start", // Alinha o conteúdo no topo da tela
    paddingTop: 20, // Adiciona um espaçamento no topo
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
