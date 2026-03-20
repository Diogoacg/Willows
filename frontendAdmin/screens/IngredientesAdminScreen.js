import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { REACT_APP_SOCKET_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import { obterIngredientesDoInventario } from "../api/apiIngredientes";
import CustomAlertModal from "../components/CustomAlertModal";

const IngredientesAdminScreen = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [filteredIngredientes, setFilteredIngredientes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const fetchIngredientes = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const data = await obterIngredientesDoInventario(token);
      setIngredientes(data);
      applySearch(data, searchText);
    } catch (error) {
      setAlertMessage("Erro ao carregar ingredientes: " + error.message);
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText]);

  useEffect(() => {
    fetchIngredientes();
    const socketUrl = REACT_APP_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socket.on("ingredienteCreated", fetchIngredientes);
    socket.on("ingredienteUpdated", fetchIngredientes);
    socket.on("ingredienteDeleted", fetchIngredientes);
    socket.on("movimentoStockCreated", fetchIngredientes);
    return () => socket.disconnect();
  }, []);

  const applySearch = (list, text) => {
    if (!text) {
      setFilteredIngredientes(list);
      return;
    }
    const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    setFilteredIngredientes(list.filter((i) => norm(i.nome).includes(norm(text))));
  };

  const handleSearch = (text) => {
    setSearchText(text);
    applySearch(ingredientes, text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIngredientes();
  };

  const isLowStock = (item) => item.quantidadeMinima > 0 && item.quantidade <= item.quantidadeMinima;

  const renderItem = ({ item }) => {
    const low = isLowStock(item);
    return (
      <View style={[
        styles.card,
        {
          backgroundColor: COLORS.secondary,
          borderColor: low ? "#e74c3c" : COLORS.neutral,
          borderLeftColor: low ? "#e74c3c" : COLORS.neutral,
          borderLeftWidth: low ? 4 : 1,
        },
      ]}>
        <View style={styles.cardMain}>
          <View style={{ flex: 1 }}>
            <View style={styles.cardTitleRow}>
              {low && <Ionicons name="warning" size={16} color="#e74c3c" style={{ marginRight: wp("1%") }} />}
              <Text style={[styles.cardNome, { color: COLORS.text }]}>{item.nome}</Text>
            </View>
            <Text style={[styles.cardQty, { color: low ? "#e74c3c" : COLORS.accent }]}>
              {item.quantidade} {item.unidade}
            </Text>
            <Text style={[styles.cardMeta, { color: COLORS.text }]}>
              Mín: {item.quantidadeMinima} {item.unidade}  •  Tolerância: {Math.round((item.toleranciaVariancia || 0.15) * 100)}%
            </Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              onPress={() => navigation.navigate("RegistarMovimentoAdmin", { ingrediente: item })}
              style={styles.actionBtn}
            >
              <Ionicons name="add-circle-outline" size={22} color="#2ecc71" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.primary }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      {/* Search bar */}
      <View style={[styles.searchRow, { borderBottomColor: COLORS.neutral }]}>
        <View style={[styles.searchBox, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}>
          <Ionicons name="search-outline" size={18} color={COLORS.text} />
          <TextInput
            style={[styles.searchInput, { color: COLORS.text }]}
            placeholder="Pesquisar ingrediente..."
            placeholderTextColor={COLORS.text + "88"}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Banners */}
      <View style={styles.bannersRow}>
        <Pressable
          style={[styles.banner, { flex: 1, backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}
          onPress={() => navigation.navigate("VarianciaAdmin")}
        >
          <Ionicons name="analytics-outline" size={18} color={COLORS.accent} />
          <Text style={[styles.bannerText, { color: COLORS.text }]}>Variância →</Text>
        </Pressable>
        <Pressable
          style={[styles.banner, { flex: 1, backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}
          onPress={() => navigation.navigate("RegistarMovimentoAdmin")}
        >
          <Ionicons name="add-circle-outline" size={18} color="#2ecc71" />
          <Text style={[styles.bannerText, { color: COLORS.text }]}>Registar Movimento →</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredIngredientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={COLORS.neutral} />
            <Text style={[styles.emptyText, { color: COLORS.text }]}>Nenhum ingrediente encontrado.</Text>
          </View>
        }
      />

      <CustomAlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title="Erro"
        message={alertMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1%"),
    borderBottomWidth: 1,
    gap: wp("2%"),
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.8%"),
    gap: wp("2%"),
  },
  searchInput: { flex: 1, fontSize: wp("3.8%") },
  bannersRow: {
    flexDirection: "row",
    gap: wp("2%"),
    marginHorizontal: wp("4%"),
    marginTop: hp("1%"),
    marginBottom: hp("0.5%"),
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1.5%"),
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingVertical: hp("0.8%"),
    paddingHorizontal: wp("3%"),
  },
  bannerText: { fontSize: wp("3.3%"), fontWeight: "600" },
  list: { padding: wp("4%"), gap: hp("1%") },
  card: {
    borderRadius: wp("2%"),
    borderWidth: 1,
    padding: wp("3.5%"),
    elevation: 1,
  },
  cardMain: { flexDirection: "row", alignItems: "center" },
  cardTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: hp("0.3%") },
  cardNome: { fontSize: wp("4%"), fontWeight: "bold" },
  cardQty: { fontSize: wp("3.8%"), fontWeight: "600" },
  cardMeta: { fontSize: wp("3%"), opacity: 0.6, marginTop: hp("0.3%") },
  cardActions: { flexDirection: "row", gap: wp("2%") },
  actionBtn: { padding: wp("1.5%") },
  emptyContainer: { paddingTop: hp("10%"), alignItems: "center", gap: hp("1%") },
  emptyText: { fontSize: wp("4%"), opacity: 0.5 },
});

export default IngredientesAdminScreen;
