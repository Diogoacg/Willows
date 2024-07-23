import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import {
  obterLucro,
  obterTotalPedidosDMW,
  obterOrdersPorItem,
  obterRankingUtilizadores,
} from "../api/apiStats";
import DoughnutChart from "../components/DoughnutChart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../config/theme";
import { useTheme } from "../ThemeContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import CustomAlertModal from "../components/CustomAlertModal";

const StatsScreen = ({ navigation }) => {
  const [data, setData] = useState({
    profitPerUser: null,
    totalOrdersDMW: null,
    ordersPerItem: null,
    rankingUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setModalTitle("Erro");
        setModalMessage(
          "Usuário não autenticado. Por favor, faça login novamente."
        );
        setModalVisible(true);
        return;
      }

      const [profitData, ordersData, itemsData, rankingData] =
        await Promise.all([
          obterLucro(token),
          obterTotalPedidosDMW(token),
          obterOrdersPorItem(token),
          obterRankingUtilizadores(token),
        ]);

      setData({
        profitPerUser: profitData,
        totalOrdersDMW: ordersData,
        ordersPerItem: itemsData,
        rankingUsers: rankingData,
      });
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao obter dados do servidor: " + error.message);
      setModalVisible(true);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io("https://willows-production.up.railway.app");

    socket.on("orderGroupCreated", fetchData);
    socket.on("orderGroupDeleted", fetchData);
    socket.on("orderGroupUpdated", fetchData);

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.accent} />;
  }

  const doughnutData = (data.ordersPerItem || []).slice(0, 5).concat(
    (data.ordersPerItem || []).slice(5).reduce(
      (acc, item) => ({
        itemId: "0",
        itemName: "Outros",
        totalOrders: (acc.totalOrders || 0) + item.totalOrders,
      }),
      {}
    )
  );

  const top3Users = data.rankingUsers.slice(0, 3);

  const Card = ({ title, value }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral },
      ]}
    >
      <Text style={[styles.cardTitle, { color: COLORS.text }]}>{title}</Text>
      <Text style={[styles.cardValue, { color: COLORS.text }]}>{value}</Text>
    </View>
  );

  const RankingCard = ({ username, totalProfit }) => (
    <View style={[styles.rankingCard, { borderBottomColor: COLORS.neutral }]}>
      <Text style={[styles.rankingCardTitle, { color: COLORS.text }]}>
        {username}
      </Text>
      <Text style={[styles.rankingCardValue, { color: COLORS.text }]}>
        {totalProfit ? `${totalProfit}€` : "N/A"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <DoughnutChart data={doughnutData} />
        <View style={styles.cardsContainer}>
          <Card title="Pedidos/Dia" value={data.totalOrdersDMW?.dailyOrders} />
          <Card
            title="Pedidos/Semana"
            value={data.totalOrdersDMW?.weeklyOrders}
          />
          <Card
            title="Pedidos/Mês"
            value={data.totalOrdersDMW?.monthlyOrders}
          />
        </View>
        <View style={styles.cardsContainer}>
          <Card
            title="Lucro Diário"
            value={data.profitPerUser?.dailyProfit?.toFixed(2) + "€"}
          />
          <Card
            title="Lucro Semanal"
            value={data.profitPerUser?.weeklyProfit?.toFixed(2) + "€"}
          />
          <Card
            title="Lucro Mensal"
            value={data.profitPerUser?.monthlyProfit?.toFixed(2) + "€"}
          />
        </View>
        <View
          style={[
            styles.rankingContainer,
            { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral },
          ]}
        >
          <Text style={[styles.rankingTitle, { color: COLORS.text }]}>
            Top 3 Funcionários
          </Text>
          {top3Users.length === 0 ? (
            <Text style={styles.rankingValue}>N/A</Text>
          ) : (
            top3Users.map((user, index) => (
              <RankingCard
                key={index}
                username={user.username || `Lugar ${index + 1}`}
                totalProfit={user.totalProfit}
              />
            ))
          )}
        </View>
      </ScrollView>
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
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: wp("4%"),
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: hp("3%"),
    flexWrap: "wrap",
  },
  card: {
    padding: wp("4%"),
    borderRadius: wp("2%"),
    borderWidth: wp("0.2%"),
    elevation: 3,
    width: wp("28%"),
    margin: wp("1%"),
    alignItems: "center",
  },
  cardTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: wp("3.5%"),
    marginTop: hp("1%"),
  },
  rankingContainer: {
    marginTop: hp("4%"),
    width: "100%",
    padding: wp("4%"),
    borderRadius: wp("2%"),
    borderWidth: wp("0.2%"),
    elevation: 3,
  },
  rankingTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  rankingCard: {
    paddingVertical: hp("1.5%"),
    borderBottomWidth: wp("0.5%"),
  },
  rankingCardTitle: {
    fontSize: wp("4%"),
  },
  rankingCardValue: {
    fontSize: wp("3.5%"),
    marginTop: hp("0.5%"),
  },
});

export default StatsScreen;
