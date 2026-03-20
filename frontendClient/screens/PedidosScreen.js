import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToCartWithDetails } from "../slices/cartSlice";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { obterItensDoInventario } from "../api/apiInventory";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { REACT_APP_SOCKET_URL } from "@env";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";
import QuantityModal from "../components/QuantityModal";

const NUM_COLUMNS = 3;

const CATEGORIAS = [
  { key: "todas", label: "Todas" },
  { key: "bebidas_quentes", label: "Quentes" },
  { key: "bebidas_frias", label: "Frias" },
  { key: "petiscos", label: "Petiscos" },
  { key: "bolos", label: "Bolos" },
  { key: "outros", label: "Outros" },
];

const MenuItem = ({ item, itemWidth, onPress, badgeCount }) => {
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  return (
    <View style={{ width: itemWidth }}>
      <Pressable
        style={[
          styles.itemContainer,
          { borderColor: COLORS.neutral, backgroundColor: COLORS.secondary },
        ]}
        onPress={onPress}
      >
        {badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
            <Text style={[styles.badgeText, { color: COLORS.primary }]}>{badgeCount}</Text>
          </View>
        )}
        <Text style={[styles.itemName, { color: COLORS.text }]} numberOfLines={2} adjustsFontSizeToFit>
          {item.nome}
        </Text>
        <Text style={[styles.itemPreco, { color: COLORS.accent }]}>
          {parseFloat(item.preco).toFixed(2)}€
        </Text>
      </Pressable>
    </View>
  );
};

const PedidosScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = screenWidth / NUM_COLUMNS - wp("4%");

  const totalNoCarrinho = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    fetchItems();

    const socketUrl = REACT_APP_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socket.on("itemCreated", fetchItems);
    socket.on("itemDeleted", fetchItems);
    socket.on("itemUpdated", fetchItems);
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    applyFilters(inventoryItems, searchText, categoriaAtiva);
  }, [inventoryItems, searchText, categoriaAtiva]);

  const fetchItems = async () => {
    try {
      const items = await obterItensDoInventario();
      const disponiveis = items.filter((i) => i.disponivel !== false);
      setInventoryItems(disponiveis);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao carregar o menu: " + error.message);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (items, text, categoria) => {
    let result = items;

    if (categoria !== "todas") {
      result = result.filter((i) => i.categoria === categoria);
    }

    if (text) {
      const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      result = result.filter((i) =>
        i.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalized)
      );
    }

    setFilteredItems(result);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setQtyModalVisible(true);
  };

  const handleModalAdd = (quantity, observacoes) => {
    dispatch(addToCartWithDetails({
      ...selectedItem,
      quantity,
      observacoes,
      cartKey: `${selectedItem.id}_${Date.now()}`,
    }));
    setQtyModalVisible(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.primary }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const badgeCount = cartItems
      .filter((c) => c.id === item.id)
      .reduce((acc, c) => acc + c.quantity, 0);
    return (
      <MenuItem
        item={item}
        itemWidth={itemWidth}
        onPress={() => handleItemPress(item)}
        badgeCount={badgeCount}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <View style={[styles.searchContainer, { borderColor: COLORS.neutral, backgroundColor: COLORS.secondary }]}>
          <Ionicons name="search-outline" size={20} color={COLORS.text} />
          <TextInput
            style={[styles.input, { color: COLORS.text }]}
            placeholder="Pesquisar..."
            placeholderTextColor={COLORS.text}
            onChangeText={(t) => setSearchText(t)}
            value={searchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.text} />
            </Pressable>
          )}
        </View>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
          <Ionicons name="cart-outline" size={26} color={COLORS.accent} />
          {totalNoCarrinho > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: COLORS.accent }]}>
              <Text style={[styles.cartBadgeText, { color: COLORS.primary }]}>{totalNoCarrinho}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriaBar} contentContainerStyle={styles.categoriaBarContent}>
        {CATEGORIAS.map((cat) => (
          <Pressable
            key={cat.key}
            style={[
              styles.categoriaChip,
              {
                backgroundColor: categoriaAtiva === cat.key ? COLORS.accent : COLORS.secondary,
                borderColor: COLORS.neutral,
              },
            ]}
            onPress={() => setCategoriaAtiva(cat.key)}
          >
            <Text
              style={[
                styles.categoriaChipText,
                { color: categoriaAtiva === cat.key ? COLORS.primary : COLORS.text },
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: COLORS.text }]}>
              Nenhum item encontrado
            </Text>
          </View>
        }
      />

      <QuantityModal
        visible={qtyModalVisible}
        onClose={() => { setQtyModalVisible(false); setSelectedItem(null); }}
        onAdd={handleModalAdd}
        item={selectedItem}
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
    paddingVertical: hp("1.5%"),
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderRadius: wp("2%"),
    borderWidth: 1,
    paddingHorizontal: wp("2.5%"),
    gap: wp("1.5%"),
    height: hp("5%"),
  },
  input: {
    flex: 1,
    fontSize: wp("3.8%"),
  },
  cartButton: {
    marginLeft: wp("3%"),
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  categoriaBar: {
    maxHeight: hp("6%"),
  },
  categoriaBarContent: {
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("0.75%"),
    gap: wp("2%"),
    alignItems: "center",
  },
  categoriaChip: {
    borderRadius: wp("4%"),
    borderWidth: 1,
    paddingHorizontal: wp("3.5%"),
    paddingVertical: hp("0.5%"),
  },
  categoriaChipText: {
    fontSize: wp("3.2%"),
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: wp("1%"),
    paddingBottom: hp("2%"),
  },
  itemContainer: {
    margin: wp("1.5%"),
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: wp("2%"),
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: wp("3%"),
    minHeight: hp("11%"),
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: wp("3%"),
    fontWeight: "bold",
  },
  itemName: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp("0.5%"),
  },
  itemPreco: {
    fontSize: wp("3.2%"),
    fontWeight: "600",
    textAlign: "center",
    marginTop: hp("0.5%"),
  },
  emptyContainer: {
    paddingTop: hp("10%"),
    alignItems: "center",
  },
  emptyText: {
    fontSize: wp("4%"),
    opacity: 0.5,
  },
});

export default PedidosScreen;
