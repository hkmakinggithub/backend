const Notification = require('../models/Notification');
const { sendExpoPushNotification } = require('../utils/notifications');

// Register push token
const registerPushToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { push_token } = req.body;
    
    await Notification.savePushToken(userId, push_token);
    
    res.json({
      success: true,
      message: 'Push token registered successfully'
    });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register push token'
    });
  }
};

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.getUserNotifications(userId);
    const unreadCount = await Notification.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.markAsRead(notificationId, userId);
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read'
    });
  }
};

// Send notification to user (admin only)
const sendToUser = async (req, res) => {
  try {
    const { user_id, title, body, data } = req.body;
    
    // Save to database
    const notification = await Notification.create(user_id, title, body, 'admin', data);
    
    // Send push notification
    const pushToken = await Notification.getPushToken(user_id);
    if (pushToken) {
      await sendExpoPushNotification(pushToken, title, body, data);
    }
    
    res.json({
      success: true,
      message: 'Notification sent',
      data: notification
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
};

// Send notification to all users (admin only)
const sendToAll = async (req, res) => {
  try {
    const { title, body, data } = req.body;
    
    // Get all push tokens
    const tokens = await Notification.getAllPushTokens();
    
    // Send push notifications to all
    for (const token of tokens) {
      await sendExpoPushNotification(token.token, title, body, data);
      await Notification.create(token.user_id, title, body, 'admin', data);
    }
    
    res.json({
      success: true,
      message: `Notification sent to ${tokens.length} users`
    });
  } catch (error) {
    console.error('Send to all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications'
    });
  }
};

module.exports = {
  registerPushToken,
  getNotifications,
  markAsRead,
  sendToUser,
  sendToAll
};