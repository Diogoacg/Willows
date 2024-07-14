import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { REACT_APP_API_URL } from "@env";

export default function GerenciarPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/pedidos`);
      const pedidosFiltrados = response.data.filter((item) => item.id);
      setPedidos(pedidosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar pedidos", error);
      Alert.alert("Erro ao buscar pedidos");
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await axios.put(`${REACT_APP_API_URL}/pedidos/${id}`, {
        status: novoStatus,
      });
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao atualizar status", error);
      Alert.alert("Erro ao atualizar status");
    }
  };

  const renderItem = ({ item }) => {
    if (item.status === "entregue") {
      return null; // Não renderiza o item se estiver pronto
    }

    return (
      <View style={styles.pedidoContainer}>
        <Text>
          {item.item} - Quantidade: {item.quantidade} - Status: {item.status}
        </Text>
        <Button
          title="Em Preparo"
          onPress={() => atualizarStatus(item.id, "em_preparo")}
        />
        <Button
          title="Pronto"
          onPress={() => atualizarStatus(item.id, "pronto")}
        />
        <Button
          title="Entregue"
          onPress={() => atualizarStatus(item.id, "entregue")}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pedidoContainer: {
    marginBottom: 20,
  },
});
