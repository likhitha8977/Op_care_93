# 💳 Payment Feature Documentation

## Overview
A comprehensive QR code-based payment system integrated into the patient account, allowing patients to make secure payments for OP registrations, consultations, and other hospital services.

## Features Implemented

### 1. **QR Code Payment System**
- ✅ Real-time QR code generation for UPI payments
- ✅ Dynamic QR codes with embedded payment information
- ✅ Support for all major UPI apps (Google Pay, PhonePe, Paytm, etc.)
- ✅ Unique transaction ID for each payment

### 2. **Payment Methods**
- **UPI Payment**: Scan QR code or use UPI ID directly
- **Bank Transfer**: Complete bank details with copy-to-clipboard functionality
- **Manual Entry**: Enter UPI transaction ID for payment confirmation

### 3. **Payment Management**
- Create new payments with custom amounts and purposes
- Track payment status (pending, completed, failed, refunded)
- View complete payment history
- Confirm payments with UPI transaction ID
- Admin verification system

### 4. **User Interface**
- Modern, responsive design
- Payment purpose selector (OP Registration, Consultation, Lab Tests, etc.)
- Interactive QR code display
- Copy-to-clipboard for payment details
- Real-time payment history with status badges
- Confirmation modal for payment verification

## Technical Implementation

### Backend Components

#### **Models** (`backend/models/Payment.js`)
```javascript
{
  user: ObjectId,
  amount: Number,
  transactionId: String (unique),
  paymentMethod: String,
  status: String (pending/completed/failed/refunded),
  purpose: String,
  upiTransactionId: String,
  qrCodeData: String,
  paymentProof: String,
  verifiedBy: ObjectId,
  verifiedAt: Date,
  createdAt: Date
}
```

#### **API Endpoints** (`backend/routes/payments.js`)
- `POST /api/payments` - Create new payment
- `GET /api/payments` - Get user's payment history
- `GET /api/payments/:paymentId` - Get specific payment
- `PUT /api/payments/:paymentId/confirm` - Confirm payment
- `POST /api/payments/:paymentId/proof` - Upload payment proof
- `GET /api/payments/admin/all` - Get all payments (admin)
- `PUT /api/payments/admin/:paymentId/verify` - Verify payment (admin)

#### **Controller** (`backend/controllers/paymentController.js`)
- Transaction ID generation
- QR code data creation with UPI deep links
- Payment status management
- File upload handling for payment proofs

### Frontend Components

#### **Payment Component** (`frontend/src/components/payment.jsx`)
- Payment form with amount and purpose selection
- QR code generation and display using `qrcode.react`
- Payment details with copy functionality
- UPI transaction ID input and confirmation
- Payment history display with status indicators
- Confirmation modal for payment verification

#### **Integration** (`frontend/src/components/profile.jsx`)
- Added "Payments" tab to patient sidebar navigation
- Integrated Payment component into profile layout
- Context-aware user authentication

#### **Styling** (`frontend/src/styles/payment.css`)
- Comprehensive responsive design
- Color-coded status badges
- Animated modal overlays
- Mobile-optimized layout
- Hover effects and transitions

## How to Use

### For Patients

1. **Navigate to Payments Tab**
   - Login to your patient account
   - Click on "Payments" in the sidebar menu

2. **Make a Payment**
   - Select payment purpose (OP Registration, Consultation, etc.)
   - Enter the amount
   - Click "Generate QR Code"

3. **Complete Payment**
   - Option A: Scan the QR code with any UPI app
   - Option B: Copy UPI ID and pay manually
   - Option C: Use bank transfer details

4. **Confirm Payment**
   - After payment, enter your UPI Transaction ID
   - Click "Confirm Payment"
   - Wait for admin verification

5. **View History**
   - Check your payment history below the payment form
   - View status of each payment

### For Admins

1. **Access Payment Management**
   - Use admin dashboard
   - Navigate to payments section

2. **Verify Payments**
   - Review pending payments
   - Check UPI transaction IDs
   - Update payment status

## Configuration

### Environment Variables
Add to `backend/.env`:
```env
UPI_ID=your_hospital_upi@bank
```

### Update Payment Details
Modify in `frontend/src/components/payment.jsx`:
```javascript
const paymentDetails = {
  upiId: 'your_upi@bank',
  name: 'Your Hospital Name',
  accountNumber: 'XXXXXXXXXXXXXX',
  ifsc: 'BANKXXXXXX',
  bankName: 'Your Bank Name',
  branch: 'Branch Name'
};
```

## Security Features

- ✅ JWT-based authentication for all payment endpoints
- ✅ User ownership verification for payment actions
- ✅ Admin-only access for payment verification
- ✅ Unique transaction IDs for tracking
- ✅ File upload validation for payment proofs
- ✅ CORS protection and input validation

## UPI Deep Link Format

The system generates standard UPI payment links:
```
upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tn=PURPOSE&tr=TRANSACTION_ID
```

This format is compatible with all UPI apps in India.

## Testing the Feature

1. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Login as Patient**
   - Create a patient account or login
   - Navigate to Payments tab

4. **Generate QR Code**
   - Enter amount (e.g., 500)
   - Select purpose
   - Generate QR code

5. **Test Payment Flow**
   - Use a UPI testing app or simulator
   - Scan the QR code
   - Enter transaction ID
   - Confirm payment

## Future Enhancements

- [ ] Payment gateway integration (Razorpay, Stripe)
- [ ] Automatic payment verification via webhook
- [ ] SMS/Email notifications for payment status
- [ ] Refund processing
- [ ] Payment receipt generation (PDF)
- [ ] Multiple payment methods (card, wallet)
- [ ] Installment payment options
- [ ] Payment analytics dashboard

## Dependencies

### Backend
- `mongoose` - Database ORM
- `express` - Web framework
- `multer` - File upload handling
- `jsonwebtoken` - Authentication

### Frontend
- `react` - UI framework
- `qrcode.react` - QR code generation
- `axios` - HTTP client
- `react-toastify` - Notifications
- `react-router-dom` - Routing

## Troubleshooting

### QR Code Not Generating
- Check if backend is running
- Verify JWT token is valid
- Check browser console for errors

### Payment Not Confirming
- Ensure UPI transaction ID is entered
- Check internet connection
- Verify backend API is accessible

### Payment History Not Loading
- Clear browser cache
- Check authentication token
- Verify API endpoint is correct

## Support

For issues or questions:
- Check backend logs: `backend/` directory
- Check browser console for frontend errors
- Verify MongoDB is running
- Ensure all environment variables are set

## License

This payment system is part of the OP Care Hospital Management System.

---

**Note**: Replace placeholder UPI IDs and bank details with actual production credentials before deploying to production.
