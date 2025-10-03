const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); // ✅ destructure the function
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth);

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// Doctors
router.get('/doctors', adminController.getDoctors);
router.get('/doctors/:doctorId/availability', adminController.getDoctorAvailability);
router.put('/doctors/:doctorId/availability', adminController.updateDoctorAvailability);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Hospital Management
router.get('/hospitals', adminController.getAllHospitals);
router.post('/hospitals', adminController.createHospital);
router.put('/hospitals/:hospitalId', adminController.updateHospital);
router.delete('/hospitals/:hospitalId', adminController.deleteHospital);

// Appointment Management
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:bookingId/status', adminController.updateAppointmentStatus);
router.put('/appointments/:bookingId', adminController.updateAppointment);

// Operations Management
router.get('/operations', adminController.getAllOperations);
router.post('/operations', adminController.createOperation);
router.put('/operations/:id', adminController.updateOperationAdmin);
router.delete('/operations/:id', adminController.deleteOperation);

// Notifications Management
router.get('/notifications', adminController.getAllNotifications);
router.post('/notifications', adminController.createNotification);
router.delete('/notifications/:id', adminController.deleteNotification);

// Video consultation management
router.put('/doctors/:doctorId/video-enabled', adminController.setDoctorVideoEnabled);
router.get('/video/stats', adminController.getVideoUsageStats);

module.exports = router;
