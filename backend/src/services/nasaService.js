import axios from "axios";
import Asteroid from "../models/Asteroid.js";

const NASA_API_BASE = "https://api.nasa.gov/neo/rest/v1";
const API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

export const fetchAndCacheAsteroids = async (startDate, endDate) => {
  try {
    const url = `${NASA_API_BASE}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;
    const response = await axios.get(url, {
      timeout: 30000,
      family: 4, // 🛡️ Force IPv4 to prevent Alpine/Docker networking hiccups
    });

    const asteroids = [];
    const neos = Object.values(response.data.near_earth_objects).flat();

    for (const neo of neos) {
      const neoId = String(neo.id); // Convert to String for schema
      const existing = await Asteroid.findOne({ neo_reference_id: neoId });
      if (!existing) {
        const asteroid = new Asteroid({
          neo_reference_id: neoId,
          ...neo,
          cached_by: null,
        });
        await asteroid.save();
        asteroids.push(asteroid);
      }
    }

    return asteroids;
  } catch (error) {
    console.error("NASA API Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
    });
    throw error;
  }
};

export const getAsteroidDetails = async (id) => {
  try {
    const url = `${NASA_API_BASE}/neo/${id}?api_key=${API_KEY}`;
    const response = await axios.get(url);

    // Update cache
    await Asteroid.findOneAndUpdate(
      { neo_reference_id: String(id) },
      { ...response.data, cached_at: new Date() },
    );

    return response.data;
  } catch (error) {
    // Fallback to cached data
    return await Asteroid.findOne({ neo_reference_id: String(id) });
  }
};
