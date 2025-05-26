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
    // return non 2xx response
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


    // return non 2xx response
    res.json({
        error: "dummy_error",
        error_description: "dummy_error_description"
    });

    return

    res.json({
        access_token,
        refresh_token: "dummy_refresh_token",
        is_new_user: false
    });
});

// SignInWithPhoneNumber endpoint
app.post('/v1/accounts/signInWithPhoneNumber', (req, res) => {
    const payload = {
        user_id: req.body.user_id,
        name: "Saket tadimeti",
        roles: ["DP"],
        sub: "21",
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
        roles: ["DP"],
        sub: "21",
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
app.get('/api/v1/runners/profile', (req, res) => {
    const response = loadMock('profile.json');
    res.json(response);
});

// Roles endpoint
app.get('/api/v1/runners/roles', (req, res) => {
    // return 404 with message

    // res.status(404).json({
    //     statusCode: 404,
    //     statusMessage: "Not Found",
    //     data: { message: "User not found" }
    // });
    // return

    res.json({
        statusCode: 200,
        statusMessage: "OK",
        data: { roles: ["runner"] }
    });
});

//
// write api integration for this
// path - api/v1/runners/login
// request body
// {
//   "role": "runner" // or  "handler"
// }
// response body
// {
//   "statusCode": 200,
//   "statusMessage": "OK",
//   "data": {
//     "message": "Role updated successfully",
//   }
// }

app.post('/api/v1/runners/login', (req, res) => {
    const response = loadMock('login.json');
    // return 404 with message
    // res.status(404).json({
    //     statusCode: 404,
    //     statusMessage: "Not Found",
    //     data: { message: "Invalid role" }
    // });
    // return
    res.json(response);
});

// Home feature endpoint
app.get('/api/v1/runners/home', (req, res) => {
    // return 404 with message
    // res.status(500).json({
    //     statusCode: 500,
    //     statusMessage: "Not Found",
    //     data: { message: "Error in fetching home" }
    // });
    // return
    const response = loadMock('home.json');
    res.json(response);
});

app.post('/api/v1/runners/duty/state', (req, res) => {
    const response = loadMock('duty.json');
    res.json(response);
});

// Receive Order endpoint
app.post('/api/v1/runners/orders/receive', (req, res) => {
    const code = req.body.code || "000000";
    // For mock, prepend a fixed prefix to the code to form the order id
    const receviedOrder = `1231212${code}`;

    // return 400 with message
    // res.status(400).json({
    //     statusCode: 400,
    //     statusMessage: "Invalid scanned code format",
    //     data: null
    // });
    // return

    // res.status(404).json({
    //     "statusCode": 404,
    //     "statusMessage": "No matching order found for this code and user",
    //     "data": {
    //         "message": "INVALID_ORDER"
    //     }
    // });
    // return


    res.json({
        statusCode: 200,
        statusMessage: "Order marked as received",
        data: {
            receviedOrder
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Ozone mock server listening on port ${PORT}`);
}); 