const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// DB config
const pool = new Pool({
    user: "postgres",
    password: "Fardin@15@16",
    host: "localhost",
    port: 5432,
    database: "hospital"
});

// Sample API: Get all doctors
app.get("/api/doctors", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM doctors");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(5000, () => {
    console.log("✅ Server running on http://localhost:5000");
});
