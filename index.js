const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Helper to load mock JSON
function loadMock(filename) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'mock-jsons', filename), 'utf8'));
}

// SendVerificationCode endpoint
app.post('/v1/accounts/sendVerificationCode', (req, res) => {
    res.json({
        user_id: "162982dc5ae1627408985dd1e2859225f4e04d8c19120186e253258c8d1d9f92825b61",
        session_info: "wbq3OdV8yXLqgqLMRhfcHg",
        tid: "tid_123",
        sid: "sid_456",
        device_id: "device_789"
    });
});

// SignInWithOTP endpoint
app.post('/v1/accounts/signInWithOTP', (req, res) => {
    const payload = {
        user_id: req.body.user_id,
        name: "Saket tadimeti",
        roles: ["DP"]
    };
    const secret = "dummy_secret";
    const expiresIn = 60 * 10; // 10 minutes in seconds
    const access_token = jwt.sign(payload, secret, { expiresIn });

    res.json({
        access_token,
        refresh_token: "dummy_refresh_token",
        is_new_user: false
    });
});

// Refresh token endpoint
app.post('/v1/token/refresh', (req, res) => {
    const payload = {
        user_id: req.body.user_id,
        name: "Saket tadimeti",
        roles: ["DP"]
    };
    const secret = "dummy_secret";
    const expiresIn = 60 * 10; // 10 minutes in seconds
    const access_token = jwt.sign(payload, secret, { expiresIn });
    const expires_at = Math.floor(Date.now() / 1000) + expiresIn;

    res.json({
        refresh_token: "dummy_refresh_token",
        access_token,
        authorization: "dummy_authorization_token",
        cookies: {},
        expires_at
    });
});

// SignOut endpoint
app.post('/v1/accounts/signOut', (req, res) => {
    // SignOut just returns an empty response as per the proto
    res.json({});
});

// Profile endpoint
app.get('/api/v1/profile', (req, res) => {
    const response = loadMock('profile.json');
    res.json(response);
});

// Roles endpoint
app.get('/api/v1/roles', (req, res) => {
    res.json({
        statusCode: 200,
        statusMessage: "OK",
        data: ["runner", "handler"]
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Ozone mock server listening on port ${PORT}`);
}); 