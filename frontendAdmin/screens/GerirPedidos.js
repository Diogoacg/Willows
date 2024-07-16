import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const COLORS = {
  primary: "#15191d",
  secondary: "#212529",
  accent: "#FF6A3D",
  neutral: "#313b4b",
  text: "#c7c7c7",
};

const GerirPedidos = () => {
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
          <Text style={styles.items}>
            {itemPedido.quantidade} {itemPedido.nome}(s)
          </Text>
        </View>
      ))}
      <Pressable
        style={styles.button}
        onPress={() => handleEstadoChange(item.id)}
      >
        <Text style={styles.buttonText}>Marcar como Pronto</Text>
      </Pressable>
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
    backgroundColor: COLORS.primary,
    flex: 1,
    paddingTop: screenHeight * 0.1,
    paddingHorizontal: screenWidth * 0.03,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral,
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
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: wp("-9%"),
    bottom: wp("-10%"),
  },
  cardDetail: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 10,
    bottom: wp("-9.2%"),
  },
  itemContainer: {
    bottom: wp("6%"),
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  items: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: COLORS.accent,
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

export default GerirPedidos;
