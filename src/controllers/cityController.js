const City = require('../models/City');

// Get all active cities
const getCities = async (req, res) => {
  try {
    const cities = await City.getAllActive();
    res.json({ success: true, data: cities });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

// Get businesses for a specific city
const getCityBusinesses = async (req, res) => {
  try {
    const { cityId } = req.params;
    
    if (isNaN(cityId)) {
      return res.status(400).json({ success: false, message: 'Invalid city ID' });
    }
    
    const businesses = await City.getBusinessesByCity(cityId);
    res.json({ success: true, data: businesses });
  } catch (error) {
    console.error('Get businesses by city error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch businesses' });
  }
};

// Admin: Create a new city
const createCity = async (req, res) => {
  try {
    const { name, state } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'City name is required' });
    }
    
    const newCity = await City.create(name, state);
    res.status(201).json({ success: true, message: 'City added successfully', data: newCity });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ success: false, message: 'Failed to create city' });
  }
};

// Admin: Deactivate a city
const deactivateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.toggleStatus(id, false);
    
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }
    
    res.json({ success: true, message: 'City deactivated successfully' });
  } catch (error) {
    console.error('Deactivate city error:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate city' });
  }
};

module.exports = {
  getCities,
  getCityBusinesses,
  createCity,
  deactivateCity
};