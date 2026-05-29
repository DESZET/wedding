import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";

// Get all religious bookings
export const getReligiousBookings: RequestHandler = async (req, res) => {
  try {
    const bookings = await dbAll("SELECT * FROM religious_bookings ORDER BY createdAt DESC");
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching religious bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch religious bookings' });
  }
};

// Get single religious booking
export const getReligiousBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await dbGet("SELECT * FROM religious_bookings WHERE id = ?", [id]);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Religious booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching religious booking:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch religious booking' });
  }
};

// Create religious booking
export const createReligiousBooking: RequestHandler = async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, package_type, package_id, package_name, departure_date, number_of_travelers, total_price, status, notes } = req.body;

    const result = await dbRun(
      "INSERT INTO religious_bookings (customer_name, customer_email, customer_phone, package_type, package_id, package_name, departure_date, number_of_travelers, total_price, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [customer_name, customer_email, customer_phone, package_type, package_id, package_name, departure_date, number_of_travelers, total_price, status || 'pending', notes || '']
    );

    const newBooking = await dbGet("SELECT * FROM religious_bookings WHERE id = ?", [result.lastID]);
    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    console.error('Error creating religious booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create religious booking' });
  }
};

// Update religious booking
export const updateReligiousBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    await dbRun(
      "UPDATE religious_bookings SET status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, notes || '', id]
    );

    const updatedBooking = await dbGet("SELECT * FROM religious_bookings WHERE id = ?", [id]);
    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Error updating religious booking:', error);
    res.status(500).json({ success: false, error: 'Failed to update religious booking' });
  }
};

// Delete religious booking
export const deleteReligiousBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun("DELETE FROM religious_bookings WHERE id = ?", [id]);
    res.json({ success: true, message: 'Religious booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting religious booking:', error);
    res.status(500).json({ success: false, error: 'Failed to delete religious booking' });
  }
};

