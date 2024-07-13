import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Text,
  TextInput,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, clearCart } from "../slices/cartSlice";
import ActionModal from "../components/ActionModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { obterItensDoInventario } from "../api/apiInventory";
import { criarNovoGrupoDePedidos } from "../api/apiOrderGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const numColumns = 3;

const PedidosScreen = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const { width: screenWidth } = useWindowDimensions();

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    handleSearch(searchText);
  }, [inventoryItems, searchText]);

  const fetchInventoryItems = async () => {
    try {
      const items = await obterItensDoInventario();
      console.log("Itens do inventário:", items);
      setInventoryItems(items);
      setFilteredItems(items);
    } catch (error) {
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

  const handleOpenModal = () => {
    setVisibleModal(true);
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
    dispatch(clearCart());
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

      console.log("Pedido confirmado:", cartItems);
      dispatch(clearCart());
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao confirmar pedido:", error.message);
    }
  };

  const itemWidth = screenWidth / numColumns - wp("4%");

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.itemContainer, { width: itemWidth }]}
        onPress={() => handleAddToCart(item)}
      >
        <Image source={require("../assets/favicon.png")} style={styles.image} />
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text style={styles.itemPreco}>${item.preco.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="search-outline"
            size={24}
            color="grey"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Digite aqui para pesquisar"
            onChangeText={handleSearch}
            value={searchText}
          />
          <TouchableOpacity style={styles.cartButton} onPress={handleOpenModal}>
            <Ionicons name="cart-outline" size={24} color="#000" />
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: hp("4%"), // Espaço extra no topo
  },
  input: {
    flex: 1,
    height: hp("5%"),
    marginLeft: wp("2%"),
    paddingHorizontal: wp("2%"),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  searchIcon: {
    marginRight: wp("2%"),
  },
  cartButton: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
  },
  badge: {
    backgroundColor: "red",
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: wp("2%"),
  },
  itemContainer: {
    marginTop: hp("2%"),
    margin: wp("1.2%"),
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    padding: wp("4%"),
  },
  itemName: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp("1%"),
    width: "100%", // Garante que o texto ocupe todo o espaço disponível
  },
  itemPreco: {
    fontSize: wp("3%"),
    color: "#888",
    textAlign: "center",
  },
  image: {
    width: wp("25%"),
    height: wp("25%"),
    resizeMode: "cover",
    marginBottom: hp("1%"), // Espaçamento inferior para o texto
  },
});

export default PedidosScreen;
