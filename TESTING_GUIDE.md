# Firebase Integration Testing Guide

Complete guide for testing the Firebase authentication and persistence features.

## Prerequisites

Before testing, ensure:
1. ✅ Backend server running (`cd backend; uvicorn app.main:app --reload`)
2. ✅ Frontend dev server running (`npm run dev`)
3. ✅ Firebase project configured
4. ✅ `.env` file created with Firebase config
5. ✅ VS Code reloaded (to clear TypeScript cache)

## Test Scenarios

### 1. Guest User Flow (No Authentication)

**Test Case**: Verify app works for unauthenticated users

1. **Open the app** (usually `http://localhost:5173`)
2. **Check UI**:
   - ✅ "Sign In" button appears in top-right corner
   - ✅ Welcome screen loads
3. **Take a photo/discovery**:
   - ✅ Camera works
   - ✅ AI analysis returns results
   - ✅ Discovery shows with `"saved": false` in response
4. **Try to access Parental Dashboard**:
   - ✅ Click "Parental Dashboard" button
   - ✅ Toast message appears: "Please sign in to access Parental Dashboard"
   - ✅ Auth modal opens automatically
   - ✅ Returns to welcome screen (not dashboard)

**Expected**: Guest users can explore but cannot access protected features.

---

### 2. User Registration Flow

**Test Case**: Create a new account

1. **Click "Sign In" button** (top-right)
2. **In the Auth Modal**:
   - ✅ Modal opens with "Welcome Back!" title
   - ✅ Click "Sign up" link at bottom
   - ✅ Title changes to "Create Account"
   - ✅ Display Name field appears
3. **Fill in registration form**:
   - Display Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123456` (min 6 chars)
4. **Click "Create Account"**:
   - ✅ Loading spinner appears
   - ✅ Modal closes on success
   - ✅ "Sign In" button becomes user avatar
5. **Verify Firebase Console**:
   - Go to Firebase Console → Authentication
   - ✅ New user appears in Users list
   - ✅ Email matches `test@example.com`

**Expected**: New account created, user automatically signed in.

---

### 3. Google Sign-In Flow

**Test Case**: Sign in with Google account

1. **Click "Sign In" button**
2. **In Auth Modal**:
   - ✅ Click "Continue with Google" button
3. **Google OAuth Popup**:
   - ✅ Google account selection appears
   - Select account
   - ✅ Grant permissions
4. **After successful auth**:
   - ✅ Popup closes
   - ✅ Auth modal closes
   - ✅ User avatar appears in top-right
5. **Check Firebase Console**:
   - ✅ User appears with Google provider

**Expected**: Seamless Google authentication.

---

### 4. Protected Route Access

**Test Case**: Access Parental Dashboard when authenticated

1. **Ensure signed in** (user avatar visible)
2. **Click "Parental Dashboard"**:
   - ✅ No auth modal appears
   - ✅ Directly opens Parental Dashboard
   - ✅ Dashboard shows user profile data
3. **Verify ProtectedRoute wrapper**:
   - ✅ No "Authentication Required" message
   - ✅ Dashboard content fully loaded

**Expected**: Authenticated users access protected routes instantly.

---

### 5. Discovery Persistence Flow

**Test Case**: Verify discoveries save to Firestore for authenticated users

1. **Sign in** (if not already)
2. **Create a discovery**:
   - Take a photo
   - Wait for AI analysis
3. **Check API response**:
   - Open Browser DevTools → Network tab
   - Find `POST /api/discovery` request
   - ✅ Response includes `"saved": true`
   - ✅ Response includes `"discovery_id": "disc_..."`
4. **Navigate to Discovery History**:
   - Click user avatar → "My Discoveries"
   - ✅ New discovery appears in grid
   - ✅ Shows correct name, date, story
5. **Verify in Firestore Console**:
   - Firebase Console → Firestore Database
   - ✅ `discoveries` collection exists
   - ✅ Document with matching `discovery_id`
   - ✅ Contains all discovery data

**Expected**: Discoveries auto-save for authenticated users.

---

### 6. Favorite Discovery Toggle

**Test Case**: Mark discoveries as favorites

1. **Go to Discovery History page**
2. **Find a discovery card**:
   - ✅ Heart icon visible in top-right
3. **Click heart icon**:
   - ✅ Icon fills with pink color
   - ✅ No page reload
4. **Filter by Favorites**:
   - ✅ Click "Favorites" button
   - ✅ Only favorited discoveries show
5. **Toggle favorite off**:
   - ✅ Click heart again
   - ✅ Heart becomes outline
   - ✅ Discovery disappears from favorites view

**Expected**: Favorite state persists in Firestore.

---

### 7. User Profile Menu

**Test Case**: Test user dropdown functionality

1. **Click user avatar** (top-right)
2. **Dropdown menu appears**:
   - ✅ Shows user name and email
   - ✅ "Profile" link
   - ✅ "My Discoveries" link
   - ✅ "Settings" link
   - ✅ "Sign Out" button (red)
3. **Click "Sign Out"**:
   - ✅ Menu closes
   - ✅ Avatar changes to "Sign In" button
   - ✅ User logged out
4. **Try accessing Parental Dashboard**:
   - ✅ Auth modal appears
   - ✅ Redirected away from protected route

**Expected**: Clean sign-out flow with protection re-enabled.

---

### 8. Session Persistence

**Test Case**: Verify user stays signed in across page reloads

1. **Sign in to the app**
2. **Refresh the page** (F5 or Ctrl+R)
3. **Check UI**:
   - ✅ User avatar still appears
   - ✅ User name correct in dropdown
4. **Access Parental Dashboard**:
   - ✅ Opens without auth prompt
5. **Close browser tab**
6. **Re-open app URL**:
   - ✅ Still signed in (if session active)

**Expected**: Firebase maintains user session.

---

### 9. Backend Token Verification

**Test Case**: Verify backend validates Firebase tokens

1. **Sign in to frontend**
2. **Open Browser DevTools → Network**
3. **Make protected API call** (e.g., view discoveries)
4. **Check request headers**:
   - ✅ `Authorization: Bearer <token>` present
5. **Check backend logs**:
   - ✅ Shows "User authenticated: <uid>"
6. **Tamper with token**:
   - Use DevTools to modify Authorization header
   - Retry request
   - ✅ Backend returns 401 Unauthorized

**Expected**: Backend properly validates Firebase tokens.

---

### 10. Error Handling

**Test Case**: Handle authentication errors gracefully

1. **Invalid Email**:
   - Try signing in with `notanemail`
   - ✅ Error: "Invalid email address."
2. **Wrong Password**:
   - Use correct email, wrong password
   - ✅ Error: "Incorrect password."
3. **Weak Password** (signup):
   - Try password `123`
   - ✅ Error: "Password should be at least 6 characters."
4. **Network Error**:
   - Disconnect internet
   - Try signing in
   - ✅ Error message shown
5. **Close Google Popup**:
   - Start Google sign-in
   - Close popup before completing
   - ✅ Error: "Sign-in popup was closed..."

**Expected**: User-friendly error messages for all failures.

---

## Firestore Data Structure Verification

After testing, verify Firestore has proper data structure:

### Users Collection
```
users/{uid}
  - uid
  - email
  - display_name
  - created_at
  - children: []
  - preferences: {}
