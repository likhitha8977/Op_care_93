# Prescription Patient Search - Debugging Guide

## Issue: Patient search not working in prescription form

### Current Implementation Status:

- ✅ Backend endpoint `/api/doctor/search-patients` exists
- ✅ Frontend component `DoctorPrescriptionForm.jsx` has search functionality
- ✅ Auth middleware and doctor middleware are correctly implemented
- ✅ Added fallback to admin users endpoint

### Improvements Made:

#### 1. Enhanced Error Handling:

- Added fallback to admin users endpoint if primary search fails
- Improved error logging and user feedback
- Added loading state for search operations

#### 2. Better User Experience:

- Added search loading indicator
- Enhanced placeholder text with instructions
- Added "No patients found" message
- Improved dropdown behavior and styling

#### 3. Robust Patient Fetching:

```javascript
// Primary endpoint: /api/doctor/search-patients
// Fallback endpoint: /api/admin/users?role=patient
```

### How to Test:

1. **Login as a Doctor**
2. **Navigate to Prescriptions**
3. **Click in Patient Search Field**
4. **Type at least 2 characters** (e.g., "john", "test", etc.)
5. **Check Browser Console** for debugging information

### Expected Behavior:

- Typing triggers search after 2+ characters
- Loading indicator appears during search
- Dropdown shows matching patients
- Fallback triggers if primary endpoint fails
- Clear error messages if both endpoints fail

### Debugging Steps:

#### Check Browser Console:

```
1. "Patient search called with: [search term]"
2. "Fetching patients from: [URL]"
3. "Response status: [200/401/403/500]"
4. "Patients data received: [data]"
```

#### Check Network Tab:

- Look for calls to `/api/doctor/search-patients`
- Check response status and data
- Verify Authorization header is present

#### Check Backend Logs:

- Ensure doctor controller searchPatients function is called
- Verify User model queries are working
- Check for any database connection issues

### Manual Testing Commands:

#### Test with curl:

```bash
# Replace [TOKEN] with actual JWT token
curl -H "Authorization: Bearer [TOKEN]" \
     "http://localhost:5000/api/doctor/search-patients?search=test"
```

#### Test fallback endpoint:

```bash
curl -H "Authorization: Bearer [TOKEN]" \
     "http://localhost:5000/api/admin/users?role=patient"
```

### Common Issues & Solutions:

#### 1. No Token Error:

**Solution**: Ensure user is logged in and token is stored correctly

#### 2. 403 Forbidden:

**Solution**: Verify user has doctor role in database

#### 3. Empty Results:

**Solution**: Check if patients exist in database with role "patient"

#### 4. Network Error:

**Solution**: Ensure backend server is running on port 5000

### Quick Fix Commands:

#### Create test patient (if none exist):

```javascript
// In browser console or MongoDB shell
db.users.insertOne({
  fullName: "Test Patient",
  email: "test@patient.com",
  phone: "1234567890",
  role: "patient",
  password: "hashedpassword",
});
```

#### Verify doctor role:

```javascript
// Check current user role
localStorage.getItem("opcare_user"); // or check UserContext
```

The patient search should now work with improved error handling and fallback mechanisms. If issues persist, check the console logs for specific error details.
