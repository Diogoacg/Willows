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
      console.log(REACT_APP_API_URL);
      const response = await axios.get(`${REACT_APP_API_URL}/pedidos`);

      // Filtra os pedidos para garantir que tenham um id válido
      const pedidosFiltrados = response.data.filter((item) => item.id);
      setPedidos(pedidosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar pedidos", error);
      Alert.alert("Erro ao buscar pedidos");
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      console.log("Atualizando status do pedido", id, novoStatus);
      await axios.put(`${REACT_APP_API_URL}/pedidos/${id}`, {
        status: novoStatus,
      });
      console.log("Status atualizado com sucesso");
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao atualizar status", error);
      Alert.alert("Erro ao atualizar status");
    }
  };

  const renderItem = ({ item }) => (
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
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gerenciar Pedidos</Text>
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
