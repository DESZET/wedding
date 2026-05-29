import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";

interface UmrahPackage {
  id: number;
  name: string;
  description: string;
  package_type: 'umrah' | 'haji'; // New field to distinguish between umrah and haji
  duration: number;
  price: number;
  discount_price?: number;
  departure_city: string;
  airline: string;
  airline_logo: string;
  hotel_mekah: string;
  hotel_madinah: string;
  hotel_rating: number;
  distance_haram: string;
  meals_included: boolean;
  tour_guide: boolean;
  visa_assistance: boolean;
  vaccination_assistance: boolean;
  transport_type: string;
  group_size: number;
  availability: number;
  rating: number;
  reviews_count: number;
  included_features: string[];
  excluded_features: string[];
  itinerary: { day: number; title: string; description: string; icon: string }[];
  important_notes: string[];
  departure_dates: { date: string; seats: number; price_variation: number }[];
  images: string[];
  featured: boolean;
  best_seller: boolean;
  early_bird_discount: boolean;
  payment_plans: { name: string; installments: number }[];
  tags: string[];
  // Haji-specific fields
  quota_year: string;
  payment_terms: string[];
  requirements: string[];
  timeline: { month: string; activities: string[] }[];
  registration_deadline: string;
  available_quota: number;
  training_sessions: number;
  medical_facility: boolean;
  accommodation_details: {
    mekah: { hotel: string; nights: number; distance: string };
    madinah: { hotel: string; nights: number; distance: string };
    jeddah?: { hotel: string; nights: number };
  };
  createdAt: string;
  updatedAt: string;
}

// Get all umrah packages
export const getUmrahPackages: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM umrah_packages ORDER BY createdAt DESC");

    // Parse JSON fields
    const parsedItems = items.map((item: any) => ({
      ...item,
      // Handle package_type - default to 'umrah' for old records
      package_type: item.package_type || 'umrah',
      included_features: item.included_features ? JSON.parse(item.included_features) : [],
      excluded_features: item.excluded_features ? JSON.parse(item.excluded_features) : [],
      itinerary: item.itinerary ? JSON.parse(item.itinerary) : [],
      important_notes: item.important_notes ? JSON.parse(item.important_notes) : [],
      departure_dates: item.departure_dates ? JSON.parse(item.departure_dates) : [],
      images: item.images ? JSON.parse(item.images) : [],
      payment_plans: item.payment_plans ? JSON.parse(item.payment_plans) : [],
      tags: item.tags ? JSON.parse(item.tags) : [],
      // Haji fields
      payment_terms: item.payment_terms ? JSON.parse(item.payment_terms) : [],
      requirements: item.requirements ? JSON.parse(item.requirements) : [],
      timeline: item.timeline ? JSON.parse(item.timeline) : [],
      accommodation_details: item.accommodation_details ? JSON.parse(item.accommodation_details) : {},
      meals_included: Boolean(item.meals_included),
      tour_guide: Boolean(item.tour_guide),
      visa_assistance: Boolean(item.visa_assistance),
      vaccination_assistance: Boolean(item.vaccination_assistance),
      featured: Boolean(item.featured),
      best_seller: Boolean(item.best_seller),
      early_bird_discount: Boolean(item.early_bird_discount),
      medical_facility: Boolean(item.medical_facility)
    }));

    const response: ListResponse<UmrahPackage> = {
      success: true,
      data: parsedItems,
      total: parsedItems.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching umrah packages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch umrah packages' });
  }
};

