import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { REACT_APP_API_URL } from "@env";

export default function Estatisticas() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/pedidos/stats`);
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
        Alert.alert("Erro ao buscar estatísticas");
      }
    };

    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Estatísticas</Text>
      <Text style={styles.text}>Total de Pedidos: {stats.totalPedidos}</Text>
      <Text style={styles.text}>Total de Itens: {stats.totalItens}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
});
