import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  obterGruposDePedidos,
  atualizarStatusDoGrupoDePedidos,
} from "../api/apiOrderGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import {
  obterItensDoInventario,
  atualizarItemNoInventario,
} from "../api/apiInventory";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const PedidosScreen = () => {
  const [pedidos, setPedidos] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPedidos();
    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");
    //const socket = io("http://localhost:5000");

    // Listen for relevant events
    socket.on("orderGroupCreated", () => {
      fetchPedidos();
    });

    socket.on("orderGroupDeleted", () => {
      fetchPedidos();
    });

    socket.on("orderGroupUpdated", () => {
      fetchPedidos();
    });

    // socket.on("orderGroups", () => {
    //   fetchPedidos();
    // });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchImageUri = async (itemName) => {
    try {
      const encodedItemName = encodeURIComponent(itemName);
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodedItemName}&lang=pt`,
        {
          headers: {
            Authorization:
              "Client-ID yoPSP5TFfOvZ1uog-ibC6godTeccW6OLEehYrC4XNqY",
          },
        }
      );

      const data = await response.json();
      if (data.urls && data.urls.small) {
        return data.urls.small;
      } else {
        throw new Error("Imagem não encontrada no Unsplash");
      }
    } catch (error) {
      console.error("Erro ao buscar imagem do Unsplash:", error.message);
      // Pode retornar um placeholder ou tratar o erro de outra forma
      return ""; // URI de imagem padrão ou vazia
    }
  };

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
      {item.items.map((itemPedido, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text>{itemPedido.quantidade} {itemPedido.nome}(s)</Text>
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
    paddingTop: screenHeight * 0.1,
    paddingHorizontal: screenWidth * 0.03,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    justifyContent: "space-between",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: wp("-9%"),
    bottom: wp("-10%"),
  },
  cardDetail: {
    fontSize: 16,
    marginBottom: 10,
    bottom: wp("-9.2%"),
  },
  itemContainer: {
    bottom: wp("6%"),
    alignItems: "flex-end",
    justifyContent: "space-between",
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