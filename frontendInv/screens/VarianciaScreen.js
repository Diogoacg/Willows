import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
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
import { obterVarianciaIngredientes } from "../api/apiStats";
import CustomAlertModal from "../components/CustomAlertModal";

const PERIODOS = [
  { key: "dia", label: "Hoje" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
];

const STATUS_CONFIG = {
  verde: { color: "#2ecc71", icon: "checkmark-circle", label: "Normal" },
  amarelo: { color: "#f39c12", icon: "warning", label: "Atenção" },
  vermelho: { color: "#e74c3c", icon: "close-circle", label: "Alerta" },
  sem_dados: { color: "#95a5a6", icon: "help-circle-outline", label: "Sem dados" },
};

const VarianciaScreen = () => {
  const [periodo, setPeriodo] = useState("semana");
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const fetchDados = useCallback(async (per = periodo) => {
    const token = await AsyncStorage.getItem("token");
    try {
      const data = await obterVarianciaIngredientes(token, per);
      // Sort: vermelho first, then amarelo, then verde, then sem_dados
      const order = { vermelho: 0, amarelo: 1, verde: 2, sem_dados: 3 };
      data.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
      setDados(data);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao carregar dados: " + error.message);
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodo]);

  useEffect(() => {
    setLoading(true);
    fetchDados(periodo);
  }, [periodo]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDados(periodo);
  };

  const totalAlerts = dados.filter((d) => d.status === "vermelho").length;
  const totalAtencao = dados.filter((d) => d.status === "amarelo").length;

  const renderItem = ({ item }) => {
    const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.sem_dados;

    return (
      <View style={[styles.card, { backgroundColor: COLORS.secondary, borderColor: sc.color + "44", borderLeftColor: sc.color, borderLeftWidth: 4 }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name={sc.icon} size={20} color={sc.color} />
            <Text style={[styles.cardNome, { color: COLORS.text }]}>{item.nome}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.color + "22", borderColor: sc.color }]}>
              <Text style={[styles.statusLabel, { color: sc.color }]}>{sc.label}</Text>
            </View>
          </View>
          <Text style={[styles.cardStock, { color: COLORS.accent }]}>
            {item.quantidade_atual} {item.unidade}
          </Text>
        </View>

        {item.status !== "sem_dados" && (
          <View style={styles.cardBody}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: COLORS.text }]}>Consumo teórico (vendas)</Text>
              <Text style={[styles.statValue, { color: COLORS.text }]}>
                {item.consumo_teorico} {item.unidade}
              </Text>
            </View>
            {item.ofertas > 0 && (
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: COLORS.text }]}>Ofertas registadas</Text>
                <Text style={[styles.statValue, { color: "#3498db" }]}>
                  {item.ofertas} {item.unidade}
                </Text>
              </View>
            )}
            {item.quebras > 0 && (
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: COLORS.text }]}>Quebras/Desperdício</Text>
                <Text style={[styles.statValue, { color: "#f39c12" }]}>
                  {item.quebras} {item.unidade}
                </Text>
              </View>
            )}
            {item.variancia_unidades !== 0 && (
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: COLORS.text }]}>Variância (ajustes)</Text>
                <Text style={[styles.statValue, { color: item.variancia_unidades < 0 ? "#e74c3c" : "#2ecc71" }]}>
                  {item.variancia_unidades > 0 ? "+" : ""}{item.variancia_unidades} {item.unidade}
                </Text>
              </View>
            )}
            <View style={[styles.varianciaPctRow, { backgroundColor: COLORS.primary }]}>
              <View
                style={[
                  styles.varianciaPctBar,
                  {
                    width: `${Math.min(100, item.variancia_percentagem)}%`,
                    backgroundColor: sc.color,
                  },
                ]}
              />
              <Text style={[styles.varianciaPct, { color: sc.color }]}>
                {item.variancia_percentagem}% variância  •  tolerância: {Math.round(item.toleranciaVariancia * 100)}%
              </Text>
            </View>
          </View>
        )}

        {item.status === "sem_dados" && (
          <Text style={[styles.semDadosText, { color: COLORS.text }]}>
            Nenhuma venda ou ajuste registado neste período.
          </Text>
        )}
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
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Variância de Ingredientes</Text>
      </View>

      {/* Period selector */}
      <View style={[styles.periodoRow, { borderBottomColor: COLORS.neutral }]}>
        {PERIODOS.map((p) => (
          <Pressable
            key={p.key}
            style={[
              styles.periodoBtn,
              {
                backgroundColor: periodo === p.key ? COLORS.accent : COLORS.secondary,
                borderColor: COLORS.neutral,
              },
            ]}
            onPress={() => setPeriodo(p.key)}
          >
            <Text style={[styles.periodoBtnText, { color: periodo === p.key ? COLORS.primary : COLORS.text }]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary banner */}
      {dados.length > 0 && (
        <View style={[styles.summaryRow, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}>
          {totalAlerts > 0 && (
            <View style={styles.summaryItem}>
              <Ionicons name="close-circle" size={18} color="#e74c3c" />
              <Text style={[styles.summaryText, { color: "#e74c3c" }]}>{totalAlerts} alerta{totalAlerts !== 1 ? "s" : ""}</Text>
            </View>
          )}
          {totalAtencao > 0 && (
            <View style={styles.summaryItem}>
              <Ionicons name="warning" size={18} color="#f39c12" />
              <Text style={[styles.summaryText, { color: "#f39c12" }]}>{totalAtencao} atenção</Text>
            </View>
          )}
          {totalAlerts === 0 && totalAtencao === 0 && (
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2ecc71" />
              <Text style={[styles.summaryText, { color: "#2ecc71" }]}>Tudo normal</Text>
            </View>
          )}
          <Text style={[styles.summaryTotal, { color: COLORS.text }]}>{dados.length} ingredientes</Text>
        </View>
      )}

      <FlatList
        data={dados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color={COLORS.neutral} />
            <Text style={[styles.emptyText, { color: COLORS.text }]}>
              Nenhum ingrediente com receita associada.
            </Text>
            <Text style={[styles.emptyHint, { color: COLORS.text }]}>
              Adicione receitas aos itens do menu para ver a variância.
            </Text>
          </View>
        }
      />

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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  periodoRow: {
    flexDirection: "row",
    padding: wp("3%"),
    gap: wp("2%"),
    borderBottomWidth: 1,
  },
  periodoBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingVertical: hp("1%"),
    alignItems: "center",
  },
  periodoBtnText: { fontSize: wp("3.8%"), fontWeight: "600" },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("3%"),
    marginHorizontal: wp("4%"),
    marginTop: hp("1.5%"),
    padding: wp("3%"),
    borderRadius: wp("2%"),
    borderWidth: 1,
  },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: wp("1%") },
  summaryText: { fontSize: wp("3.5%"), fontWeight: "600" },
  summaryTotal: { marginLeft: "auto", fontSize: wp("3.2%"), opacity: 0.65 },
  list: { padding: wp("4%"), gap: hp("1%") },
  card: {
    borderRadius: wp("2%"),
    borderWidth: 1,
    padding: wp("4%"),
    elevation: 2,
    gap: hp("1%"),
  },
  cardHeader: { gap: hp("0.5%") },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: wp("2%") },
  cardNome: { fontSize: wp("4%"), fontWeight: "bold", flex: 1 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: wp("3%"),
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.2%"),
  },
  statusLabel: { fontSize: wp("3%"), fontWeight: "600" },
  cardStock: { fontSize: wp("3.5%"), fontWeight: "600" },
  cardBody: { gap: hp("0.5%") },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: wp("3.5%"), opacity: 0.8 },
  statValue: { fontSize: wp("3.5%"), fontWeight: "600" },
  varianciaPctRow: {
    marginTop: hp("0.5%"),
    borderRadius: wp("1%"),
    overflow: "hidden",
    height: hp("3%"),
    justifyContent: "center",
    position: "relative",
  },
  varianciaPctBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
  },
  varianciaPct: { fontSize: wp("3%"), fontWeight: "600", paddingHorizontal: wp("2%") },
  semDadosText: { fontSize: wp("3.5%"), opacity: 0.5, fontStyle: "italic" },
  emptyContainer: {
    paddingTop: hp("10%"),
    alignItems: "center",
    gap: hp("1%"),
    paddingHorizontal: wp("8%"),
  },
  emptyText: { fontSize: wp("4.5%"), fontWeight: "600", textAlign: "center", opacity: 0.6 },
  emptyHint: { fontSize: wp("3.5%"), textAlign: "center", opacity: 0.4 },
});

export default VarianciaScreen;