// Get single umrah package
export const getUmrahPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM umrah_packages WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Umrah package not found' });
    }

    // Parse JSON fields
    const parsedItem = {
      ...item,
      package_type: item.package_type || 'umrah',
      included_features: item.included_features ? JSON.parse(item.included_features) : [],
      excluded_features: item.excluded_features ? JSON.parse(item.excluded_features) : [],
      itinerary: item.itinerary ? JSON.parse(item.itinerary) : [],
      important_notes: item.important_notes ? JSON.parse(item.important_notes) : [],
      departure_dates: item.departure_dates ? JSON.parse(item.departure_dates) : [],
      images: item.images ? JSON.parse(item.images) : [],
      payment_plans: item.payment_plans ? JSON.parse(item.payment_plans) : [],
      tags: item.tags ? JSON.parse(item.tags) : [],
      payment_terms: item.payment_terms ? JSON.parse(item.payment_terms) : [],
      requirements: item.requirements ? JSON.parse(item.requirements) : [],
      timeline: item.timeline ? JSON.parse(item.timeline) : [],
      accommodation_details: item.accommodation_details ? JSON.parse(item.accommodation_details) : {},
      meals_included: Boolean(item.meals_included),
      tour_guide: Boolean(item.tour_guide),
      visa_assistance: Boolean(item.visa_assistance),
      vaccination_assistance: Boolean(item.vaccination_assistance),
      featured: Boolean(item.featured),
      best_seller: Boolean(item.best_seller),
      early_bird_discount: Boolean(item.early_bird_discount),
      medical_facility: Boolean(item.medical_facility)
    };

    const response: ApiResponse<UmrahPackage> = {
      success: true,
      data: parsedItem
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching umrah package:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch umrah package' });
  }
};

