import {
  Image,
  StyleSheet,
  Text,
  Pressable,
  View,
  Dimensions,
  Animated,
} from "react-native";
import React, {useRef} from "react";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const HomePage = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme(); // Obtém o estado de tema atual
  const COLORS = isDarkMode ? colors.dark : colors.light; // Define as cores com base no tema
  const scaleValue1 = useRef(new Animated.Value(1)).current;
  const scaleValue2 = useRef(new Animated.Value(1)).current;
  const scaleValue3 = useRef(new Animated.Value(1)).current;

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

  return (
    <View style={[styles.container, { backgroundColor: COLORS.primary }]}>
      <Image source={require("../assets/logofinal.jpg")} style={styles.logo} />
      <Image
        source={require("../assets/imagemfundo.jpg")}
        style={styles.bgimage}
      />
      <View style={styles.containerButtons}>
      <Animated.View style={[styles.buttonAnimated1, { transform: [{ scale: scaleValue1 }] }]}>
      <View style={styles.button1Container}>
        <Pressable onPressIn={() => animateScaleIn(scaleValue1)}  onPressOut={() => animateScaleOut(scaleValue1)}
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
      </Animated.View>
      <Animated.View style={[styles.buttonAnimated2, { transform: [{ scale: scaleValue2 }] }]}>
      <View style={styles.button2Container}>
        <Pressable onPressIn={() => animateScaleIn(scaleValue2)}  onPressOut={() => animateScaleOut(scaleValue2)}
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
      </Animated.View>
      <Animated.View style={[styles.buttonAnimated3, { transform: [{ scale: scaleValue2 }] }]}>
      <View style={styles.button3Container}>
        <Pressable onPressIn={() => animateScaleIn(scaleValue3)}  onPressOut={() => animateScaleOut(scaleValue3)}
          style={[
            styles.gerirPedidosButton,
            { backgroundColor: COLORS.accent, borderColor: COLORS.neutral },
          ]}
          onPress={() => navigation.navigate("Estatisticas")}
        >
          <Text
            style={[styles.fazerPedidosButtonText, { color: COLORS.primary }]}
          >
            Estatisticas
          </Text>
        </Pressable>
      </View>
      </Animated.View>
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
  containerButtons: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    top: screenHeight * 0.05 - 82,
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
  button3Container: {
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
  buttonAnimated1: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonAnimated2: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonAnimated3: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomePage;