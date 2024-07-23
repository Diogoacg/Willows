import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
import { useTheme } from "../ThemeContext"; // Importa o contexto de tema
import { colors } from "../config/theme"; // Importa as cores do tema

const GerirPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme(); // Obtém o estado de tema atual
  const COLORS = isDarkMode ? colors.dark : colors.light; // Define as cores com base no tema

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
    <View
      style={[
        styles.card,
        { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral },
      ]}
    >
      <Text style={[styles.cardTitle, { color: COLORS.text }]}>
        Pedido #{item.id}
      </Text>
      <Text style={[styles.cardDetail, { color: COLORS.text }]}>
        Estado: {item.status}
      </Text>
      <Text style={[styles.cardDetail, { color: COLORS.text }]}>
        Total: {item.totalPrice}€
      </Text>
      {item.items.map((itemPedido, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={[styles.items, { color: COLORS.text }]}>
            {itemPedido.quantidade} {itemPedido.nome}(s)
          </Text>
        </View>
      ))}
      <Pressable
        style={[styles.button, { backgroundColor: COLORS.accent }]}
        onPress={() => handleEstadoChange(item.id)}
      >
        <Text style={[styles.buttonText, { color: COLORS.secondary }]}>
          Entregue
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
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
    paddingTop: hp("2%"),
    paddingHorizontal: wp("4%"),
  },
  listContainer: {
    paddingBottom: hp('2.5%'),
  },
  card: {
    borderRadius: wp('2%'),
    borderWidth: wp('0.2%'),
    padding: wp('2.5%'),
    marginTop: hp('1%'),
    marginBottom: hp('1.5%'),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.4%'),
    fontWeight: "bold",
    marginTop: wp("-9%"),
    marginBottom: wp("3%"),
    bottom: wp("-10%"),
  },
  cardDetail: {
    fontSize: wp('4%'),
    marginBottom: hp('1.5%'),
    bottom: wp("-8%"),
  },
  itemContainer: {
    bottom: wp("6%"),
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  items: {
    fontSize: wp('3.7%'),
    marginBottom: hp('0.65%'),
  },
  button: {
    padding: wp('3%'),
    borderRadius: wp('2%'),
    alignItems: "center",
    borderColor: "#000",
    borderWidth: wp('0.2%'),
    top: wp("0.75%"),
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
    fontWeight: "bold",
    fontSize: wp('4%'),
  },
});

export default GerirPedidos;
