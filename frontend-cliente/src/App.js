import React from "react";
import FazerPedido from "./components/FazerPedido";
import ListaPedidos from "./components/ListaPedidos";

function App() {
  return (
    <div className="App">
      <h1>Café App - Cliente</h1>
      <FazerPedido />
      <ListaPedidos />
    </div>
  );
}

export default App;
