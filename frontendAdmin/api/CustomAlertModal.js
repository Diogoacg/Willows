// Code to be used in a custom alert modal component
import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";
import * as NavigationBar from "expo-navigation-bar";

const CustomAlertModal = ({ visible, onClose, title, message }) => {
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: COLORS.overlay }]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: COLORS.secondary, borderColor: COLORS.accent },
          ]}
        >
          <Text style={[styles.title, { color: COLORS.text }]}>{title}</Text>
          <Text style={[styles.message, { color: COLORS.text }]}>
            {message}
          </Text>
          <Pressable
            style={[
              styles.button,
              { backgroundColor: COLORS.accent, borderColor: COLORS.neutral },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: COLORS.text }]}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    borderWidth: 1,
  },
});

export default CustomAlertModal;
