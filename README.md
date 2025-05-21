# Ozone Mock Authentication Server

This is a simple Node.js/Express mock server that implements authentication endpoints based on the Ozone proto contracts. It is intended for local development and testing.

## Features

- Implements endpoints for:
  - SendVerificationCode
  - SignInWithOTP
  - Refresh
  - SignOut
- Returns mock data and JWT tokens (10 min expiry)
- No request validation (for rapid prototyping)
- Hot reload with nodemon
- Supports Android emulator via `adb reverse`

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server (with hot reload and adb reverse):**
   ```bash
   npm run dev
   ```
   The server will run on [http://localhost:5000](http://localhost:5000).

## Endpoints

### 1. Send Verification Code

**POST** `/v1/accounts/sendVerificationCode`

**Response:**

```json
{
  "user_id": "162982dc5ae1627408985dd1e2859225f4e04d8c19120186e253258c8d1d9f92825b61",
  "session_info": "wbq3OdV8yXLqgqLMRhfcHg",
  "tid": "tid_123",
  "sid": "sid_456",
  "device_id": "device_789"
}
```

### 2. Sign In With OTP

**POST** `/v1/accounts/signInWithOTP`

**Request Body:**

```json
{
  "user_id": "string",
  "session_info": "string",
  "otp": "string",
  "client_id": "string",
  "login_mechanism": 1
}
```

**Response:**

```json
{
  "access_token": "<jwt>",
  "refresh_token": "dummy_refresh_token",
  "is_new_user": false
}
```

### 3. Refresh Token

**POST** `/v1/token/refresh`

**Request Body:**

```json
{
  "user_id": "string",
  "refresh_token": "dummy_refresh_token"
}
```

**Response:**

```json
{
  "refresh_token": "dummy_refresh_token",
  "access_token": "<jwt>",
  "authorization": "dummy_authorization_token",
  "cookies": {},
  "expires_at": 1712345678
}
```

### 4. Sign Out

**POST** `/v1/accounts/signOut`

**Request Body:**

```json
{
  "user_id": "string",
  "refresh_token": "dummy_refresh_token",
  "login_id": "string",
  "signout_type": 1,
  "access_token": "string",
  "client_id": "string"
}
```

**Response:**

```json
{}
```

## Notes

- All tokens and IDs are mock/dummy values.
- JWTs are signed with a dummy secret and expire in 10 minutes.
- No request validation is performed.
- Modify the code to adjust payloads or add more endpoints as needed.

---

**For any questions or improvements, feel free to open an issue or PR!**