```

### Discoveries Collection
```
discoveries/{discovery_id}
  - discovery_id
  - user_id
  - timestamp
  - subject_type
  - species_info: {common_name, scientific_name}
  - story
  - favorite: false
  - child_id (optional)
  - location (optional)
```

---

## Common Issues & Solutions

### TypeScript Errors Won't Clear
**Problem**: Firebase module errors persist  
**Solution**: Reload VS Code window (`Ctrl+Shift+P` → "Reload Window")

### Backend 500 Error on Discovery
**Problem**: `email-validator` not installed  
**Solution**: `cd backend && pip install email-validator`

### "Missing Firebase configuration"
**Problem**: `.env` file missing/incorrect  
**Solution**: Create `.env` in project root with all `VITE_FIREBASE_*` vars

### Google Sign-In Popup Blocked
**Problem**: Browser blocks popup  
**Solution**: Allow popups for localhost in browser settings

### Discovery Not Saving
**Problem**: Not signed in  
**Solution**: Sign in first - only authenticated users can save discoveries

---

## Success Criteria

All tests pass when:
- ✅ Guest users can explore without signing in
- ✅ New accounts can be created
- ✅ Google Sign-In works
- ✅ Parental Dashboard is protected
- ✅ Discoveries save to Firestore when authenticated
- ✅ Favorites toggle persists
- ✅ User menu works correctly
- ✅ Sessions persist across reloads
- ✅ Backend validates tokens
- ✅ All errors handled gracefully
- ✅ Firestore data structure correct

---

## Next Steps After Testing

1. **Production Deployment**
   - Set up production Firebase project
   - Update environment variables
   - Deploy backend and frontend

2. **Security Rules**
   - Configure Firestore security rules
   - Limit user access to own data
   - Prevent unauthorized writes

3. **Additional Features**
   - Child profile management
   - Discovery sharing
   - Email verification
   - Password reset flow

Happy testing! 🚀
