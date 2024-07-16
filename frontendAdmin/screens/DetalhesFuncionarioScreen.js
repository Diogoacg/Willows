import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { obterInformacoesDoUtilizador } from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const itemWidth = screenWidth / numColumns - wp("4%");

const numColumns = 3;

const DetalhesFuncionarioScreen = ({ navigation }) => {
  const route = useRoute();
  const { userId } = route.params;
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const details = await obterInformacoesDoUtilizador(token, userId);
      setUserDetails(details);
    } catch (error) {
      console.error("Erro ao buscar informações do utilizador:", error.message);
    }
  };

  if (!userDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </Pressable>
      </View>
      <View style={styles.inContainer}>
        <Text style={styles.title}>Detalhes do Funcionário</Text>
        <Text style={styles.label}>
          Nome de Utilizador: {userDetails.username}
        </Text>
        <Text style={styles.label}>Email: {userDetails.email}</Text>
        {/* Adicione mais detalhes conforme necessário */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: screenHeight * 0.1,
  },
  inContainer: {
    paddingTop: hp("2%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: hp("-6%"), // Espaço extra no topo
  },
  button: {
    marginLeft: wp("-4%"),
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  loadingContainer: {
    backgroundColor: "black",
    color: "black",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DetalhesFuncionarioScreen;
