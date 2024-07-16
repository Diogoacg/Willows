import {
  Image,
  StyleSheet,
  Text,
  Pressable,
  View,
  Dimensions,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const HomePage = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme(); // Obtém o estado de tema atual
  const COLORS = isDarkMode ? colors.dark : colors.light; // Define as cores com base no tema

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <Image source={require("../assets/logofinal.jpg")} style={styles.logo} />
      <Image
        source={require("../assets/imagemfundo.jpg")}
        style={styles.bgimage}
      />
      <View style={styles.button1Container}>
        <Pressable
          style={[
            styles.gerirPedidosButton,
            { backgroundColor: COLORS.accent, borderColor: COLORS.neutral },
          ]}
          onPress={() => navigation.navigate("Gestao")}
        >
          <Text
            style={[styles.gerirPedidosButtonText, { color: COLORS.primary }]}
          >
            Funcionários
          </Text>
        </Pressable>
      </View>
      <View style={styles.button2Container}>
        <Pressable
          style={[
            styles.gerirPedidosButton,
            { backgroundColor: COLORS.accent, borderColor: COLORS.neutral },
          ]}
          onPress={() => navigation.navigate("Main")}
        >
          <Text
            style={[styles.fazerPedidosButtonText, { color: COLORS.primary }]}
          >
            Fazer Pedidos
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    height: screenHeight * 0.05,
    width: screenWidth * 0.35,
    marginVertical: screenHeight * 0.05,
    resizeMode: "contain",
  },
  bgimage: {
    height: screenHeight * 0.55,
    width: screenWidth * 0.85,
    marginVertical: screenHeight * 0.02,
    resizeMode: "contain",
  },
  button1Container: {
    marginTop: screenHeight * 0.02,
    borderWidth: 1,
    width: "50%",
    height: screenHeight * 0.08,
    borderRadius: 25,
    overflow: "hidden",
  },
  button2Container: {
    marginTop: screenHeight * 0.02,
    borderWidth: 1,
    width: "50%",
    height: screenHeight * 0.08,
    borderRadius: 25,
    overflow: "hidden",
  },
  gerirPedidosButton: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  gerirPedidosButtonText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
  },
  fazerPedidosButtonText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "bold",
  },
});

export default HomePage;
