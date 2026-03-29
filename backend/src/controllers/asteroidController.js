import Asteroid from "../models/Asteroid.js";
import {
  fetchAndCacheAsteroids,
  getAsteroidDetails,
} from "../services/nasaService.js";

// @desc    Get all asteroids
// @route   GET /api/asteroids
// @access  Public
export const getAsteroids = async (req, res, next) => {
  try {
    const { hazardous = null, limit = 50, page = 1, search = "" } = req.query;

    const query = {};
    if (hazardous !== null)
      query.is_potentially_hazardous_asteroid = hazardous === "true";
    if (search) query.name = { $regex: search, $options: "i" };

    const asteroids = await Asteroid.find(query)
      .sort({ cached_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Asteroid.countDocuments(query);

    res.status(200).json({
      success: true,
      count: asteroids.length,
      total,
      page: parseInt(page),
      asteroids,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asteroid
// @route   GET /api/asteroids/:id
// @access  Public
export const getAsteroid = async (req, res, next) => {
  try {
    const asteroid = await getAsteroidDetails(req.params.id);
    res.status(200).json({
      success: true,
      asteroid,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh asteroid cache
// @route   POST /api/asteroids/refresh
// @access  Private/Admin
export const refreshCache = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const asteroids = await fetchAndCacheAsteroids(startDate, endDate);
    res.status(201).json({
      success: true,
      message: `${asteroids.length} new asteroids cached`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hazardous asteroids
// @route   GET /api/asteroids/hazardous
// @access  Public
export const getHazardous = async (req, res, next) => {
  try {
    const hazardous = await Asteroid.find({
      is_potentially_hazardous_asteroid: true,
    })
      .sort({ cached_at: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      hazardous,
    });
  } catch (error) {
    next(error);
  }
};
