import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  obterInformacoesDoUtilizador,
  obterTodosOsUtilizadores,
  deleteUser,
} from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import io from "socket.io-client";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const FuncionariosScreen = () => {
  const [logins, setLogins] = useState([]);
  const navigation = useNavigation();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { isDarkMode } = useTheme();

  const COLORS = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    fetchLogins();

    // Set up Socket.IO client
    const socket = io("https://willows-production.up.railway.app");
    //const socket = io("http://localhost:5000");

    // Listen for relevant events
    socket.on("userCreated", () => {
      fetchLogins();
    });

    socket.on("userDeleted", () => {
      fetchLogins();
    });

    socket.on("userRoleUpdated", () => {
      fetchLogins();
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchLogins = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const loginsData = await obterTodosOsUtilizadores(token);
      setLogins(loginsData);
    } catch (error) {
      console.error("Erro ao buscar logins:", error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = await AsyncStorage.getItem("token");
    try {
      await deleteUser(token, userId);
      fetchLogins();
      alert("Utilizador eliminado com sucesso!");
    } catch (error) {
      console.error("Erro ao eliminar utilizador:", error.message);
      alert("Falha ao eliminar utilizador.");
    }
  };

  const handleViewDetails = (userId) => {
    navigation.navigate("DetalhesFuncionario", { userId });
  };

  const handleCreateUser = () => {
    navigation.navigate("CriarFuncionario");
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

  const renderLogin = ({ item }) => (
    <Animated.View
      style={[styles.buttonAnimated, { transform: [{ scale: scaleValue }] }]}
    >
      <View
        style={[styles.itemContainer, { backgroundColor: COLORS.secondary }]}
      >
        <Pressable
          style={styles.button}
          onPress={() => handleViewDetails(item.id)}
          onPressIn={() => animateScaleIn(scaleValue)}
          onPressOut={() => animateScaleOut(scaleValue)}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: COLORS.text }]}>
                Funcionário: {item.username}
              </Text>
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(item.id)}
              >
                <Ionicons
                  name={"trash-outline"}
                  size={22}
                  color={COLORS.accent}
                />
              </Pressable>
            </View>
            <Text style={[styles.cardDetail, { color: COLORS.text }]}>
              Email: {item.email}
            </Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name={"arrow-back-outline"}
            size={24}
            color={COLORS.accent}
          />
        </Pressable>
        <View style={styles.containerAdd}>
          <Pressable style={styles.createButton} onPress={handleCreateUser}>
            <Ionicons
              name={"add-circle-outline"}
              size={24}
              color={COLORS.accent}
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.listSpacing} />
      <FlatList
        data={logins}
        renderItem={renderLogin}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: (screenHeight * 0.1) / 2,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    marginTop: hp("-6%"),
  },
  listSpacing: {
    height: 20, // Espaço entre o header e o primeiro card
  },
  itemContainer: {
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
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
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  createButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  backButton: {
    marginLeft: wp("-4%"),
    justifyContent: "flex-start",
  },
  containerAdd: {
    top: hp("4%"),
    left: wp("79%"),
    justifyContent: "flex-end",
  },
  buttonAnimated: {
    width: "100%",
  },
});

export default FuncionariosScreen;
