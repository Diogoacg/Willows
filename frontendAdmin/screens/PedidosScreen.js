import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToCartWithDetails } from "../slices/cartSlice";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { obterItensDoInventario } from "../api/apiInventory";
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
import QuantityModal from "../components/QuantityModal";

const numColumns = 3;

const Item = ({ item, itemWidth, onPress, badgeCount, onLayout, itemHeight }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const handlePressIn = () => {
    Animated.timing(scaleValue, { toValue: 0.9, duration: 200, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleValue }], height: itemHeight }}
      onLayout={onLayout}
    >
      <Pressable
        style={[
          styles.itemContainer,
          { width: itemWidth, borderColor: COLORS.neutral, backgroundColor: COLORS.secondary },
        ]}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {badgeCount > 0 && (
          <View style={[styles.itemBadgeContainer, { backgroundColor: COLORS.accent }]}>
            <Text style={[styles.itemBadgeText, { color: COLORS.text }]}>{badgeCount}</Text>
          </View>
        )}
        <Text style={[styles.itemName, { color: COLORS.text }]} numberOfLines={2} adjustsFontSizeToFit>
          {item.nome}
        </Text>
        <Text style={[styles.itemPreco, { color: COLORS.text }]}>{item.preco}€</Text>
      </Pressable>
    </Animated.View>
  );
};

const PedidosScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemHeights, setItemHeights] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;
  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    fetchInventoryItems();
    const socketUrl = REACT_APP_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socket.on("itemCreated", fetchInventoryItems);
    socket.on("itemDeleted", fetchInventoryItems);
    socket.on("itemUpdated", fetchInventoryItems);
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [inventoryItems, searchText]);

  const fetchInventoryItems = async () => {
    try {
      const items = await obterItensDoInventario();
      setInventoryItems(items);
    } catch (error) {
      setAlertTitle("Erro");
      setAlertMessage("Erro ao obter itens do inventário: " + error.message);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const normalized = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (text) {
      setFilteredItems(inventoryItems.filter((i) => normalized(i.nome).includes(normalized(text))));
    } else {
      setFilteredItems(inventoryItems);
    }
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleModalAdd = (quantity, observacoes) => {
    dispatch(
      addToCartWithDetails({
        ...selectedItem,
        quantity,
        observacoes: observacoes || undefined,
        cartKey: `${selectedItem.id}_${Date.now()}`,
      })
    );
    setModalVisible(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const itemWidth = screenWidth / numColumns - wp("4%");

  const renderItem = ({ item, index }) => {
    const badgeCount = cartItems
      .filter((c) => c.id === item.id)
      .reduce((acc, c) => acc + c.quantity, 0);
    const itemHeight = itemHeights[Math.floor(index / numColumns)] || null;

    return (
      <Item
        item={item}
        itemWidth={itemWidth}
        onPress={handleItemPress}
        badgeCount={badgeCount}
        itemHeight={itemHeight}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          const row = Math.floor(index / numColumns);
          setItemHeights((prev) => {
            const next = { ...prev };
            if (!next[row] || height > next[row]) next[row] = height;
            return next;
          });
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <View style={[styles.searchContainer, { borderColor: COLORS.neutral, backgroundColor: COLORS.secondary }]}>
          <Ionicons name="search-outline" size={24} style={[styles.searchIcon, { color: COLORS.text }]} />
          <TextInput
            style={[styles.input, { color: COLORS.text }]}
            placeholder="Digite aqui para pesquisar"
            placeholderTextColor={COLORS.text}
            onChangeText={handleSearch}
            value={searchText}
          />
        </View>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
          <Ionicons name="cart-outline" size={24} color={COLORS.accent} />
          {cartItems.length > 0 && (
            <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.listContentContainer}
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
      />

      <QuantityModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedItem(null); }}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: wp("2%"),
    borderRadius: wp("2%"),
    borderWidth: wp("0.2%"),
    paddingHorizontal: wp("2%"),
  },
  input: { flex: 1, height: hp("5%"), marginLeft: wp("1%") },
  searchIcon: { marginRight: wp("1%") },
  cartButton: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
  badge: {
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  itemContainer: {
    marginTop: hp("2%"),
    marginHorizontal: wp("2%"),
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: wp("2%"),
    borderWidth: wp("0.2%"),
    elevation: 3,
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    padding: wp("4%"),
    position: "relative",
    minHeight: hp("10.75%"),
  },
  itemBadgeContainer: {
    position: "absolute",
    top: hp("-1%"),
    right: wp("-1.5%"),
    borderRadius: wp("10%"),
    width: hp("3.5%"),
    height: hp("3.5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  itemBadgeText: { fontSize: wp("3%"), fontWeight: "bold" },
  itemName: {
    fontSize: wp("3.6%"),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp("1%"),
    width: "100%",
  },
  itemPreco: { fontSize: wp("3%"), textAlign: "center", marginBottom: hp("1%") },
  listContentContainer: { flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default PedidosScreen;
