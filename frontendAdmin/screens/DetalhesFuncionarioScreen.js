import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { obterInformacoesDoUtilizador } from "../api/apiAuth";
import {
  obterLucroTotalPorUsuario,
  obterTotalPedidosPorUsuario,
} from "../api/apiStats";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../config/theme";
import { useTheme } from "../ThemeContext";
import CustomAlertModal from "../components/CustomAlertModal";

const DetalhesFuncionarioScreen = ({ navigation }) => {
  const route = useRoute();
  const { userId } = route.params;
  const [userDetails, setUserDetails] = useState(null);
  const [userStatistics, setUserStatistics] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const { isDarkMode } = useTheme();
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

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
      setModalTitle("Erro");
      setModalMessage(
        "Erro ao buscar informações do utilizador: " + error.message
      );
      setModalVisible(true);
      console.error("Erro ao buscar informações do utilizador:", error.message);
    } finally {
      setLoading1(false);
    }
  };

  const fetchUserStatistics = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const profitStatistics = await obterLucroTotalPorUsuario(token, userId);
      const ordersStatistics = await obterTotalPedidosPorUsuario(token, userId);

      setUserStatistics({
        lucroTotal: profitStatistics.totalProfit,
        totalPedidos: ordersStatistics.totalOrders,
      });
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage(
        "Erro ao buscar estatísticas do utilizador: " + error.message
      );
      setModalVisible(true);
      console.error(
        "Erro ao buscar estatísticas do utilizador:",
        error.message
      );
    } finally {
      setLoading2(false);
    }
  };

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

  if (loading1 && loading2 || !userDetails || !userStatistics) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
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

      {/* Custom Alert Modal */}
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
    padding: wp("4%"),
    paddingTop: hp("10%"),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: wp("2%"),
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DetalhesFuncionarioScreen;
