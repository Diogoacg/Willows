// useSocket.js

import { useEffect } from "react";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  criarNovoItem,
  obterItensDoInventario,
  atualizarItemNoInventario,
  deletarItemDoInventario,
} from "../api/apiInventory";

const socket = io("https://willows-production.up.railway.app");

const useSocket = (setPedidos) => {
  useEffect(() => {
    const setupSocketListeners = async () => {
      const token = await AsyncStorage.getItem("token");

      socket.on("connect", () => {
        console.log("Conectado ao servidor Socket.IO");
      });

      socket.on("atualizarItens", async (data) => {
        const { message, item, itemId } = data;

        // Verificar o tipo de ação recebida e atualizar o estado local
        if (message === "Novo item adicionado ao inventário") {
          // Lógica para adicionar um novo item ao inventário
          setPedidos((prevPedidos) => [...prevPedidos, item]);
        } else if (message === "Item atualizado no inventário") {
          // Lógica para atualizar um item existente, se necessário
          setPedidos((prevPedidos) =>
            prevPedidos.map((pedido) =>
              pedido.id === item.id ? { ...pedido, ...item } : pedido
            )
          );
        } else if (message === "Item removido do inventário") {
          // Lógica para remover um item do inventário
          setPedidos((prevPedidos) =>
            prevPedidos.filter((pedido) => pedido.id !== itemId)
          );
        } else {
          // Lógica de fallback, se necessário
          setPedidos((prevPedidos) => prevPedidos);
        }
      });

      socket.on("disconnect", () => {
        console.log("Desconectado do servidor Socket.IO");
      });
    };

    setupSocketListeners();

    return () => {
      socket.disconnect();
    };
  }, [setPedidos]);
};

export default useSocket;
