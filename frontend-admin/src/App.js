import React from "react";
import GerenciarPedidos from "./components/GerenciarPedidos";
import Estatisticas from "./components/Estatisticas";

function App() {
  return (
    <div className="App">
      <h1>Café App - Administração</h1>
      <GerenciarPedidos />
      <Estatisticas />
    </div>
  );
}

export default App;
