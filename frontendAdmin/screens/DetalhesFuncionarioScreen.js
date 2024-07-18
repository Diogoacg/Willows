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

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.accent} />
        </Pressable>
      </View>
      <View style={styles.inContainer}>
        <Text style={[styles.title, { color: COLORS.text }]}>
          Detalhes do Funcionário
        </Text>
        <Text style={[styles.label, { color: COLORS.text }]}>
          Nome de Utilizador: {userDetails.username}
        </Text>
        <Text style={[styles.label, { color: COLORS.text }]}>
          Email: {userDetails.email}
        </Text>
        <Text style={[styles.label, { color: COLORS.text }]}>
          Lucro Total: {userStatistics.lucroTotal}
        </Text>
        <Text style={[styles.label, { color: COLORS.text }]}>
          Total de Pedidos: {userStatistics.totalPedidos}
        </Text>
        {/* Adicione mais detalhes conforme necessário */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: screenHeight * 0.1,
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
    marginTop: hp("-6%"), // Espaço extra no topo
  },
  button: {
    marginLeft: wp("-4%"),
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DetalhesFuncionarioScreen;
