"use server";

import { query } from "./db";

// Helper to check if DB is configured
async function isDbReady() {
  return !!process.env.DATABASE_URL;
}

// ==========================================
// USER & ROLE MANAGEMENT
// ==========================================

export async function getUserProfile(userId) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query("SELECT * FROM users WHERE id = $1", [userId]);
    return res.rows[0] || null;
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return null;
  }
}

export async function createUserProfile(userId, email, name, role) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query(
      `INSERT INTO users (id, email, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE 
       SET email = EXCLUDED.email, name = COALESCE(users.name, EXCLUDED.name), role = COALESCE(users.role, EXCLUDED.role)
       RETURNING *`,
      [userId, email, name, role]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in createUserProfile:", err);
    throw err;
  }
}

export async function updateUserRole(userId, newRole) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
      [newRole, userId]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in updateUserRole:", err);
    throw err;
  }
}

export async function updateUserStatus(userId, status) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING *",
      [status, userId]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in updateUserStatus:", err);
    throw err;
  }
}

export async function getAllUsers() {
  if (!(await isDbReady())) return [];
  try {
    const res = await query("SELECT * FROM users ORDER BY created_at DESC");
    return res.rows;
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    return [];
  }
}

// ==========================================
// COMPANY & SELLER PROFILE MANAGEMENT
// ==========================================

export async function getSellerCompany(sellerId) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query("SELECT * FROM companies WHERE seller_id = $1", [sellerId]);
    return res.rows[0] || null;
  } catch (err) {
    console.error("Error in getSellerCompany:", err);
    return null;
  }
}

export async function createOrUpdateCompany(sellerId, companyData) {
  if (!(await isDbReady())) return null;
  const { company_name, logo, registration_number, description, phone, address } = companyData;
  try {
    const res = await query(
      `INSERT INTO companies (seller_id, company_name, logo, registration_number, description, phone, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       ON CONFLICT (seller_id) DO UPDATE 
       SET company_name = EXCLUDED.company_name,
           logo = COALESCE(EXCLUDED.logo, companies.logo),
           registration_number = EXCLUDED.registration_number,
           description = EXCLUDED.description,
           phone = EXCLUDED.phone,
           address = EXCLUDED.address,
           status = 'pending' -- reset to pending on updates for safety/moderation
       RETURNING *`,
      [sellerId, company_name, logo || "/make/bmw.webp", registration_number, description, phone, address]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in createOrUpdateCompany:", err);
    throw err;
  }
}

export async function getPendingCompanies() {
  if (!(await isDbReady())) return [];
  try {
    const res = await query(
      `SELECT c.*, u.email as seller_email, u.name as seller_name 
       FROM companies c 
       JOIN users u ON c.seller_id = u.id 
       WHERE c.status = 'pending' 
       ORDER BY c.created_at ASC`
    );
    return res.rows;
  } catch (err) {
    console.error("Error in getPendingCompanies:", err);
    return [];
  }
}

export async function updateCompanyStatus(companyId, status) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query(
      "UPDATE companies SET status = $1 WHERE id = $2 RETURNING *",
      [status, companyId]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in updateCompanyStatus:", err);
    throw err;
  }
}

// ==========================================
// VEHICLE LISTINGS MANAGEMENT
// ==========================================

export async function getVehicles(filters = {}) {
  if (!(await isDbReady())) return [];
  try {
    let queryText = `
      SELECT v.*, c.company_name, c.status as company_status, c.logo as company_logo
      FROM vehicles v
      LEFT JOIN companies c ON v.seller_id = c.seller_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      queryText += ` AND v.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    } else {
      queryText += ` AND v.status = 'approved'`;
    }

    if (filters.make) {
      queryText += ` AND LOWER(v.make) = LOWER($${paramIndex})`;
      params.push(filters.make);
      paramIndex++;
    }

    if (filters.body) {
      queryText += ` AND LOWER(v.body) = LOWER($${paramIndex})`;
      params.push(filters.body);
      paramIndex++;
    }

    if (filters.search) {
      queryText += ` AND (LOWER(v.name) LIKE LOWER($${paramIndex}) OR LOWER(v.make) LIKE LOWER($${paramIndex}))`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.seller_id) {
      queryText += ` AND v.seller_id = $${paramIndex}`;
      params.push(filters.seller_id);
      paramIndex++;
    }

    queryText += " ORDER BY v.created_at DESC";

    const res = await query(queryText, params);
    return res.rows.map(row => ({
      ...row,
      price: Number(row.price),
      seats: Number(row.seats),
      rating: Number(row.rating)
    }));
  } catch (err) {
    console.error("Error in getVehicles:", err);
    return [];
  }
}

