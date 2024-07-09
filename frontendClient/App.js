import React from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import FazerPedido from "./components/FazerPedido";
import ListaPedidos from "./components/ListaPedidos";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Café App - Cliente</Text>
      <FazerPedido />
      <ListaPedidos />
    </SafeAreaView>
  );
}

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
