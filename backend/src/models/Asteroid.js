import mongoose from "mongoose";

const asteroidSchema = new mongoose.Schema(
  {
    neo_reference_id: {
      type: String,
      required: true,
      unique: true,
      set: (v) => String(v), // Auto-convert number IDs from NASA to String
    },
    name: { type: String, required: true },
    is_potentially_hazardous_asteroid: { type: Boolean, default: false },
    estimated_diameter: {
      meters: {
        estimated_diameter_min: Number,
        estimated_diameter_max: Number,
      },
    },
    close_approach_data: [
      {
        close_approach_date: String,
        relative_velocity: {
          kilometers_per_hour: Number,
        },
        miss_distance: {
          kilometers: Number,
        },
      },
    ],
    orbital_data: {
      orbit_class: String,
      eccentricity: Number,
      inclination: Number,
    },
    first_observation_date: String,
    last_observation_date: String,
    cached_at: { type: Date, default: Date.now },
    cached_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Asteroid", asteroidSchema);
