import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
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
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import moment from "moment";
import { obterInformacoesDoUtilizador } from "../api/apiAuth";

const PedidosEntregues = () => {
  const [pedidosDia, setPedidosDia] = useState([]);
  const [pedidosSemana, setPedidosSemana] = useState([]);
  const [pedidosMes, setPedidosMes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingUsernames, setLoadingUsernames] = useState(true); // Novo estado para carregamento dos usernames
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "dia", title: "Dia" },
    { key: "semana", title: "Semana" },
    { key: "mes", title: "Mês" },
  ]);

  useEffect(() => {
    fetchPedidos();
    const socket = io("https://willows-production.up.railway.app");

    socket.on("orderGroupCreated", () => {
      fetchPedidos();
    });

    socket.on("orderGroupDeleted", () => {
      fetchPedidos();
    });

    socket.on("orderGroupUpdated", () => {
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

      const pedidosEntregues = pedidosData.filter(
        (pedido) => pedido.status === "pronto"
      );

      const now = moment();
      const startDay = moment(now).startOf("day");
      const startWeek = moment(now).startOf("week");
      const startMonth = moment(now).startOf("month");

      const pedidosDia = pedidosEntregues.filter((pedido) =>
        moment(pedido.createdAt).isAfter(startDay)
      );
      const pedidosSemana = pedidosEntregues.filter((pedido) =>
        moment(pedido.createdAt).isAfter(startWeek)
      );
      const pedidosMes = pedidosEntregues.filter((pedido) =>
        moment(pedido.createdAt).isAfter(startMonth)
      );

      const userIds = pedidosEntregues.map((pedido) => pedido.userId);

      // Carregar os usernames
      setLoadingUsernames(true);
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

      setUsernames(usernamesMap);
      setPedidosDia(pedidosDia);
      setPedidosSemana(pedidosSemana);
      setPedidosMes(pedidosMes);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao obter pedidos: " + error.message);
      setModalVisible(true);
      console.error("Erro ao buscar pedidos:", error.message);
    } finally {
      setLoading(false);
      setLoadingUsernames(false); // Atualize o estado de carregamento dos usernames
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
        Funcionário:{" "}
        {loadingUsernames
          ? "Carregando..."
          : usernames[item.userId] || "Funcionário Indisponível"}
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
    </View>
  );

  const DiaRoute = () => (
    <FlatList
      data={pedidosDia}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );

  const SemanaRoute = () => (
    <FlatList
      data={pedidosSemana}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );

  const MesRoute = () => (
    <FlatList
      data={pedidosMes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );

  const renderScene = SceneMap({
    dia: DiaRoute,
    semana: SemanaRoute,
    mes: MesRoute,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: COLORS.accent }}
      style={{ backgroundColor: COLORS.primary }}
      labelStyle={{ color: COLORS.text }}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
      }}
    >
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        initialLayout={{ width: wp("100%") }}
        style={{ backgroundColor: COLORS.primary }}
      />
      <CustomAlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: hp("2.5%"),
    paddingHorizontal: wp("4%"),
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
    marginBottom: wp("3%"),
  },
  cardDetail: {
    fontSize: wp("4%"),
    marginBottom: hp("1.5%"),
  },
  itemContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  items: {
    fontSize: wp("3.7%"),
    marginBottom: hp("0.65%"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PedidosEntregues;
