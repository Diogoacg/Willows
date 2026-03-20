import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import { obterMovimentos } from "../api/apiMovimentosStock";
import CustomAlertModal from "../components/CustomAlertModal";

const PERIODOS = [
  { key: "dia", label: "Hoje" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
];

const TIPOS = [
  { key: null, label: "Todos" },
  { key: "compra", label: "Compra", color: "#2ecc71", icon: "arrow-down-circle-outline" },
  { key: "oferta", label: "Oferta", color: "#3498db", icon: "gift-outline" },
  { key: "quebra", label: "Quebra", color: "#f39c12", icon: "warning-outline" },
  { key: "ajuste", label: "Ajuste", color: "#9b59b6", icon: "scale-outline" },
];

const TIPO_CONFIG = {
  compra: { color: "#2ecc71", icon: "arrow-down-circle-outline" },
  oferta: { color: "#3498db", icon: "gift-outline" },
  quebra: { color: "#f39c12", icon: "warning-outline" },
  ajuste: { color: "#9b59b6", icon: "scale-outline" },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "2-digit" })
    + " " + d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

const MovimentosHistoryScreen = () => {
  const [periodo, setPeriodo] = useState("semana");
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const fetchDados = useCallback(async (per = periodo, tipo = tipoFiltro) => {
    const token = await AsyncStorage.getItem("token");
    try {
      const data = await obterMovimentos(token, { periodo: per, tipo: tipo || undefined });
      setDados(data);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao carregar histórico: " + error.message);
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodo, tipoFiltro]);

  useEffect(() => {
    setLoading(true);
    fetchDados(periodo, tipoFiltro);
  }, [periodo, tipoFiltro]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDados(periodo, tipoFiltro);
  };

  const renderItem = ({ item }) => {
    const tc = TIPO_CONFIG[item.tipo] || { color: "#95a5a6", icon: "help-circle-outline" };
    const qty = item.quantidade;
    const qtyStr = qty > 0 ? `+${qty}` : `${qty}`;
    const ingNome = item.Ingrediente?.nome || "—";
    const unidade = item.Ingrediente?.unidade || "";

    return (
      <View style={[styles.card, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral, borderLeftColor: tc.color, borderLeftWidth: 4 }]}>
        <View style={styles.cardRow}>
          <Ionicons name={tc.icon} size={20} color={tc.color} />
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardNome, { color: COLORS.text }]}>{ingNome}</Text>
              <View style={[styles.tipoBadge, { backgroundColor: tc.color + "22", borderColor: tc.color }]}>
                <Text style={[styles.tipoBadgeText, { color: tc.color }]}>{item.tipo}</Text>
              </View>
            </View>
            <Text style={[styles.cardDate, { color: COLORS.text }]}>{formatDate(item.createdAt)}</Text>
            {item.observacoes ? (
              <Text style={[styles.cardObs, { color: COLORS.text }]}>{item.observacoes}</Text>
            ) : null}
          </View>
          <Text style={[styles.cardQty, { color: qty >= 0 ? "#2ecc71" : "#e74c3c" }]}>
            {qtyStr} {unidade}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Histórico de Movimentos</Text>
      </View>

      {/* Period filter */}
      <View style={[styles.filterRow, { borderBottomColor: COLORS.neutral }]}>
        {PERIODOS.map((p) => (
          <Pressable
            key={p.key}
            style={[
              styles.filterBtn,
              { backgroundColor: periodo === p.key ? COLORS.accent : COLORS.secondary, borderColor: COLORS.neutral },
            ]}
            onPress={() => setPeriodo(p.key)}
          >
            <Text style={[styles.filterBtnText, { color: periodo === p.key ? COLORS.primary : COLORS.text }]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tipo filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tipoRow, { borderBottomColor: COLORS.neutral }]} contentContainerStyle={styles.tipoRowContent}>
        {TIPOS.map((t) => {
          const active = tipoFiltro === t.key;
          const activeColor = t.color || COLORS.accent;
          return (
            <Pressable
              key={String(t.key)}
              style={[
                styles.tipoBtn,
                {
                  backgroundColor: active ? activeColor + "22" : COLORS.secondary,
                  borderColor: active ? activeColor : COLORS.neutral,
                },
              ]}
              onPress={() => setTipoFiltro(t.key)}
            >
              {t.icon && <Ionicons name={t.icon} size={14} color={active ? activeColor : COLORS.text} />}
              <Text style={[styles.tipoBtnText, { color: active ? activeColor : COLORS.text }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={dados}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={64} color={COLORS.neutral} />
              <Text style={[styles.emptyText, { color: COLORS.text }]}>Nenhum movimento neste período.</Text>
            </View>
          }
        />
      )}

      <CustomAlertModal
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingTop: hp("5%"),
    paddingBottom: hp("1.5%"),
    borderBottomWidth: 1,
  },
  backButton: { marginRight: wp("3%") },
  headerTitle: { fontSize: wp("4.5%"), fontWeight: "bold" },
  filterRow: {
    flexDirection: "row",
    padding: wp("3%"),
    gap: wp("2%"),
    borderBottomWidth: 1,
  },
  filterBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingVertical: hp("1%"),
    alignItems: "center",
  },
  filterBtnText: { fontSize: wp("3.8%"), fontWeight: "600" },
  tipoRow: { borderBottomWidth: 1, maxHeight: hp("7%") },
  tipoRowContent: { paddingHorizontal: wp("3%"), paddingVertical: hp("0.8%"), gap: wp("2%"), alignItems: "center" },
  tipoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1%"),
    borderWidth: 1,
    borderRadius: wp("4%"),
    paddingVertical: hp("0.5%"),
    paddingHorizontal: wp("3%"),
  },
  tipoBtnText: { fontSize: wp("3.2%"), fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: wp("4%"), gap: hp("1%") },
  card: {
    borderRadius: wp("2%"),
    borderWidth: 1,
    padding: wp("3%"),
    elevation: 1,
  },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: wp("2%") },
  cardInfo: { flex: 1, gap: hp("0.3%") },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: wp("2%") },
  cardNome: { fontSize: wp("3.8%"), fontWeight: "bold", flex: 1 },
  tipoBadge: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.1%"),
  },
  tipoBadgeText: { fontSize: wp("2.8%"), fontWeight: "600" },
  cardDate: { fontSize: wp("3%"), opacity: 0.6 },
  cardObs: { fontSize: wp("3.2%"), fontStyle: "italic", opacity: 0.7 },
  cardQty: { fontSize: wp("4%"), fontWeight: "bold", minWidth: wp("15%"), textAlign: "right" },
  emptyContainer: { paddingTop: hp("10%"), alignItems: "center", gap: hp("1%") },
  emptyText: { fontSize: wp("4%"), opacity: 0.5, textAlign: "center" },
});

export default MovimentosHistoryScreen;
