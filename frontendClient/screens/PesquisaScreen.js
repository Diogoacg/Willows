// screens/PesquisaScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ActionModal from "./../components/ActionModal";
import QuantityModal from "./../components/QuantityModal";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, clearCart } from "../slices/cartSlice";
import { obterItensDoInventario } from "../api/apiInventory";
import { criarNovoGrupoDePedidos } from "../api/apiOrderGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const PesquisaScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const items = await obterItensDoInventario();
      setInventoryItems(items);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Erro ao buscar itens do inventário: " + error.message
      );
      console.error("Erro ao buscar itens do inventário:", error.message);
    }
  };

  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const normalizedSearchText = normalizeText(text);
      const filtered = inventoryItems.filter((item) =>
        normalizeText(item.nome).includes(normalizedSearchText)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setQuantityModalVisible(true);
  };

  const handleAddToCart = (quantity) => {
    dispatch(addToCart({ ...selectedItem, quantity }));
    setQuantityModalVisible(false);
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
  };

  const handleOpenModal = () => {
    setVisibleModal(true);
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.cartItem} onPress={() => handleSelectItem(item)}>
      <Text>{item.nome}</Text>
      <Text>Preço: ${item.preco.toFixed(2)}</Text>
    </Pressable>
  );
  const handleConfirmOrder = async () => {
    try {
      // Busca o token do AsyncStorage
      const token = await AsyncStorage.getItem("token");

      // Mapeia os itens do carrinho para o formato desejado
      const items = cartItems.map((item) => ({
        nome: item.nome,
        quantidade: item.quantity,
      }));

      // Cria o objeto orderData no formato desejado
      const orderData = {
        items: items,
      };

      // Supondo que `criarNovoGrupoDePedidos` é uma função que envia o pedido para a API
      await criarNovoGrupoDePedidos(token, orderData);

      dispatch(clearCart());
      handleCloseModal();
    } catch (error) {
      Alert.alert("Erro", "Erro ao confirmar pedido: " + error.message);
      console.error("Erro ao confirmar pedido:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.homePageButton}
        onPress={() => navigation.navigate("HomePage")}
      >
        <Ionicons name="home-outline" size={screenWidth * 0.05} color="#000" />
      </Pressable>
      <Pressable style={styles.cartButton} onPress={handleOpenModal}>
        <Ionicons name="cart-outline" size={screenWidth * 0.05} color="#000" />
        {cartItems.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartItems.length}</Text>
          </View>
        )}
      </Pressable>
      <Modal
        visible={visibleModal}
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <ActionModal
          handleClose={handleCloseModal}
          handleConfirm={handleConfirmOrder}
          cartItems={cartItems}
        />
      </Modal>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite aqui para pesquisar"
          onChangeText={handleSearch}
          value={searchText}
        />
        {filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.searchResults}
          />
        ) : (
          <Text style={styles.noResultsText}>Nenhum item encontrado</Text>
        )}
      </View>
      <QuantityModal
        visible={quantityModalVisible}
        onClose={() => setQuantityModalVisible(false)}
        onAdd={handleAddToCart}
        item={selectedItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: screenHeight * 0.1, // Add some padding at the top
    paddingHorizontal: 10,
  },
  searchContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the top
  },
  input: {
    height: 40,
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  cartButton: {
    position: "absolute",
    top: "5%",
    right: "4%",
    backgroundColor: "#fff",
    padding: "2.5%",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  searchResults: {
    width: "100%",
    marginTop: 10,
  },
  noResultsText: {
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  cartItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 5,
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "red",
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default PesquisaScreen;
