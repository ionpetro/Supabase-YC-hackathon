const express = require("express");
const cors = require("cors");

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(express.json());

// Add this after creating the express app
app.use(cors());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper function to validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Define routes
app.post("/dialog", async (req, res) => {
  try {
    // Validate required fields
    const { transmitter_id, receiver_id, content } = req.body;
    if (!transmitter_id || !receiver_id || !content) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: transmitter_id, receiver_id, and content are required",
      });
    }

    // Validate UUID format
    if (!isValidUUID(transmitter_id) || !isValidUUID(receiver_id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid UUID format for transmitter_id or receiver_id",
      });
    }

    const dialogData = {
      transmitter_id,
      receiver_id,
      content,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("dialogs").insert([dialogData]);

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/dialog", async (req, res) => {
  try {
    const { transmitter_id, receiver_id } = req.query;
    let query = supabase.from("dialogs").select("*");

    // Validate UUID format if parameters are provided
    if (transmitter_id && receiver_id) {
      if (!isValidUUID(transmitter_id) || !isValidUUID(receiver_id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid UUID format for transmitter_id or receiver_id",
        });
      }

      query = query.or(
        `and(transmitter_id.eq.${transmitter_id},receiver_id.eq.${receiver_id}),and(transmitter_id.eq.${receiver_id},receiver_id.eq.${transmitter_id})`
      );
    }

    // Order by timestamp
    query = query.order("timestamp", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/humans", async (req, res) => {
  try {
    const { data, error } = await supabase.from("humans").select("*");

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
