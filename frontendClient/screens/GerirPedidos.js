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
import { REACT_APP_SOCKET_URL } from "@env";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";

const STATUS_LABELS = {
  pendente: "Pendente",
  em_preparo: "Em Preparo",
  pronto: "Pronto",
};

const STATUS_NEXT = {
  pendente: "em_preparo",
  em_preparo: "pronto",
};

const STATUS_NEXT_LABEL = {
  pendente: "Iniciar Preparo",
  em_preparo: "Marcar Pronto",
};

const GerirPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scaleValues, setScaleValues] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchPedidos();
    const socketUrl = REACT_APP_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socket.on("orderGroupCreated", fetchPedidos);
    socket.on("orderGroupDeleted", fetchPedidos);
    socket.on("orderGroupUpdated", fetchPedidos);
    return () => socket.disconnect();
  }, []);

  const fetchPedidos = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const data = await obterGruposDePedidos(token);
      const ativos = data.filter((p) => p.status !== "pronto");
      const scales = {};
      ativos.forEach((p) => { scales[p.id] = new Animated.Value(1); });
      setScaleValues(scales);
      setPedidos(ativos);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao carregar pedidos: " + error.message);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAvancarStatus = async (pedidoId, statusAtual) => {
    const novoStatus = STATUS_NEXT[statusAtual];
    if (!novoStatus) return;

    const token = await AsyncStorage.getItem("token");
    try {
      await atualizarStatusDoGrupoDePedidos(token, pedidoId, novoStatus);
      if (novoStatus === "pronto") {
        setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
      } else {
        setPedidos((prev) =>
          prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
        );
      }
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao atualizar pedido: " + error.message);
      setModalVisible(true);
    }
  };

  const animateBtn = (id) => {
    const scale = scaleValues[id];
    if (!scale) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const statusColor = (status) => {
    if (status === "pendente") return "#f39c12";
    if (status === "em_preparo") return "#3498db";
    return "#2ecc71";
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.primary }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral }]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={[styles.cardTitle, { color: COLORS.text }]}>
            Pedido #{item.id}
            {item.mesa ? `  •  Mesa ${item.mesa}` : ""}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + "22", borderColor: statusColor(item.status) }]}>
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>
        <Text style={[styles.totalText, { color: COLORS.accent }]}>
          {parseFloat(item.totalPrice).toFixed(2)}€
        </Text>
      </View>

      <View style={styles.itemsList}>
        {item.items && item.items.map((it, idx) => (
          <View key={idx}>
            <Text style={[styles.itemLine, { color: COLORS.text }]}>
              • {it.quantidade}× {it.nome}
            </Text>
            {it.observacoes ? (
              <Text style={[styles.itemObs, { color: COLORS.text }]}>  ↳ {it.observacoes}</Text>
            ) : null}
          </View>
        ))}
      </View>

      {STATUS_NEXT[item.status] && (
        <Animated.View style={{ transform: [{ scale: scaleValues[item.id] || new Animated.Value(1) }] }}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}
            onPress={() => {
              animateBtn(item.id);
              handleAvancarStatus(item.id, item.status);
            }}
          >
            <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>
              {STATUS_NEXT_LABEL[item.status]}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <FlatList
        data={pedidos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: COLORS.text }]}>
              Nenhum pedido ativo
            </Text>
          </View>
        }
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
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: {
    padding: wp("4%"),
    gap: hp("1.5%"),
  },
  card: {
    borderRadius: wp("3%"),
    borderWidth: 1,
    padding: wp("4%"),
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: hp("1%"),
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    marginBottom: hp("0.5%"),
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: wp("2%"),
    paddingHorizontal: wp("2%"),
    paddingVertical: hp("0.3%"),
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: wp("3%"),
    fontWeight: "600",
  },
  totalText: {
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  itemsList: {
    gap: hp("0.3%"),
  },
  itemLine: {
    fontSize: wp("3.8%"),
  },
  itemObs: {
    fontSize: wp("3.2%"),
    opacity: 0.65,
    marginLeft: wp("3%"),
    fontStyle: "italic",
  },
  actionBtn: {
    borderRadius: wp("2%"),
    padding: wp("3%"),
    alignItems: "center",
    marginTop: hp("0.5%"),
  },
  actionBtnText: {
    fontWeight: "bold",
    fontSize: wp("4%"),
  },
  emptyContainer: {
    paddingTop: hp("20%"),
    alignItems: "center",
  },
  emptyText: {
    fontSize: wp("4.5%"),
    opacity: 0.5,
  },
});

export default GerirPedidos;
