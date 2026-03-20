import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  obterIngredientesDoInventario,
  deletarIngredienteDoInventario,
} from "../api/apiIngredientes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { REACT_APP_SOCKET_URL } from "@env";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";
import ConfirmDeleteModal from "../components/ConfirmationModal";

const IngredientesScreen = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [filteredIngredientes, setFilteredIngredientes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [selectedIngredienteId, setSelectedIngredienteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchIngredientes();

    const socketUrl = REACT_APP_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socket.on("ingredienteUpdated", fetchIngredientes);
    socket.on("ingredienteDeleted", fetchIngredientes);
    socket.on("ingredienteCreated", fetchIngredientes);
    socket.on("movimentoStockCreated", fetchIngredientes);
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const normalized = searchText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!searchText) {
      setFilteredIngredientes(ingredientes);
    } else {
      setFilteredIngredientes(
        ingredientes.filter((i) =>
          i.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalized)
        )
      );
    }
  }, [searchText, ingredientes]);

  const fetchIngredientes = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const data = await obterIngredientesDoInventario(token);
      setIngredientes(data);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao obter ingredientes: " + error.message);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSelectedIngredienteId(id);
    setConfirmDeleteVisible(true);
  };

  const confirmDelete = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      await deletarIngredienteDoInventario(token, selectedIngredienteId);
      fetchIngredientes();
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao eliminar: " + error.message);
      setAlertVisible(true);
    } finally {
      setConfirmDeleteVisible(false);
      setSelectedIngredienteId(null);
    }
  };

  const stockBaixo = (ing) => ing.quantidadeMinima > 0 && ing.quantidade <= ing.quantidadeMinima;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.primary }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: COLORS.secondary, borderColor: stockBaixo(item) ? "#e74c3c" : COLORS.neutral }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardNome, { color: COLORS.text }]}>{item.nome}</Text>
          <Text style={[styles.cardQty, { color: stockBaixo(item) ? "#e74c3c" : COLORS.accent }]}>
            {item.quantidade} {item.unidade}
            {stockBaixo(item) ? "  ⚠ stock baixo" : ""}
          </Text>
          <Text style={[styles.cardMeta, { color: COLORS.text }]}>
            Mín: {item.quantidadeMinima} {item.unidade}  •  Tolerância: {Math.round((item.toleranciaVariancia || 0.15) * 100)}%
          </Text>
        </View>
        <View style={styles.cardActions}>
          <Pressable onPress={() => navigation.navigate("RegistarMovimento", { ingrediente: item })} style={styles.actionBtn}>
            <Ionicons name="add-circle-outline" size={22} color="#2ecc71" />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("EditaIngrediente", { ingrediente: item })} style={styles.actionBtn}>
            <Ionicons name="pencil-outline" size={22} color={COLORS.accent} />
          </Pressable>
          <Pressable onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={22} color="#e74c3c" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <View style={[styles.searchContainer, { borderColor: COLORS.neutral, backgroundColor: COLORS.secondary }]}>
          <Ionicons name="search-outline" size={20} color={COLORS.text} />
          <TextInput
            style={[styles.searchInput, { color: COLORS.text }]}
            placeholder="Pesquisar ingredientes..."
            placeholderTextColor={COLORS.text + "88"}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>
        <Pressable style={styles.createButton} onPress={() => navigation.navigate("CriarIngrediente")}>
          <Ionicons name="add-circle-outline" size={26} color={COLORS.accent} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.varianciaBanner, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}
        onPress={() => navigation.navigate("Variancia")}
      >
        <Ionicons name="analytics-outline" size={20} color={COLORS.accent} />
        <Text style={[styles.varianciaBannerText, { color: COLORS.text }]}>Ver relatório de variância →</Text>
      </Pressable>

      <FlatList
        data={filteredIngredientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: COLORS.text }]}>Nenhum ingrediente encontrado</Text>
          </View>
        }
      />

      <CustomAlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
      />
      <ConfirmDeleteModal
        visible={confirmDeleteVisible}
        onClose={() => setConfirmDeleteVisible(false)}
        onConfirm={confirmDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderRadius: wp("2%"),
    borderWidth: 1,
    paddingHorizontal: wp("2%"),
    height: hp("5%"),
    gap: wp("1.5%"),
  },
  searchInput: { flex: 1, fontSize: wp("3.8%") },
  createButton: { marginLeft: wp("3%") },
  varianciaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
    margin: wp("4%"),
    marginBottom: 0,
    padding: wp("3%"),
    borderRadius: wp("2%"),
    borderWidth: 1,
  },
  varianciaBannerText: { fontSize: wp("3.8%"), fontWeight: "600" },
  list: { padding: wp("4%"), gap: hp("1%") },
  card: {
    borderRadius: wp("2%"),
    borderWidth: 1,
    padding: wp("4%"),
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardInfo: { flex: 1, gap: hp("0.3%") },
  cardNome: { fontSize: wp("4%"), fontWeight: "bold" },
  cardQty: { fontSize: wp("3.8%"), fontWeight: "600" },
  cardMeta: { fontSize: wp("3.2%"), opacity: 0.65 },
  cardActions: { flexDirection: "row", gap: wp("1%") },
  actionBtn: { padding: wp("1.5%") },
  emptyContainer: { paddingTop: hp("10%"), alignItems: "center" },
  emptyText: { fontSize: wp("4%"), opacity: 0.5 },
});

export default IngredientesScreen;
