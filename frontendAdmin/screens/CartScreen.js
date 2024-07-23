// CartScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from "../slices/cartSlice";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import { criarNovoGrupoDePedidos } from "../api/apiOrderGroup";

const CartScreen = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  const [scaleValues, setScaleValues] = useState({});

  useEffect(() => {
    const initialScaleValues = {};
    cartItems.forEach((item) => {
      initialScaleValues[item.id] = new Animated.Value(1);
    });
    setScaleValues(initialScaleValues);
  }, [cartItems]);

  const handleIncrement = (id) => {
    dispatch(incrementQuantity({ id }));
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity({ id }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };
  const handleConfirm = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert(
        "O carrinho está vazio. Adicione itens antes de confirmar a compra."
      );
      return;
    }
    console.log("cartItems", cartItems);
    // Transforme os itens do carrinho no formato esperado pela API
    const orderData = cartItems.map((item) => ({
      nome: item.nome, // Assumindo que 'name' é o nome do item no seu carrinho
      quantidade: item.quantity,
    }));

    try {
      await criarNovoGrupoDePedidos(token, { items: orderData });
      navigation.goBack();
      handleClearCart();
      alert("Compra confirmada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar grupo de pedidos:", error.message);
      alert("Falha ao criar grupo de pedidos.");
    }
  };

  const handleCancel = () => {
    handleClearCart();
    navigation.goBack();
    alert("Compra cancelada!");
  };

  const animateScaleIn = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const animateScaleOut = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.buttonAnimated,
        {
          transform: [{ scale: scaleValues[item.id] || new Animated.Value(1) }],
        },
      ]}
    >
      <View
        style={[
          styles.itemContainer,
          { backgroundColor: COLORS.secondary, borderColor: COLORS.neutral },
        ]}
      >
        <Pressable
          style={styles.button}
          onPressIn={() => animateScaleIn(scaleValues[item.id])}
          onPressOut={() => animateScaleOut(scaleValues[item.id])}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: COLORS.text }]}>
                {item.nome}
              </Text>
              <View style={styles.cardActions}>
                <Pressable
                  style={styles.incrementButton}
                  onPress={() => handleIncrement(item.id)}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={30}
                    color={COLORS.accent}
                  />
                </Pressable>
                <Text style={[styles.itemQuantity, { color: COLORS.text }]}>
                  {item.quantity}
                </Text>

                <Pressable
                  style={styles.decrementButton}
                  onPress={() => handleDecrement(item.id)}
                >
                  <Ionicons
                    name="remove-circle-outline"
                    size={30}
                    color={COLORS.accent}
                  />
                </Pressable>
              </View>
            </View>
            <Text style={[styles.cardDetail, { color: COLORS.text }]}>
              Preço: {item.preco}€
            </Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={[styles.header, { borderBottomColor: COLORS.neutral }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="return-down-back" size={24} color={COLORS.accent} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>
          Carrinho
        </Text>
      </View>

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <View style={[styles.footer, { borderTopColor: COLORS.neutral }]}>
        <Text style={[styles.footerButtonText, { color: COLORS.text }]}>
          Total:{" "}
          {cartItems.reduce((acc, item) => acc + item.preco * item.quantity, 0)}
          €
        </Text>
      </View>

      <View style={[styles.footer, { borderTopColor: COLORS.neutral }]}>
        <Pressable
          style={[
            styles.footerButton,
            { backgroundColor: COLORS.accent, borderColor: COLORS.neutral },
          ]}
          onPress={handleConfirm}
        >
          <Text style={[styles.footerButtonText, { color: COLORS.primary }]}>
            Confirmar
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.footerButton,
            { backgroundColor: COLORS.neutral, borderColor: COLORS.accent },
          ]}
          onPress={handleCancel}
        >
          <Text style={[styles.footerButtonText, { color: COLORS.text }]}>
            Cancelar
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp("1%"),
    paddingTop: hp("10%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    marginTop: hp("-6%"),
  },
  backButton: {
    marginRight: wp("2%"),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: wp("2%"),
  },
  itemContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 3,
    marginLeft: wp("4%"),
    marginRight: wp("4%"),
  },
  button: {
    width: "100%",
    borderRadius: 25,
  },
  card: {
    width: "100%",
    borderRadius: 8,
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  cardDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  incrementButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  decrementButton: {
    padding: 8,
    borderRadius: 8,
  },

  itemQuantity: {
    alignSelf: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  cardActions: {
    flexDirection: "row",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  footerButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CartScreen;
