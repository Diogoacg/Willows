import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { obterInformacoesDoUtilizador } from "../api/apiAuth";
import {
  obterLucroTotalPorUsuario,
  obterTotalPedidosPorUsuario,
} from "../api/apiStats"; // Importa as funções de estatísticas
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../config/theme";
import { useTheme } from "../ThemeContext";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const numColumns = 3;
const itemWidth = screenWidth / numColumns - wp("4%");

const DetalhesFuncionarioScreen = ({ navigation }) => {
  const route = useRoute();
  const { userId } = route.params;
  const [userDetails, setUserDetails] = useState(null);
  const [userStatistics, setUserStatistics] = useState(null);
  const { isDarkMode } = useTheme();

  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchUserDetails();
    fetchUserStatistics();
  }, []);

  const fetchUserDetails = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const details = await obterInformacoesDoUtilizador(token, userId);
      setUserDetails(details);
    } catch (error) {
      console.error("Erro ao buscar informações do utilizador:", error.message);
    }
  };

  const fetchUserStatistics = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const profitStatistics = await obterLucroTotalPorUsuario(token, userId);
      const ordersStatistics = await obterTotalPedidosPorUsuario(token, userId);

      console.log(profitStatistics, ordersStatistics);
      setUserStatistics({
        lucroTotal: profitStatistics.totalProfit,
        totalPedidos: ordersStatistics.totalOrders,
      });
    } catch (error) {
      console.error(
        "Erro ao buscar estatísticas do utilizador:",
        error.message
      );
    }
  };

  if (!userDetails || !userStatistics) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: COLORS.primary }]}
      >
        <Text style={{ color: COLORS.text }}>Carregando...</Text>
      </View>
    );
  }

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

  const MainCards = ({ title, value }) => (
    <View
      style={[
        styles.nameEmailCard,
        { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral },
      ]}
    >
      <Text style={[styles.cardTitle, { color: COLORS.text }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.accent} />
        </Pressable>
      <Text style={[styles.headerTitle, { color: COLORS.text }]}>
          Detalhes do Funcionário
        </Text>
      </View>
      <View style={styles.mainCardContainer}>
        <MainCards title="Nome" value={userDetails.username} />
        <MainCards title="Email" value={userDetails.email} />
      </View>
      <View style={styles.cardsContainer}>
        <Card title="Lucro Total" value={userStatistics.lucroTotal + "€"} />
        <Card title="Total de Pedidos" value={userStatistics.totalPedidos} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp("4%"),
    paddingTop: hp("10%"),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: wp("2%"),
  },
  inContainer: {
    paddingTop: hp("2%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    marginTop: hp("-6%"),
  },
  button: {
    marginLeft: wp("-4%"),
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: hp(0),
  },
  mainCardContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginTop: hp(3),
    flexWrap: "wrap",
  },
  nameEmailCard: {
    padding: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    elevation: 3,
    width: wp(91),
    margin: wp(1),
    alignItems: "center",
  },
  card: {
    padding: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    elevation: 3,
    width: wp(45),
    margin: wp(1),
    alignItems: "center",
  },
  cardTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    top: hp(0),
  },
  cardValue: {
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
});

export default DetalhesFuncionarioScreen;
