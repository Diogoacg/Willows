import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
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
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";
import { obterInformacoesDoUtilizador } from "../api/apiAuth";

const GerirPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;
  const [scaleValues, setScaleValues] = useState({});
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    fetchPedidos();
    //const socket = io("https://willows-production.up.railway.app");
    const socket = io("http://localhost:5000");

    socket.on("orderGroupCreated", () => {
      fetchPedidos();
    });

    socket.on("orderGroupDeleted", () => {
      fetchPedidos();
    });

    socket.on("orderGroupUpdated", () => {
      fetchPedidos();
    });

    socket.on("userDeleted", () => {
      fetchPedidos();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPedidos = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const pedidosData = await obterGruposDePedidos(token);
      const initialScaleValues = {};
      const pedidosNaoProntos = pedidosData.filter(
        (pedido) => pedido.status !== "pronto"
      );
      pedidosNaoProntos.forEach((pedido) => {
        initialScaleValues[pedido.id] = new Animated.Value(1);
      });

      const userIds = pedidosNaoProntos.map((pedido) => pedido.userId);
      const usernamesData = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const user = await obterInformacoesDoUtilizador(token, userId);
            return { userId, username: user.username };
          } catch (error) {
            return { userId, username: "Funcionário Indisponível" };
          }
        })
      );
      const usernamesMap = {};
      usernamesData.forEach(({ userId, username }) => {
        usernamesMap[userId] = username;
      });

      setScaleValues(initialScaleValues);
      setPedidos(pedidosNaoProntos);
      setUsernames(usernamesMap);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao obter pedidos: " + error.message);
      setModalVisible(true);
      console.error("Erro ao buscar pedidos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (pedidoId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await atualizarStatusDoGrupoDePedidos(token, pedidoId, "pronto");
      setPedidos((prevPedidos) =>
        prevPedidos.filter((pedido) => pedido.id !== pedidoId)
      );
      setModalTitle("Sucesso");
      setModalMessage("Pedido atualizado para 'pronto' com sucesso!");
      setModalVisible(true);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao mudar estado do pedido: " + error.message);
      setModalVisible(true);
      console.error("Erro ao mudar estado do pedido:", error.message);
    }
  };

  const animateScaleIn = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

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
        Funcionário: {usernames[item.userId] || "Carregando..."}
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
      <Animated.View
        style={[
          styles.buttonAnimated,
          {
            transform: [
              { scale: scaleValues[item.id] || new Animated.Value(1) },
            ],
          },
        ]}
      >
        <Pressable
          style={[styles.button, { backgroundColor: COLORS.accent }]}
          onPress={() => handleEstadoChange(item.id)}
          onPressIn={() => animateScaleIn(scaleValues[item.id])}
          onPressOut={() => animateScaleOut(scaleValues[item.id])}
        >
          <Text style={[styles.buttonText, { color: COLORS.secondary }]}>
            Entregue
          </Text>
        </Pressable>
      </Animated.View>
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
      <CustomAlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
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
    paddingBottom: hp("2.5%"),
  },
  card: {
    borderRadius: wp("2%"),
    borderWidth: wp("0.2%"),
    padding: wp("2.5%"),
    marginTop: hp("1%"),
    marginBottom: hp("1.5%"),
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
    fontSize: wp("4.4%"),
    fontWeight: "bold",
    marginTop: wp("-9%"),
    marginBottom: wp("3%"),
    bottom: wp("-10%"),
  },
  cardDetail: {
    fontSize: wp("4%"),
    marginBottom: hp("1.5%"),
    bottom: wp("-8%"),
  },
  itemContainer: {
    bottom: wp("6%"),
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  items: {
    fontSize: wp("3.7%"),
    marginBottom: hp("0.65%"),
  },
  button: {
    padding: wp("3%"),
    borderRadius: wp("2%"),
    alignItems: "center",
    borderColor: "#000",
    borderWidth: wp("0.2%"),
    top: wp("0.75%"),
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
    fontSize: wp("4%"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonAnimated: {
    width: "100%",
  },
});

export default GerirPedidos;