export async function getVehicleById(id) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query(
      `SELECT v.*, c.company_name, c.status as company_status, c.logo as company_logo, u.email as seller_email, u.name as seller_name
       FROM vehicles v
       LEFT JOIN companies c ON v.seller_id = c.seller_id
       LEFT JOIN users u ON v.seller_id = u.id
       WHERE v.id = $1`,
      [id]
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      ...row,
      price: Number(row.price),
      seats: Number(row.seats),
      rating: Number(row.rating)
    };
  } catch (err) {
    console.error("Error in getVehicleById:", err);
    return null;
  }
}

export async function addVehicle(vehicleData) {
  if (!(await isDbReady())) return null;
  const { seller_id, make, name, body, transmission, fuel, price, seats, image, features, status } = vehicleData;
  try {
    const res = await query(
      `INSERT INTO vehicles (seller_id, make, name, body, transmission, fuel, price, seats, image, features, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        seller_id || null, // null means platform-owned listing
        make,
        name,
        body,
        transmission,
        fuel,
        Number(price),
        Number(seats),
        image || "/1.png",
        features || [],
        status || 'pending'
      ]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in addVehicle:", err);
    throw err;
  }
}

export async function updateVehicle(id, vehicleData) {
  if (!(await isDbReady())) return null;
  const { make, name, body, transmission, fuel, price, seats, image, features, status } = vehicleData;
  try {
    const res = await query(
      `UPDATE vehicles 
       SET make = $1, name = $2, body = $3, transmission = $4, fuel = $5, price = $6, seats = $7, image = $8, features = $9, status = $10
       WHERE id = $11
       RETURNING *`,
      [make, name, body, transmission, fuel, Number(price), Number(seats), image, features, status, id]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in updateVehicle:", err);
    throw err;
  }
}

export async function deleteVehicle(id) {
  if (!(await isDbReady())) return null;
  try {
    await query("DELETE FROM vehicles WHERE id = $1", [id]);
    return true;
  } catch (err) {
    console.error("Error in deleteVehicle:", err);
    throw err;
  }
}

export async function getPendingVehicles() {
  if (!(await isDbReady())) return [];
  try {
    const res = await query(
      `SELECT v.*, c.company_name, u.email as seller_email 
       FROM vehicles v
       LEFT JOIN companies c ON v.seller_id = c.seller_id
       JOIN users u ON v.seller_id = u.id
       WHERE v.status = 'pending'
       ORDER BY v.created_at ASC`
    );
    return res.rows.map(row => ({
      ...row,
      price: Number(row.price),
      seats: Number(row.seats)
    }));
  } catch (err) {
    console.error("Error in getPendingVehicles:", err);
    return [];
  }
}

export async function updateVehicleStatus(vehicleId, status) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query(
      "UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *",
      [status, vehicleId]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in updateVehicleStatus:", err);
    throw err;
  }
}

// ==========================================
// SAVED LISTINGS (FAVORITES)
// ==========================================

export async function getSavedVehicles(userId) {
  if (!(await isDbReady())) return [];
  try {
    const res = await query(
      `SELECT v.*, c.company_name, c.logo as company_logo
       FROM favorites f
       JOIN vehicles v ON f.vehicle_id = v.id
       LEFT JOIN companies c ON v.seller_id = c.seller_id
       WHERE f.user_id = $1
       ORDER BY v.created_at DESC`,
      [userId]
    );
    return res.rows.map(row => ({
      ...row,
      price: Number(row.price),
      seats: Number(row.seats),
      rating: Number(row.rating)
    }));
  } catch (err) {
    console.error("Error in getSavedVehicles:", err);
    return [];
  }
}

export async function isVehicleSaved(userId, vehicleId) {
  if (!(await isDbReady())) return false;
  try {
    const res = await query(
      "SELECT 1 FROM favorites WHERE user_id = $1 AND vehicle_id = $2",
      [userId, vehicleId]
    );
    return res.rowCount > 0;
  } catch (err) {
    console.error("Error in isVehicleSaved:", err);
    return false;
  }
}

export async function toggleSaveVehicle(userId, vehicleId) {
  if (!(await isDbReady())) return false;
  try {
    const saved = await isVehicleSaved(userId, vehicleId);
    if (saved) {
      await query("DELETE FROM favorites WHERE user_id = $1 AND vehicle_id = $2", [userId, vehicleId]);
      return false; // un-saved
    } else {
      await query("INSERT INTO favorites (user_id, vehicle_id) VALUES ($1, $2)", [userId, vehicleId]);
      return true; // saved
    }
  } catch (err) {
    console.error("Error in toggleSaveVehicle:", err);
    throw err;
  }
}

// ==========================================
// RENTAL INQUIRIES & RESERVATIONS
// ==========================================

export async function createInquiry(inquiryData) {
  if (!(await isDbReady())) return null;
  const { buyer_id, vehicle_id, message, start_date, end_date, total_days, total_price } = inquiryData;
  try {
    const res = await query(
      `INSERT INTO inquiries (buyer_id, vehicle_id, message, start_date, end_date, total_days, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [buyer_id, vehicle_id, message, start_date, end_date, total_days, Number(total_price)]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in createInquiry:", err);
    throw err;
  }
}

export async function getInquiries(userId, role) {
  if (!(await isDbReady())) return [];
  try {
    let queryText = "";
    const params = [];

    if (role === "admin") {
      queryText = `
        SELECT i.*, 
               v.name as car_name, v.image as car_image, v.price as car_price,
               b.name as buyer_name, b.email as buyer_email,
               s.name as seller_name, s.email as seller_email,
               c.company_name
        FROM inquiries i
        JOIN vehicles v ON i.vehicle_id = v.id
        JOIN users b ON i.buyer_id = b.id
        LEFT JOIN users s ON v.seller_id = s.id
        LEFT JOIN companies c ON v.seller_id = c.seller_id
        ORDER BY i.created_at DESC
      `;
    } else if (role === "seller") {
      queryText = `
        SELECT i.*, 
               v.name as car_name, v.image as car_image, v.price as car_price,
               b.name as buyer_name, b.email as buyer_email
        FROM inquiries i
        JOIN vehicles v ON i.vehicle_id = v.id
        JOIN users b ON i.buyer_id = b.id
        WHERE v.seller_id = $1
        ORDER BY i.created_at DESC
      `;
      params.push(userId);
    } else {
      // buyer
      queryText = `
        SELECT i.*, 
               v.name as car_name, v.image as car_image, v.price as car_price,
               s.name as seller_name, s.email as seller_email,
               c.company_name
        FROM inquiries i
        JOIN vehicles v ON i.vehicle_id = v.id
        LEFT JOIN users s ON v.seller_id = s.id
        LEFT JOIN companies c ON v.seller_id = c.seller_id
        WHERE i.buyer_id = $1
        ORDER BY i.created_at DESC
      `;
      params.push(userId);
    }

    const res = await query(queryText, params);
    return res.rows.map(row => ({
      ...row,
      total_price: Number(row.total_price),
      car_price: Number(row.car_price)
    }));
  } catch (err) {
    console.error("Error in getInquiries:", err);
    return [];
  }
}

export async function updateInquiryStatus(inquiryId, status) {
  if (!(await isDbReady())) return null;
  try {
    const res = await query(
      "UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *",
      [status, inquiryId]
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error in updateInquiryStatus:", err);
    throw err;
  }
}

// ==========================================
// ANALYTICS & REPORTS
// ==========================================

export async function getAnalytics() {
  if (!(await isDbReady())) {
    return {
      totalListings: 12,
      activeBookings: 0,
      totalRevenue: 0,
      totalUsers: 0,
      totalSellers: 0,
      recentBookings: []
    };
  }
  try {
    const listingsRes = await query("SELECT COUNT(*) FROM vehicles WHERE status = 'approved'");
    const bookingsRes = await query("SELECT COUNT(*) FROM inquiries WHERE status IN ('pending', 'confirmed')");
    const revenueRes = await query("SELECT SUM(total_price) FROM inquiries WHERE status IN ('confirmed', 'completed')");
    const usersRes = await query("SELECT COUNT(*) FROM users");
    const sellersRes = await query("SELECT COUNT(*) FROM users WHERE role = 'seller'");
    
    const recentRes = await query(`
      SELECT i.*, v.name as car_name, b.name as buyer_name, b.email as buyer_email
      FROM inquiries i
      JOIN vehicles v ON i.vehicle_id = v.id
      JOIN users b ON i.buyer_id = b.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    return {
      totalListings: parseInt(listingsRes.rows[0].count, 10),
      activeBookings: parseInt(bookingsRes.rows[0].count, 10),
      totalRevenue: Number(revenueRes.rows[0].sum || 0),
      totalUsers: parseInt(usersRes.rows[0].count, 10),
      totalSellers: parseInt(sellersRes.rows[0].count, 10),
      recentBookings: recentRes.rows.map(row => ({
        ...row,
        total_price: Number(row.total_price)
      }))
    };
  } catch (err) {
    console.error("Error in getAnalytics:", err);
    return {
      totalListings: 0,
      activeBookings: 0,
      totalRevenue: 0,
      totalUsers: 0,
      totalSellers: 0,
      recentBookings: []
    };
  }
}