// Create umrah package
export const createUmrahPackage: RequestHandler = async (req, res) => {
  try {
    const packageData: Partial<UmrahPackage> = req.body;

    if (!packageData.name || !packageData.price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const result = await dbRun(
      `INSERT INTO umrah_packages (
        name, description, package_type, duration, price, discount_price, departure_city, airline, airline_logo,
        hotel_mekah, hotel_madinah, hotel_rating, distance_haram, meals_included, tour_guide,
        visa_assistance, vaccination_assistance, transport_type, group_size, availability,
        rating, reviews_count, included_features, excluded_features, itinerary, important_notes,
        departure_dates, images, featured, best_seller, early_bird_discount, payment_plans, tags,
        quota_year, payment_terms, requirements, timeline, registration_deadline,
        available_quota, training_sessions, medical_facility, accommodation_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageData.name,
        packageData.description || '',
        packageData.package_type || 'umrah',
        packageData.duration || 0,
        packageData.price,
        packageData.discount_price || null,
        packageData.departure_city || '',
        packageData.airline || '',
        packageData.airline_logo || '',
        packageData.hotel_mekah || '',
        packageData.hotel_madinah || '',
        packageData.hotel_rating || 0,
        packageData.distance_haram || '',
        packageData.meals_included ? 1 : 0,
        packageData.tour_guide ? 1 : 0,
        packageData.visa_assistance ? 1 : 0,
        packageData.vaccination_assistance ? 1 : 0,
        packageData.transport_type || '',
        packageData.group_size || 0,
        packageData.availability || 0,
        packageData.rating || 0,
        packageData.reviews_count || 0,
        JSON.stringify(packageData.included_features || []),
        JSON.stringify(packageData.excluded_features || []),
        JSON.stringify(packageData.itinerary || []),
        JSON.stringify(packageData.important_notes || []),
        JSON.stringify(packageData.departure_dates || []),
        JSON.stringify(packageData.images || []),
        packageData.featured ? 1 : 0,
        packageData.best_seller ? 1 : 0,
        packageData.early_bird_discount ? 1 : 0,
        JSON.stringify(packageData.payment_plans || []),
        JSON.stringify(packageData.tags || []),
        // Haji fields
        packageData.quota_year || '',
        JSON.stringify(packageData.payment_terms || []),
        JSON.stringify(packageData.requirements || []),
        JSON.stringify(packageData.timeline || []),
        packageData.registration_deadline || '',
        packageData.available_quota || 0,
        packageData.training_sessions || 0,
        packageData.medical_facility ? 1 : 0,
        JSON.stringify(packageData.accommodation_details || {})
      ]
    );

    const newItem = await dbGet("SELECT * FROM umrah_packages WHERE id = ?", [result.lastID]);

    // Parse JSON fields for response
    const parsedNewItem = {
      ...newItem,
      package_type: newItem.package_type || 'umrah',
      included_features: newItem.included_features ? JSON.parse(newItem.included_features) : [],
      excluded_features: newItem.excluded_features ? JSON.parse(newItem.excluded_features) : [],
      itinerary: newItem.itinerary ? JSON.parse(newItem.itinerary) : [],
      important_notes: newItem.important_notes ? JSON.parse(newItem.important_notes) : [],
      departure_dates: newItem.departure_dates ? JSON.parse(newItem.departure_dates) : [],
      images: newItem.images ? JSON.parse(newItem.images) : [],
      payment_plans: newItem.payment_plans ? JSON.parse(newItem.payment_plans) : [],
      tags: newItem.tags ? JSON.parse(newItem.tags) : [],
      payment_terms: newItem.payment_terms ? JSON.parse(newItem.payment_terms) : [],
      requirements: newItem.requirements ? JSON.parse(newItem.requirements) : [],
      timeline: newItem.timeline ? JSON.parse(newItem.timeline) : [],
      accommodation_details: newItem.accommodation_details ? JSON.parse(newItem.accommodation_details) : {},
      meals_included: Boolean(newItem.meals_included),
      tour_guide: Boolean(newItem.tour_guide),
      visa_assistance: Boolean(newItem.visa_assistance),
      vaccination_assistance: Boolean(newItem.vaccination_assistance),
      featured: Boolean(newItem.featured),
      best_seller: Boolean(newItem.best_seller),
      early_bird_discount: Boolean(newItem.early_bird_discount),
      medical_facility: Boolean(newItem.medical_facility)
    };

    const response: ApiResponse<UmrahPackage> = {
      success: true,
      data: parsedNewItem,
      message: 'Package created successfully'
    };
    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating package:', error);
    const errorMessage = error?.message || 'Failed to create package';
    res.status(500).json({ 
      success: false, 
      error: `Failed to create package: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update umrah package
export const updateUmrahPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Partial<UmrahPackage> = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM umrah_packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Umrah package not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.name !== undefined) {
      updateFields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push("description = ?");
      values.push(updates.description);
    }
    if (updates.package_type !== undefined) {
      updateFields.push("package_type = ?");
      values.push(updates.package_type);
    }
    if (updates.duration !== undefined) {
      updateFields.push("duration = ?");
      values.push(updates.duration);
    }
    if (updates.price !== undefined) {
      updateFields.push("price = ?");
      values.push(updates.price);
    }
    if (updates.discount_price !== undefined) {
      updateFields.push("discount_price = ?");
      values.push(updates.discount_price);
    }
    if (updates.departure_city !== undefined) {
      updateFields.push("departure_city = ?");
      values.push(updates.departure_city);
    }
    if (updates.airline !== undefined) {
      updateFields.push("airline = ?");
      values.push(updates.airline);
    }
    if (updates.airline_logo !== undefined) {
      updateFields.push("airline_logo = ?");
      values.push(updates.airline_logo);
    }
    if (updates.hotel_mekah !== undefined) {
      updateFields.push("hotel_mekah = ?");
      values.push(updates.hotel_mekah);
    }
    if (updates.hotel_madinah !== undefined) {
      updateFields.push("hotel_madinah = ?");
      values.push(updates.hotel_madinah);
    }
    if (updates.hotel_rating !== undefined) {
      updateFields.push("hotel_rating = ?");
      values.push(updates.hotel_rating);
    }
    if (updates.distance_haram !== undefined) {
      updateFields.push("distance_haram = ?");
      values.push(updates.distance_haram);
    }
    if (updates.meals_included !== undefined) {
      updateFields.push("meals_included = ?");
      values.push(updates.meals_included ? 1 : 0);
    }
    if (updates.tour_guide !== undefined) {
      updateFields.push("tour_guide = ?");
      values.push(updates.tour_guide ? 1 : 0);
    }
    if (updates.visa_assistance !== undefined) {
      updateFields.push("visa_assistance = ?");
      values.push(updates.visa_assistance ? 1 : 0);
    }
    if (updates.vaccination_assistance !== undefined) {
      updateFields.push("vaccination_assistance = ?");
      values.push(updates.vaccination_assistance ? 1 : 0);
    }
    if (updates.transport_type !== undefined) {
      updateFields.push("transport_type = ?");
      values.push(updates.transport_type);
    }
    if (updates.group_size !== undefined) {
      updateFields.push("group_size = ?");
      values.push(updates.group_size);
    }
    if (updates.availability !== undefined) {
      updateFields.push("availability = ?");
      values.push(updates.availability);
    }
    if (updates.rating !== undefined) {
      updateFields.push("rating = ?");
      values.push(updates.rating);
    }
    if (updates.reviews_count !== undefined) {
      updateFields.push("reviews_count = ?");
      values.push(updates.reviews_count);
    }
    if (updates.included_features !== undefined) {
      updateFields.push("included_features = ?");
      values.push(JSON.stringify(updates.included_features));
    }
    if (updates.excluded_features !== undefined) {
      updateFields.push("excluded_features = ?");
      values.push(JSON.stringify(updates.excluded_features));
    }
    if (updates.itinerary !== undefined) {
      updateFields.push("itinerary = ?");
      values.push(JSON.stringify(updates.itinerary));
    }
    if (updates.important_notes !== undefined) {
      updateFields.push("important_notes = ?");
      values.push(JSON.stringify(updates.important_notes));
    }
    if (updates.departure_dates !== undefined) {
      updateFields.push("departure_dates = ?");
      values.push(JSON.stringify(updates.departure_dates));
    }
    if (updates.images !== undefined) {
      updateFields.push("images = ?");
      values.push(JSON.stringify(updates.images));
    }
    if (updates.featured !== undefined) {
      updateFields.push("featured = ?");
      values.push(updates.featured ? 1 : 0);
    }
    if (updates.best_seller !== undefined) {
      updateFields.push("best_seller = ?");
      values.push(updates.best_seller ? 1 : 0);
    }
    if (updates.early_bird_discount !== undefined) {
      updateFields.push("early_bird_discount = ?");
      values.push(updates.early_bird_discount ? 1 : 0);
    }
    if (updates.payment_plans !== undefined) {
      updateFields.push("payment_plans = ?");
      values.push(JSON.stringify(updates.payment_plans));
    }
    if (updates.tags !== undefined) {
      updateFields.push("tags = ?");
      values.push(JSON.stringify(updates.tags));
    }
    // Haji-specific fields
    if (updates.quota_year !== undefined) {
      updateFields.push("quota_year = ?");
      values.push(updates.quota_year);
    }
    if (updates.payment_terms !== undefined) {
      updateFields.push("payment_terms = ?");
      values.push(JSON.stringify(updates.payment_terms));
    }
    if (updates.requirements !== undefined) {
      updateFields.push("requirements = ?");
      values.push(JSON.stringify(updates.requirements));
    }
    if (updates.timeline !== undefined) {
      updateFields.push("timeline = ?");
      values.push(JSON.stringify(updates.timeline));
    }
    if (updates.registration_deadline !== undefined) {
      updateFields.push("registration_deadline = ?");
      values.push(updates.registration_deadline);
    }
    if (updates.available_quota !== undefined) {
      updateFields.push("available_quota = ?");
      values.push(updates.available_quota);
    }
    if (updates.training_sessions !== undefined) {
      updateFields.push("training_sessions = ?");
      values.push(updates.training_sessions);
    }
    if (updates.medical_facility !== undefined) {
      updateFields.push("medical_facility = ?");
      values.push(updates.medical_facility ? 1 : 0);
    }
    if (updates.accommodation_details !== undefined) {
      updateFields.push("accommodation_details = ?");
      values.push(JSON.stringify(updates.accommodation_details));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE umrah_packages SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM umrah_packages WHERE id = ?", [id]);

    const response: ApiResponse<UmrahPackage> = {
      success: true,
      data: updatedItem,
      message: 'Umrah package updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating umrah package:', error);
    res.status(500).json({ success: false, error: 'Failed to update umrah package' });
  }
};

// Delete umrah package
export const deleteUmrahPackage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM umrah_packages WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Umrah package not found' });
    }

    await dbRun("DELETE FROM umrah_packages WHERE id = ?", [id]);

    res.json({ success: true, message: 'Umrah package deleted successfully' });
  } catch (error) {
    console.error('Error deleting umrah package:', error);
    res.status(500).json({ success: false, error: 'Failed to delete umrah package' });
  }
};
