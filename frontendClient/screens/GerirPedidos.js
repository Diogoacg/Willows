import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  obterGruposDePedidos,
  atualizarStatusDoGrupoDePedidos,
} from "../api/apiOrderGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const PedidosScreen = () => {
  const [pedidos, setPedidos] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const pedidosData = await obterGruposDePedidos(token);
      // Filtra apenas os pedidos que ainda não estão prontos
      const pedidosNaoProntos = pedidosData.filter(
        (pedido) => pedido.status !== "pronto"
      );
      setPedidos(pedidosNaoProntos);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error.message);
    }
  };

  const handleEstadoChange = async (pedidoId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await atualizarStatusDoGrupoDePedidos(token, pedidoId, "pronto");
      // Remove o pedido marcado como "pronto" da lista localmente
      setPedidos((prevPedidos) =>
        prevPedidos.filter((pedido) => pedido.id !== pedidoId)
      );
    } catch (error) {
      console.error("Erro ao mudar estado do pedido:", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Pedido #{item.id}</Text>
      <Text style={styles.cardDetail}>Estado: {item.status}</Text>
      <Text style={styles.cardDetail}>Total: {item.totalPrice}€</Text>
      <Text style={styles.cardDetail}>Itens:</Text>
      {item.items.map((itemPedido, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text>{itemPedido.nome}</Text>
          <Text>Quantidade: {itemPedido.quantidade}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleEstadoChange(item.id)}
      >
        <Text style={styles.buttonText}>Marcar como Pronto</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: screenHeight * 0.1, // Add some padding at the top
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 20, // Add some padding at the bottom
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 16,
    marginBottom: 10,
  },
  itemContainer: {
    marginLeft: 10,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 1,
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PedidosScreen;
