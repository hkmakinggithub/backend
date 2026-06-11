const Admin = require('../models/Admin');
const User = require('../models/User'); // Re-using for the single user fetch
const City = require('../models/City'); // Re-using for basic city CRUD
const Category = require('../models/Category'); 

// --- DASHBOARD ---
const getDashboard = async (req, res) => {
  try {
    const stats = await Admin.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDashboardByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    if (!cityId || isNaN(cityId)) return res.status(400).json({ error: 'Invalid city ID' });
    
    const stats = await Admin.getDashboardStatsByCity(cityId);
    if (!stats) return res.status(404).json({ error: 'City not found' });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- USERS ---
const getUsers = async (req, res) => {
  try {
    const users = await Admin.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsersByCity = async (req, res) => {
  try {
    const users = await Admin.getUsersByCity(req.params.cityId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user }); // Wrapped for your React Modal Drawer
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    await Admin.updateUserRole(req.params.id, req.body.role);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.hardDelete(req.params.id); // Using the method we added earlier
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- CITIES & CATEGORIES ---
const getCities = async (req, res) => {
  try {
    const cities = await City.getAllActive();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCity = async (req, res) => {
  try {
    const { name, state } = req.body;
    const newCity = await City.create(name, state);
    res.status(201).json(newCity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCity = async (req, res) => {
  try {
    // Requires a raw query since we didn't add hard updates to City.js previously
    const { query } = require('../config/database');
    await query('UPDATE cities SET name = $1, state = $2 WHERE id = $3', [req.body.name, req.body.state, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { query } = require('../config/database');
    await query('DELETE FROM cities WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- BUSINESSES ---
const getBusinesses = async (req, res) => {
  try {
    const businesses = await Admin.getAllBusinesses();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBusinessesByCity = async (req, res) => {
  try {
    const businesses = await Admin.getBusinessesByCity(req.params.cityId);
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingBusinesses = async (req, res) => {
  try {
    const businesses = await Admin.getPendingBusinesses();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingBusinessesByCity = async (req, res) => {
  try {
    const businesses = await Admin.getPendingBusinessesByCity(req.params.cityId);
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addBusiness = async (req, res) => {
  try {
    if (!req.body.title || !req.body.address || !req.body.phone || !req.body.city_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const business = await Admin.directAddBusiness(req.body);
    res.status(201).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBusiness = async (req, res) => {
  try {
    await Admin.hardDeleteBusiness(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- REVIEWS & UTILS ---
const getReviews = async (req, res) => {
  try {
    const reviews = await Admin.getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewsByCity = async (req, res) => {
  try {
    const reviews = await Admin.getReviewsByCity(req.params.cityId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { query } = require('../config/database');
    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFormData = async (req, res) => {
  try {
    const data = await Admin.getFormData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard, getDashboardByCity, getUsers, getUsersByCity, getUserById, updateUserRole, deleteUser,
  getCities, createCity, updateCity, deleteCity,
  getBusinesses, getBusinessesByCity, getPendingBusinesses, getPendingBusinessesByCity, addBusiness, deleteBusiness,
  getReviews, getReviewsByCity, deleteReview, getFormData
};