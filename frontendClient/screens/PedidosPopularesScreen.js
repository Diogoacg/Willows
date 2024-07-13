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
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, clearCart } from "../slices/cartSlice";
import ActionModal from "../components/ActionModal";
import QuantityModal from "../components/QuantityModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { obterItensDoInventario } from "../api/apiInventory";
import { criarNovoGrupoDePedidos } from "../api/apiOrderGroup";
import AsyncStorage from "@react-native-async-storage/async-storage";

const numColumns = 3;

const screenWidt = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const PedidosPopularesScreen = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const { width: screenWidth, height: screenHeigth} = useWindowDimensions();

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const items = await obterItensDoInventario();
      console.log("Itens do inventário:", items);
      setInventoryItems(items);
    } catch (error) {
      console.error("Erro ao buscar itens do inventário:", error.message);
    }
  };

  const handleImagePress = (item) => {
    setSelectedItem(item);
    setQuantityModalVisible(true);
  };

  const handleAddToCart = (quantity) => {
    dispatch(addToCart({ ...selectedItem, quantity }));
    setQuantityModalVisible(false);
  };

  const handleOpenModal = () => {
    setVisibleModal(true);
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
    dispatch(clearCart()); // Limpa o carrinho ao fechar o modal
  };

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

      console.log("Pedido confirmado:", cartItems);
      dispatch(clearCart());
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao confirmar pedido:", error.message);
    }
  };

  const itemWidth = screenWidth / numColumns - 20;

  const renderItem = ({ item }) => {
    const imagePath = "../assets/favicon.png";
    return (
      <TouchableOpacity
        style={[styles.itemContainer, { width: itemWidth, height: itemWidth }]}
        onPress={() => handleImagePress(item)}
      >
        <Image source={require(imagePath)} style={styles.image} />
        <Text style={styles.itemName}>{item.nome}</Text>
        <Text style={styles.itemPreco}>${item.preco.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerSpace} />
        <TouchableOpacity
          style={styles.homePageButton}
          onPress={() => navigation.navigate("HomePage")}
        >
          <Ionicons name="home-outline" size={screenWidt * 0.05} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={handleOpenModal}>
          <Ionicons name="cart-outline" size={screenWidt * 0.05} />
          {cartItems.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <FlatList
          data={inventoryItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
        />
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
        <QuantityModal
          visible={quantityModalVisible}
          onClose={() => setQuantityModalVisible(false)}
          onAdd={handleAddToCart}
          item={selectedItem}
        />
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
  },
  headerSpace: {
    height: '8%',
  },
  listContainer: {
    paddingHorizontal: '2%',
  },
  itemContainer: {
    marginTop: '5%',
    margin: '1.8%',
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
  },
  itemName: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: '2%',
  },
  itemPrice: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
  cartButton: {
    position: "absolute",
    top: '4.3%',
    right: '3.65%',
    backgroundColor: "#fff",
    padding: '2.5%',
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
  homePageButton: {
    position: "absolute",
    top: '4.3%',
    left: '3.65%',
    backgroundColor: "#fff",
    padding: '2.5%',
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
  image: {
    top: '5%',
    width: "40%",
    height: "40%",
    resizeMode: "cover",
  },
});

export default PedidosPopularesScreen;
