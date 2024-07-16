import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
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

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const COLORS = {
  primary: "#15191d",
  secondary: "#212529",
  accent: "#FF6A3D",
  neutral: "#313b4b",
  text: "#c7c7c7",
};

const FuncionariosScreen = () => {
  const [logins, setLogins] = useState([]);
  const navigation = useNavigation();

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

  const renderLogin = ({ item }) => (
    <View style={styles.itemContainer}>
      <Pressable
        style={styles.button}
        onPress={() => handleViewDetails(item.id)}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Funcionário: {item.username}</Text>
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
          <Text style={styles.cardDetail}>
            Estado: {item.status ? "Em serviço" : "Off"}
          </Text>
          <Text style={styles.cardDetail}>
            Última Atividade: {item.lastActive}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
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
    backgroundColor: COLORS.primary,
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
    borderBottomColor: COLORS.neutral,
    marginTop: hp("-6%"),
  },
  listSpacing: {
    height: 20, // Espaço entre o header e o primeiro card
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
  },
  button: {
    width: "100%",
    backgroundColor: COLORS.secondary,
    borderRadius: 25,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.secondary,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  cardDetail: {
    fontSize: 14,
    marginBottom: 5,
    color: COLORS.text,
  },
  deleteButton: {
    backgroundColor: COLORS.secondary,
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  createButtonText: {
    backgroundColor: COLORS.primary,
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: "bold",
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
});

export default FuncionariosScreen;
