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

    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");
    //const socket = io("http://localhost:5000");

    // Listen for relevant events
    socket.on("itemCreated", () => {
      fetchInventoryItems();
    });

    // socket.on("getItems", () => {
    //   fetchInventoryItems();
    // });

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
            // atualizar base de dados dando updatde ao item
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
      // Pode retornar um placeholder ou tratar o erro de outra forma
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
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} />
        ) : (
          <Image
            source={require("../assets/favicon.png")}
            style={styles.image}
          />
        )}
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
