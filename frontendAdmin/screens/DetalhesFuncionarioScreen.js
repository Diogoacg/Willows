import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import { obterInformacoesDoUtilizador } from "../api/apiAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const DetalhesFuncionarioScreen = () => {
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
      <Text style={styles.title}>Detalhes do Funcionário</Text>
      <Text style={styles.label}>
        Nome de Utilizador: {userDetails.username}
      </Text>
      <Text style={styles.label}>Email: {userDetails.email}</Text>
      {/* Adicione mais detalhes conforme necessário */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: screenHeight * 0.1,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DetalhesFuncionarioScreen;
