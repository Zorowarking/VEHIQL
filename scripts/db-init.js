const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Manually load .env file if present
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      // Remove surrounding quotes if any
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = value.trim();
      }
    }
  });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is not defined in process.env or .env file.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
    ? false
    : { rejectUnauthorized: false },
});

const schema = `
  -- Users Table
  CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- 'admin', 'seller', 'buyer'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Companies Table (for verified showrooms / sellers)
  CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(255) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    logo VARCHAR(255),
    registration_number VARCHAR(100),
    description TEXT,
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Vehicles Table
  CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    body VARCHAR(100) NOT NULL,
    transmission VARCHAR(100) NOT NULL,
    fuel VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    seats INTEGER NOT NULL,
    image VARCHAR(255),
    features TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    rating NUMERIC(3, 2) DEFAULT 5.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Favorites (Saved Cars) Table
  CREATE TABLE IF NOT EXISTS favorites (
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, vehicle_id)
  );

  -- Inquiries / Reservations Table
  CREATE TABLE IF NOT EXISTS inquiries (
    id SERIAL PRIMARY KEY,
    buyer_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    message TEXT,
    start_date DATE,
    end_date DATE,
    total_days INTEGER,
    total_price NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const INITIAL_CARS = [
  {
    name: "BMW M4 Convertible",
    make: "BMW",
    body: "convertible",
    price: 199,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 4,
    rating: 4.9,
    image: "/2.webp",
    features: ["Leather Seats", "Apple CarPlay", "Convertible Soft Top", "Heated Seats", "3.0L Twin-Turbo I6", "Navigation System", "Backup Camera"]
  },
  {
    name: "Ford Mustang GT",
    make: "Ford",
    body: "convertible",
    price: 179,
    transmission: "Manual",
    fuel: "Petrol",
    seats: 4,
    rating: 4.8,
    image: "/3.jpg",
    features: ["V8 Engine", "Sport Mode", "Rear View Camera", "Bluetooth", "Premium Sound System", "Keyless Entry", "Ventilated Seats"]
  },
  {
    name: "Hyundai Creta",
    make: "Hyundai",
    body: "suv",
    price: 89,
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 5,
    rating: 4.6,
    image: "/1.png",
    features: ["Panoramic Sunroof", "Ventilated Seats", "ADAS Safety", "Wireless Charger", "Bose Audio", "Air Purifier", "Ambient Lighting"]
  },
  {
    name: "Mahindra Thar",
    make: "Mahindra",
    body: "suv",
    price: 95,
    transmission: "Manual",
    fuel: "Diesel",
    seats: 4,
    rating: 4.7,
    image: "/1.png",
    features: ["4x4 Drive", "Convertible Hard Top", "Touchscreen Infotainment", "Off-road Suspension", "Hill Hold Control", "Washable Interiors", "Roll Cage"]
  },
  {
    name: "Tata Nexon EV",
    make: "Tata",
    body: "suv",
    price: 79,
    transmission: "Automatic",
    fuel: "Electric",
    seats: 5,
    rating: 4.5,
    image: "/1.png",
    features: ["Zero Emissions", "Fast Charging", "Regenerative Braking", "Connected Car Tech", "Harman Sound", "Multi Drive Modes", "Smart Watch Connectivity"]
  },
  {
    name: "Honda Civic",
    make: "Honda",
    body: "sedan",
    price: 69,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    rating: 4.6,
    image: "/2.webp",
    features: ["Lane Watch", "Adaptive Cruise Control", "Dual Zone AC", "Touchscreen Display", "Fuel Efficient", "Push Button Start", "Sunroof"]
  },
  {
    name: "BMW 3 Series Gran Limousine",
    make: "BMW",
    body: "sedan",
    price: 149,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    rating: 4.8,
    image: "/3.jpg",
    features: ["Ambient Lighting", "Panoramic Glass Roof", "Live Cockpit Professional", "Harman Kardon", "Active Parking Assist", "Three-zone Climate Control", "Gesture Control"]
  },
  {
    name: "Hyundai i20 N Line",
    make: "Hyundai",
    body: "hatchback",
    price: 59,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    rating: 4.4,
    image: "/2.webp",
    features: ["Sporty Exhaust", "Paddle Shifters", "Red Calipers", "Electric Sunroof", "Cornering Lamps", "Dark Metal Finish Alloys", "Blue Link Connected Tech"]
  },
  {
    name: "Tata Altroz",
    make: "Tata",
    body: "hatchback",
    price: 49,
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    rating: 4.3,
    image: "/1.png",
    features: ["5-Star Safety Rating", "90-Degree Doors", "Idle Start-Stop", "Drive Modes", "Premium Cabin", "Ambient Lighting", "iRA Connected Car Suite"]
  },
  {
    name: "Ford Explorer Hybrid",
    make: "Ford",
    body: "suv",
    price: 129,
    transmission: "Automatic",
    fuel: "Hybrid",
    seats: 7,
    rating: 4.7,
    image: "/3.jpg",
    features: ["Three-Row Seating", "Terrain Management System", "Ford Co-Pilot360", "Heated Steering Wheel", "Power Liftgate", "Tri-zone Auto Climate", "Blind Spot Monitor"]
  },
  {
    name: "Honda City",
    make: "Honda",
    body: "sedan",
    price: 65,
    transmission: "Manual",
    fuel: "Petrol",
    seats: 5,
    rating: 4.5,
    image: "/2.webp",
    features: ["Honda Sensing ADAS", "Alexa Connectivity", "Sunroof", "Spacious Boot", "Digipad Touchscreen", "Leatherette Upholstery", "Rear AC Vents"]
  },
  {
    name: "Mahindra XUV700",
    make: "Mahindra",
    body: "suv",
    price: 119,
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 7,
    rating: 4.8,
    image: "/1.png",
    features: ["Skyroof", "Dual HD Screens", "Smart Door Handles", "AdrenoX Connect", "Advanced AWD", "Autonomous Emergency Braking", "360-degree Camera"]
  }
];

async function init() {
  const client = await pool.connect();
  try {
    console.log("Connected to PostgreSQL database. Running migrations...");
    await client.query("BEGIN");

    // Execute schema
    await client.query(schema);
    console.log("Tables created successfully or already exist.");

    // Check if vehicles table is empty
    const checkVehicles = await client.query("SELECT COUNT(*) FROM vehicles");
    const count = parseInt(checkVehicles.rows[0].count, 10);
    
    if (count === 0) {
      console.log("Seeding initial vehicle listings...");
      for (const car of INITIAL_CARS) {
        await client.query(
          `INSERT INTO vehicles (make, name, body, transmission, fuel, price, seats, image, features, status, rating) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            car.make,
            car.name,
            car.body,
            car.transmission,
            car.fuel,
            car.price,
            car.seats,
            car.image,
            car.features,
            'approved',
            car.rating
          ]
        );
      }
      console.log("Seeding completed successfully.");
    } else {
      console.log(`Vehicles table already has ${count} records. Skipping seed.`);
    }

    await client.query("COMMIT");
    console.log("Database initialized successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
