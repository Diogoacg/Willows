import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Modal,
  Text,
  TextInput,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, clearCart } from "../slices/cartSlice";
import ActionModal from "../components/ActionModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  obterItensDoInventario,
  atualizarItemNoInventario,
} from "../api/apiInventory";
import { criarNovoGrupoDePedidos } from "../api/apiOrderGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const numColumns = 3;

const Item = ({ item, itemWidth, handleAddToCart, badgeCount }) => {
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
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
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
        {item.imageUri ? (
          <View>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
          </View>
        ) : (
          <Image
            source={require("../assets/favicon.png")}
            style={styles.image}
          />
        )}
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
        <Text style={[styles.itemName, { color: COLORS.text }]}>
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
  const [visibleModal, setVisibleModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
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
    //const socket = io("http://localhost:5000");

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
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [inventoryItems, searchText]);

  const fetchInventoryItems = async () => {
    try {
      const items = await obterItensDoInventario();

      // Verifica cada item e busca imagem se necessário
      const itemsWithImages = await Promise.all(
        items.map(async (item) => {
          // Se não tiver imageUri, busca no Unsplash
          if (!item.imageUri) {
            const uri = await fetchImageUri(item.nome);
            const token = await AsyncStorage.getItem("token");
            await atualizarItemNoInventario(
              token,
              item.id,
              item.nome,
              item.preco,
              uri
            );
            return { ...item, imageUri: uri };
          }
          return item;
        })
      );

      setInventoryItems(itemsWithImages);
      setFilteredItems(itemsWithImages);
    } catch (error) {
      console.error("Erro ao buscar itens do inventário:", error.message);
    }
  };

  const fetchImageUri = async (itemName) => {
    try {
      const encodedItemName = encodeURIComponent(itemName);
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodedItemName}&lang=pt`,
        {
          headers: {
            Authorization:
              "Client-ID yoPSP5TFfOvZ1uog-ibC6godTeccW6OLEehYrC4XNqY",
          },
        }
      );

      const data = await response.json();
      if (data.urls && data.urls.small) {
        return data.urls.small;
      } else {
        throw new Error("Imagem não encontrada no Unsplash");
      }
    } catch (error) {
      console.error("Erro ao buscar imagem do Unsplash:", error.message);
      return ""; // URI de imagem padrão ou vazia
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

  const handleCloseModal = () => {
    setVisibleModal(false);
    dispatch(clearCart());
    setFilteredItems(filteredItems.map((item) => ({ ...item, badgeCount: 0 })));
  };

  const handleBackModal = () => {
    setVisibleModal(false);
  };

  const handleConfirmOrder = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const items = cartItems.map((item) => ({
        nome: item.nome,
        quantidade: item.quantity,
      }));

      const orderData = {
        items: items,
      };

      await criarNovoGrupoDePedidos(token, orderData);

      dispatch(clearCart());
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao confirmar pedido:", error.message);
    }
  };

  const itemWidth = screenWidth / numColumns - wp("4%");

  const renderItem = ({ item }) => {
    const badgeCount =
      cartItems.find((cartItem) => cartItem.id === item.id)?.quantity || 0;
    return (
      <Item
        item={item}
        itemWidth={itemWidth}
        handleAddToCart={handleAddToCart}
        badgeCount={badgeCount}
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: COLORS.primary }]}
    >
      <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
        <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={COLORS.accent}
            />
          </Pressable>
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
            onPress={() => setVisibleModal(true)}
          >
            <Ionicons name="cart-outline" size={24} color={COLORS.accent} />
            {cartItems.length > 0 && (
              <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
                <Text style={[styles.badgeText, { color: COLORS.text }]}>
                  {cartItems.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
        />
        <Modal
          visible={visibleModal}
          transparent={true}
          onRequestClose={handleBackModal}
        >
          <ActionModal
            handleClose={handleCloseModal}
            handleBack={handleBackModal}
            handleConfirm={handleConfirmOrder}
            cartItems={cartItems}
          />
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    marginTop: hp("4%"), // Extra space at the top
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: wp("2%"),
    borderWidth: 1,
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
  itemContainer: {
    marginTop: hp("2%"),
    margin: wp("2%"),
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    elevation: 3,
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    padding: wp("4%"),
    position: "relative", // Para badges ficarem posicionados corretamente
  },
  image: {
    width: wp("25%"),
    height: wp("25%"),
    resizeMode: "cover",
    marginBottom: hp("1%"),
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
  itemBadgeContainer: {
    position: "absolute",
    top: hp("-1%"),
    right: wp("-1.5%"),
    borderRadius: 90,
    width: hp("3.5%"),
    height: hp("3.5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  itemBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  itemName: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp("1%"),
    width: "100%",
  },
  itemPreco: {
    fontSize: wp("3%"),
    textAlign: "center",
  },
});

export default PedidosScreen;
