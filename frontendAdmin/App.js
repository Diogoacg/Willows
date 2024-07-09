import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import Estatisticas from "./components/Estatisticas";
import GerenciarPedidos from "./components/GerenciarPedidos";
import FazerPedido from "./components/FazerPedido";

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Café App - Admin</Text>
      <View style={styles.section}>
        <Estatisticas />
      </View>
      <View style={styles.section}>
        <GerenciarPedidos />
      </View>
      <View style={styles.section}>
        <FazerPedido />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    width: "90%",
    marginBottom: 20,
  },
});
