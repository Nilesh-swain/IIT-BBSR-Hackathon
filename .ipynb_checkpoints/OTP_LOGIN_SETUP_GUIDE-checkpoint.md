# OTP-Only Authentication Setup Guide

## Overview

Your Antariksh website has been successfully converted from 2-step verification (Password + Captcha) to a **simplified single OTP-based authentication system**.

---

## Changes Made

### 1. **Backend Changes**

#### New Service Functions (Auth Service)

- **`requestLoginOtp(email)`** - Sends OTP to user's email when they request login
- **`verifyLoginOtp(email, otp, trustDevice)`** - Verifies the OTP and logs user in

#### New Controller Functions (User Controller)

- **`requestLoginOtpController`** - Handles POST /api/auth/login/request-otp
- **`verifyLoginOtpController`** - Handles POST /api/auth/login/verify-otp

#### New API Routes

```
POST /api/auth/login/request-otp
  - Body: { email: "user@email.com" }
  - Response: { success: true, expiresInSeconds: 600 }

POST /api/auth/login/verify-otp
  - Body: { email: "user@email.com", otp: "123456", trustDevice: false }
  - Response: { token, user, success: true }
```

#### Modified Files

- **`backend/src/services/authService.js`** - Added `requestLoginOtp()` function
- **`backend/src/controllers/userController.js`** - Added new controller functions
- **`backend/src/routes/userRoutes.js`** - Added new route endpoints

### 2. **Frontend Changes**

#### Login Flow Transformation

**Before (2-Step):**

1. Enter Email
2. Enter Password
3. Solve Captcha
4. Login

**After (Single OTP):**

1. Enter Email → Request OTP
2. Enter 6-digit OTP → Verify & Login

#### Updated File

- **`Frontend/src/features/auth/LoginPage.jsx`** - Completely redesigned with:
  - Email input step
  - OTP input with 6-digit fields
  - 10-minute countdown timer
  - Resend OTP button (available after 5 minutes)
  - Back to email button
  - Same futuristic UI aesthetic maintained

---

## Registration Process (Unchanged)

Registration still works as before:

1. Enter username, email, password
2. Complete captcha verification
3. Receive OTP via email
4. Enter OTP to complete registration

---

## How It Works

### Step 1: Request OTP

```
User enters email → System validates account exists
→ Generates 6-digit OTP → Sends via email
```

### Step 2: Verify OTP

```
User enters 6-digit OTP from email → Backend validates
→ User logged in with JWT token → Redirect to dashboard
```

### Timeouts

- **OTP Validity**: 10 minutes (600 seconds)
- **Resend Available After**: 5 minutes
- **Trusted Device**: Optional (can trust device for future logins)

---

## Testing the New System

### Test Case 1: Successful Login

1. Go to http://localhost:5173/auth/login
2. Enter registered email (e.g., your test account)
3. Check email for OTP code
4. Enter OTP in the 6-digit fields
5. Should be logged in and redirected to dashboard

### Test Case 2: Invalid OTP

1. Enter wrong OTP → See error message
2. Fields clear automatically after error
3. Can try again or resend OTP

### Test Case 3: Resend OTP

1. Wait 5+ minutes after initial OTP request
2. Click "Resend OTP" button
3. Check email for new OTP code

### Test Case 4: Back Button

1. After requesting OTP, click "Back to Email"
2. Should return to email entry step
3. Can enter different email

---

## Environment Configuration

Your `.env` file is already configured correctly:

```env
# Email will be sent using this account
EMAIL_USER=nileshswain715@gmail.com
EMAIL_PASS=fthk njzp hlkt rnpv
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587

# OTP validity in backend
JWT_EXPIRE=5d

# NASA API remains the same
NASA_API_KEY=ckfrdvoegfX4HecZhliguIiOdFxhGWXfLeHQ2VsK
```

---

## Running Backend & Frontend

### Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Frontend

```bash
cd Frontend
npm run dev
# Runs on http://localhost:5173
```

### Verify Connection

Visit: http://localhost:5173/auth/login

- Should see new OTP login interface
- Email input field with "Request OTP" button

---

## Key Features

✅ **Simpler UX** - No password/captcha needed
✅ **More Secure** - OTP-based verification
✅ **Email Validation** - Confirms email ownership
✅ **Rate Limited** - Max 5 OTP requests per 10 minutes per email
✅ **Time-Limited** - OTP expires after 10 minutes
✅ **Trusted Devices** - Optional device trust for future logins
✅ **Error Handling** - Clear error messages
✅ **Countdown Timer** - Visual feedback of OTP expiration

---

## API Response Examples

### Success: Request OTP

```json
{
  "success": true,
  "message": "Verification OTP sent to your email.",
  "email": "user@email.com",
  "expiresInSeconds": 600
}
```

### Success: Verify OTP

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "123...",
    "email": "user@email.com",
    "username": "username",
    "isVerified": true
  }
}
```

### Error: Account Not Found

```json
{
  "success": false,
  "message": "Account not found. Please register first."
}
```

### Error: Invalid OTP

```json
{
  "success": false,
  "message": "Invalid or expired login verification code."
}
```

---

## Troubleshooting

### Issue: OTP Not Received

- **Check Gmail Spam Folder** - May be marked as spam
- **Verify Email** - Ensure correct email address entered
- **Resend** - Request new OTP after waiting

### Issue: "Account pending verification"

- **Complete Registration First** - Run through signup flow completely
- **Verify OTP During Signup** - Enter OTP sent during registration

### Issue: Port 5000 Already in Use

```bash
# Windows: Kill process on port 5000
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

### Issue: Email Not Configured

- **Check .env** - Verify EMAIL_USER and EMAIL_PASS
- **Gmail App Password** - Use app-specific password, not account password
- **Enable Less Secure Apps** - May need Gmail account settings adjustment

---

## Database Updates

No database migrations needed. The system uses existing:

- `User` collection
- `AuthChallenge` collection (for storing OTP temporarily)
- `OtpVerification` collection (for registration OTPs)

---

## Production Deployment

When deploying to production:

1. **Update Frontend URL**

   ```env
   VITE_API_URL=https://your-backend.onrender.com
   VITE_NASA_API_KEY=your_actual_key
   ```

2. **Update Backend URLs**

   ```env
   CLIENT_URL=https://your-frontend.onrender.com
   FRONTEND_URL=https://your-frontend.onrender.com
   CORS_ORIGINS=https://your-frontend.onrender.com
   NODE_ENV=production
   ```

3. **Email Service**
   - Ensure email credentials are valid
   - Consider using SendGrid or similar for production
   - Update MAIL\_\* environment variables

4. **Security**
   - Update JWT_SECRET to a strong value
   - Use HTTPS only in production
   - Enable secure cookies

---

## Summary

✨ Your authentication system is now:

- **Simpler** - Users only need email + OTP
- **Faster** - No password creation/memory needed
- **Safer** - Email verification built-in
- **Modern** - Following current security best practices

Enjoy your simplified OTP-based authentication!

---

**Questions?** Check the error messages and logs for detailed debugging information.
