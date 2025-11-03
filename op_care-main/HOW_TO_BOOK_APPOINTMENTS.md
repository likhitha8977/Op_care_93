# 📅 How to Book Appointments in Patient Domain

## 🚀 **Quick Start Guide**

### **Step 1: Access the Application**

1. Open your browser
2. Go to: `http://localhost:5173`
3. Login with patient credentials:
   - **Email**: `test@example.com`
   - **Password**: `testpass123`

### **Step 2: Navigate to Appointments**

1. After login, you'll be in the Patient Dashboard
2. Click on **"📅 My Appointments"** tab (should be active by default)
3. You'll see the appointments page

### **Step 3: Start Booking Process**

1. Click the **"Book New Appointment"** button
2. A booking modal will open with the following form:

## 📋 **Booking Form Fields**

### **Required Information:**

- **👨‍⚕️ Doctor**: Select from dropdown list of available doctors
- **🏥 Hospital**: Choose your preferred hospital
- **📅 Date**: Pick appointment date
- **🕐 Time**: Select appointment time

### **Optional Information:**

- **🩺 Type**: Consultation type (defaults to "consultation")
- **📝 Notes**: Any special requirements or notes

## ✅ **Booking Process**

### **Fill the Form:**

```
1. Doctor: [Dropdown] - Dr. John Smith - Cardiology
2. Hospital: [Dropdown] - City General Hospital
3. Date: [Date Picker] - 2025-11-05
4. Time: [Time Picker] - 10:00 AM
5. Type: [Text] - General Consultation
6. Notes: [Optional] - First visit, need health check
```

### **Submit Booking:**

1. Click **"Book Appointment"** button
2. Wait for success message
3. Modal will close automatically
4. New appointment appears in your list with **🟡 Pending** status

## 🎯 **After Booking**

### **Your Appointment Card Will Show:**

- **👨‍⚕️ Doctor Info**: Name and specialization
- **🏥 Hospital**: Name and location
- **📅 Date & Time**: Formatted appointment details
- **🟡 Status**: Initially "Pending"
- **🎯 Actions**: Confirm, Reschedule, or Cancel buttons

### **Available Actions:**

- **✓ Confirm**: Change status to confirmed
- **🔄 Reschedule**: Mark for rescheduling
- **🗑️ Cancel**: Remove the appointment

## 📱 **Features Available:**

### **Filter Appointments:**

- **📅 By Date**: Select specific date
- **👨‍⚕️ By Doctor**: Filter by selected doctor
- **🎯 By Status**: View by appointment status

### **Status Types:**

- **🟡 Pending**: Waiting for confirmation
- **🟢 Confirmed**: Appointment confirmed
- **✅ Completed**: Appointment finished
- **🔴 Cancelled**: Appointment cancelled
- **🔄 Rescheduled**: Appointment rescheduled

## 🔍 **Troubleshooting**

### **If No Doctors Appear:**

- Ensure backend server is running on port 5000
- Check if doctors exist in database
- Refresh the page

### **If Booking Fails:**

- Check internet connection
- Verify all required fields are filled
- Ensure servers are running
- Check browser console for errors

### **If Appointments Don't Load:**

- Verify you're logged in
- Check if backend API is accessible
- Try refreshing the page

## 🎉 **Complete Booking Flow:**

```
1. Login → 2. Go to Appointments → 3. Click "Book New"
   ↓
4. Fill Form → 5. Select Doctor & Hospital → 6. Choose Date/Time
   ↓
7. Add Notes (optional) → 8. Click "Book Appointment" → 9. Success!
   ↓
10. View in List → 11. Manage Status → 12. Filter as needed
```

## 🚀 **Ready to Book!**

Your appointment booking system is now fully functional with:

- ✅ Complete booking form
- ✅ Doctor and hospital selection
- ✅ Date/time picking
- ✅ Status management
- ✅ Real-time filtering
- ✅ Responsive design

**Start booking your appointments now at: http://localhost:5173** 🎊
