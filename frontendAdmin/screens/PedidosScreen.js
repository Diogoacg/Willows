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
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, clearCart } from "../slices/cartSlice";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { obterItensDoInventario } from "../api/apiInventory";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import CustomAlertModal from "../components/CustomAlertModal";

const numColumns = 3;

const Item = ({
  item,
  itemWidth,
  handleAddToCart,
  badgeCount,
  onLayout,
  itemHeight,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    handleAddToCart(item);
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleValue }], height: itemHeight }}
      onLayout={onLayout}
    >
      <Pressable
        style={[
          styles.itemContainer,
          {
            width: itemWidth,
            borderColor: COLORS.neutral,
            backgroundColor: COLORS.secondary,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {badgeCount > 0 && (
          <View
            style={[
              styles.itemBadgeContainer,
              { backgroundColor: COLORS.accent },
            ]}
          >
            <Text style={[styles.itemBadgeText, { color: COLORS.text }]}>
              {badgeCount}
            </Text>
          </View>
        )}
        <Text
          style={[styles.itemName, { color: COLORS.text }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {item.nome}
        </Text>
        <Text style={[styles.itemPreco, { color: COLORS.text }]}>
          {item.preco}€
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const PedidosScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemHeights, setItemHeights] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    fetchInventoryItems();

    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");

    // Listen for relevant events
    socket.on("itemCreated", () => {
      fetchInventoryItems();
    });

    socket.on("itemDeleted", () => {
      fetchInventoryItems();
    });

    socket.on("itemUpdated", () => {
      fetchInventoryItems();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [inventoryItems, searchText]);

  const fetchInventoryItems = async () => {
    try {
      const items = await obterItensDoInventario();
      setInventoryItems(items);
    } catch (error) {
      setModalTitle("Erro");
      setModalMessage("Erro ao obter itens do inventário: " + error.message);
      setModalVisible(true);
      console.error("Erro ao buscar itens do inventário:", error.message);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const normalizedSearchText = text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      const filtered = inventoryItems.filter((item) =>
        item.nome
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes(normalizedSearchText)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(inventoryItems);
    }
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart(item));
  };

  const itemWidth = screenWidth / numColumns - wp("4%");

  const renderItem = ({ item, index }) => {
    const badgeCount =
      cartItems.find((cartItem) => cartItem.id === item.id)?.quantity || 0;

    const itemHeight = itemHeights[Math.floor(index / numColumns)] || null;

    return (
      <Item
        item={item}
        itemWidth={itemWidth}
        handleAddToCart={handleAddToCart}
        badgeCount={badgeCount}
        itemHeight={itemHeight}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          const row = Math.floor(index / numColumns);
          setItemHeights((prevHeights) => {
            const newHeights = { ...prevHeights };
            if (!newHeights[row] || height > newHeights[row]) {
              newHeights[row] = height;
            }
            return newHeights;
          });
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <View
          style={[
            styles.searchContainer,
            {
              borderColor: COLORS.neutral,
              backgroundColor: COLORS.secondary,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={24}
            style={[styles.searchIcon, { color: COLORS.text }]}
          />
          <TextInput
            style={[styles.input, { color: COLORS.text }]}
            placeholder="Digite aqui para pesquisar"
            placeholderTextColor={COLORS.text}
            onChangeText={handleSearch}
            value={searchText}
          />
        </View>
        <Pressable
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
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
  },
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
  input: {
    flex: 1,
    height: hp("5%"),
    marginLeft: wp("1%"),
  },
  searchIcon: {
    marginRight: wp("1%"),
  },
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
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
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
  itemBadgeText: {
    fontSize: wp("3%"),
    fontWeight: "bold",
  },
  itemName: {
    fontSize: wp("3.6%"),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp("1%"),
    width: "100%",
  },
  itemPreco: {
    fontSize: wp("3%"),
    textAlign: "center",
    marginBottom: hp("1%"),
  },
  listContentContainer: {
    flexGrow: 1,
  },
});

export default PedidosScreen;
