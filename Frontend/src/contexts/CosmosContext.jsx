import React, { createContext, useContext, useState, useCallback } from "react";
import { planets } from "../features/3D/data/celestialData.js";

const CosmosContext = createContext();

export const useCosmos = () => {
  const context = useContext(CosmosContext);
  if (!context) {
    throw new Error("useCosmos must be used within CosmosProvider");
  }
  return context;
};

export const CosmosProvider = ({ children }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [cosmosMode, setCosmosMode] = useState("overview"); // 'overview', 'locked', 'telemetry'

  const selectPlanet = useCallback((planetData) => {
    setSelectedPlanet(planetData);
    setCosmosMode("locked");
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlanet(null);
    setCosmosMode("overview");
  }, []);

  const value = {
    selectedPlanet,
    cosmosMode,
    selectPlanet,
    clearSelection,
    allPlanets: planets,
  };

  return (
    <CosmosContext.Provider value={value}>{children}</CosmosContext.Provider>
  );
};
