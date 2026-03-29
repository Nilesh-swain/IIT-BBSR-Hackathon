import React from "react";
import AppNavigator from "./navigation/AppNavigator";

function App() {
  return (
    /* The bg-[#020308] matches your space theme. 
       overflow-hidden prevents 'bounce' scrolling on high-end monitors.
    */
    <div className="h-screen w-full bg-[#020308] overflow-hidden selection:bg-orange-500/30">
      <AppNavigator />
    </div>
  );
}

export default App;