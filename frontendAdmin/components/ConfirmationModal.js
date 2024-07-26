import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../ThemeContext";
import { colors } from "../config/theme";

const ConfirmDeleteModal = ({ visible, onClose, onConfirm }) => {
  const { isDarkMode } = useTheme();
  const COLORS = isDarkMode ? colors.dark : colors.light;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.centeredView, { backgroundColor: COLORS.overlay }]}>
        <View
          style={[
            styles.modalView,
            { backgroundColor: COLORS.secondary, borderColor: COLORS.accent },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={50}
            color={COLORS.accent}
          />
          <Text style={[styles.modalText, { color: COLORS.text }]}>
            Tem certeza que deseja apagar este funcionário?
          </Text>
          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.buttonConfirm,
                { backgroundColor: COLORS.accent, borderColor: COLORS.neutral },
              ]}
              onPress={onConfirm}
            >
              <Text style={[styles.textStyle, { color: COLORS.primary }]}>
                Confirmar
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                {
                  backgroundColor: COLORS.neutral,
                  borderColor: COLORS.accent,
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: COLORS.text }]}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    borderWidth: 1,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  buttonConfirm: {
    backgroundColor: "red",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
  },
});

export default ConfirmDeleteModal;
