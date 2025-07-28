const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const SimpleJsonDB = require('simple-json-db');

const app = express();
app.use(express.json());

// Helper to load mock JSON
function loadMock(filename) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'mock-jsons', filename), 'utf8'));
}

const db = new SimpleJsonDB(path.join(__dirname, 'mock-jsons', 'db.json'));

// Helper to generate mock runners
function generateRunners(count) {
    return Array.from({ length: count }).map((_, i) => ({
        id: `runner_${i + 1}`,
        name: `Runner ${i + 1}`
    }));
}

// Helper to generate mock orders
function generateOrders(type, count, runners, filtersAssigned = [], filtersDelivered = []) {
    const statusMap = {
        incoming: [
            "ORDER_STATUS_ASSIGN_DELAYED",
            "ORDER_STATUS_UNASSIGNED",
            "ORDER_STATUS_REACHED",
            "ORDER_STATUS_ARRIVING",
            "ORDER_STATUS_INVALID"
        ],
        assigned: ["ORDER_STATUS_ASSIGNED", "ORDER_STATUS_PICKUP_DELAYED"],
        delivery: [
            "ORDER_STATUS_DELIVERED",
            "ORDER_STATUS_CANCELLED",
            "ORDER_STATUS_PICKED_UP",
            "ORDER_STATUS_DELIVERY_DELAYED"
        ]
    };
    const statuses = statusMap[type];
    return Array.from({ length: count }).map((_, i) => {
        const status = statuses[i % statuses.length];
        let runner, runnerId, runnerName;
        if (type === 'assigned' && filtersAssigned.length > 0) {
            const filter = filtersAssigned[i % filtersAssigned.length];
            runnerId = filter.value;
            runnerName = filter.label;
        } else if (type === 'delivery' && filtersDelivered.length > 0) {
            const filter = filtersDelivered[i % filtersDelivered.length];
            runnerId = filter.value;
            runnerName = filter.label;
        } else {
            runner = runners[i % runners.length];
            runnerId = runner.id;
            runnerName = runner.name;
        }
        return {
            id: `${type}_order_${i + 1}`,
            status,
            orderType: i % 2 === 0 ? "FOOD" : "GROCERY",
            etaInSeconds: 300 + i * 10,
            receivedAt: 1715598481 + i * 100,
            assignedAt: 1715598600 + i * 100,
            pickedUpAt: 1715598720 + i * 100,
            pickupDetails: { name: `Pickup Place ${i + 1}` },
            isOFOOrder: i % 2 === 0,
            customer: {
                name: `Customer ${i + 1}`,
                hasAlternateNumber: i % 2 === 0,
                address: {
                    line1: `Address line 1 - ${i + 1}`,
                    line2: `Address line 2 - ${i + 1}`,
                    fullAddress: `Full address for order ${i + 1}`,
                    landmark: `Landmark ${i + 1}`,
                    location: {
                        latitude: 12.9346 + i * 0.01,
                        longitude: 77.6953 + i * 0.01
                    }
                }
            },
            items: [
                { name: `Item A${i + 1}`, quantity: 1 + i },
                { name: `Item B${i + 1}`, quantity: 2 }
            ],
            deliveryPartner: { name: runnerName, id: runnerId },
            trackingDetails: {
                receiver: { name: `Receiver ${i + 1}` },
                runner: { name: runnerName, id: runnerId }
            },
            customerRequests: i % 2 === 0 ? ["LEAVE_WITH_SECURITY"] : [],
            audioInstructions: i % 2 === 0 ? { url: `https://api.runner-app.com/voice-notes/ord${i + 1}.mp3` } : undefined
        };
    });
}

// Populate DB with mock data if empty
if (
    db.get('runners').length === 0 &&
    db.get('incomingOrders').length === 0 &&
    db.get('assignedOrders').length === 0 &&
    db.get('deliveredOrders').length === 0
) {
    const runners = generateRunners(10);
    const filtersAssigned = db.get('filtersAssigned') || [];
    const filtersDelivered = db.get('filtersDelivered') || [];
    db.set('runners', runners);
    db.set('incomingOrders', generateOrders('incoming', 20, runners));
    db.set('assignedOrders', generateOrders('assigned', 20, runners, filtersAssigned, filtersDelivered));
    db.set('deliveredOrders', generateOrders('delivery', 20, runners, filtersAssigned, filtersDelivered));
}

// SendVerificationCode endpoint
app.post('/v2/accounts/sendVerificationCode', (req, res) => {
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
        // random session_id
        session_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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
        session_id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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
app.get('/v1/runners/profile', (req, res) => {
    const response = loadMock('profile.json');
    res.json(response);
});

// Roles endpoint
app.get('/v1/runners/roles', (req, res) => {
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
        data: { roles: ["ROLE_RUNNER", "ROLE_HANDLER"] }
    });
});



app.post('/v1/runners/login-with-role', (req, res) => {
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
app.get('/v1/runners/home', (req, res) => {
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

app.post('/v1/runners/duty/state', (req, res) => {
    const { state } = req.body;

    res.json({
        "statusCode": 200,
        "statusMessage": "OK",
        "data": {
            "status": state
        }
    }
    );
    // const response = loadMock('duty.json');
    // res.json(response);
});

// Receive Order endpoint
app.post('/v1/runners/orders/receive', (req, res) => {
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

// Paginated order listing endpoint
app.post('/v1/runners/orders', (req, res) => {
    const { type, offset = 0, pageSize = 10, filters: reqFilters = [] } = req.body;
    if (!type || !['incoming', 'assigned', 'delivery'].includes(type)) {
        return res.status(400).json({ statusCode: 400, statusMessage: 'Invalid or missing type', data: null });
    }
    const offsetNum = Number(offset);
    const pageSizeNum = Number(pageSize);
    if (isNaN(offsetNum) || isNaN(pageSizeNum) || offsetNum < 0 || pageSizeNum <= 0) {
        // return res.status(400).json({ statusCode: 400, statusMessage: 'Invalid offset or pageSize', data: null });
    }

    let orders = [];
    let filters = [];
    if (type === 'incoming') {
        orders = db.get('incomingOrders');
        filters = db.get('filtersIncoming');
    } else if (type === 'assigned') {
        orders = db.get('assignedOrders');
        filters = db.get('filtersAssigned');
    } else if (type === 'delivery') {
        orders = db.get('deliveredOrders');
        filters = db.get('filtersDelivered');
    }
    // Always use the full dataset for metadata
    const totalOrders = orders.length;
    // Apply filters from request only to the orders list
    let filteredOrders = orders;
    if (Array.isArray(reqFilters) && reqFilters.length > 0) {
        reqFilters.forEach(f => {
            if (f.type === 'status') {
                if (type === 'incoming') {
                    // Map UI status filter to order statuses
                    let statusList = [];
                    if (f.value === 'ORDER_RECEIVED') {
                        statusList = ['ORDER_STATUS_ASSIGN_DELAYED', 'ORDER_STATUS_UNASSIGNED'];
                    } else if (f.value === 'ARRIVED') {
                        statusList = ['ORDER_STATUS_REACHED'];
                    } else if (f.value === 'ON_THE_WAY') {
                        statusList = ['ORDER_STATUS_ARRIVING'];
                    } else {
                        statusList = [f.value];
                    }
                    filteredOrders = filteredOrders.filter(o => statusList.includes(o.status));
                } else {
                    filteredOrders = filteredOrders.filter(o => o.status === f.value);
                }
            } else if (f.type === 'runner') {
                filteredOrders = filteredOrders.filter(o =>
                    o.trackingDetails.runner.id === f.value
                );
            }
        });
    }
    const paginatedOrders = filteredOrders.slice(offsetNum, offsetNum + pageSizeNum);
    let nextPageToken = null;
    if (offsetNum + pageSizeNum < filteredOrders.length) {
        nextPageToken = String(offsetNum + pageSizeNum);
    }
    res.json({
        statusCode: 200,
        statusMessage: "Eligible runners fetched successfully",
        data: {
            // totalOrders: type === 'assigned' ? 0 : totalOrders,
            // orders: type === 'assigned' ? [] : paginatedOrders,
            // filters: type === 'assigned' ? [] : filters,
            // nextPageToken,

            totalOrders: totalOrders,
            orders: paginatedOrders,
            filters: filters,
            nextPageToken,
        }
    });
});

// Search orders endpoint
app.post('/v1/runners/orders/search', (req, res) => {
    const term = (req.body.term || '').toLowerCase();
    const incoming = db.get('incomingOrders') || [];
    const assigned = db.get('assignedOrders') || [];
    const delivered = db.get('deliveredOrders') || [];
    let allOrders = [...incoming, ...assigned, ...delivered];
    let results;
    if (!term) {
        results = allOrders;
    } else {
        results = allOrders.filter(order => {
            const customerName = (order.customer && order.customer.name || '').toLowerCase();
            const orderId = (order.id || '').toLowerCase();
            return customerName.includes(term) || orderId.includes(term);
        });
    }
    // res.status(400).json({
    //     statusCode: 400,
    //     statusMessage: 'Invalid search term',
    //     data: null
    // });
    // return
    res.json({
        statusCode: 200,
        statusMessage: 'Search complete',
        data: { orders: results }
    });
});

// Call API endpoint
app.post('/v1/runners/call', (req, res) => {
    const { callTarget, receiverType } = req.body;
    // Define valid cases and their numbers
    const cases = {
        'CUSTOMER-PRIMARY': '+91919123210',
        'CUSTOMER-ALTERNATE': '+91299123211',
        'CUSTOMER-SENDER': '+91939123212',
        'RUNNER-PRIMARY': '+91949123213',
        'RECEIVER-PRIMARY': '+91959123214',
        'DE-PRIMARY': '+91969123215',
        'HUB_MANAGER-PRIMARY': '+91979123216',
    };
    let key = '';
    console.log(callTarget, receiverType);
    if (callTarget === 'CUSTOMER') {
        if (!receiverType) {
            return res.status(400).json({
                statusCode: 400,
                statusMessage: 'receiverType is required for CUSTOMER',
                data: null
            });
        }
        key = `CUSTOMER-${receiverType.toUpperCase()}`;
    } else if (['RUNNER', 'RECEIVER', 'DE', 'HUB_MANAGER'].includes(callTarget)) {
        key = `${callTarget}-PRIMARY`;
    } else {
        return res.status(400).json({
            statusCode: 400,
            statusMessage: 'Invalid callTarget',
            data: null
        });
    }
    console.log(key);
    if (!cases[key]) {
        return res.status(400).json({
            statusCode: 400,
            statusMessage: 'Invalid callTarget/receiverType combination',
            data: null
        });
    }
    res.json({
        statusCode: 200,
        statusMessage: 'success',
        data: {
            virtualNumber: cases[key]
        }
    });
});

// Update order status endpoint
app.post('/v1/runners/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!['PICKED_UP', 'DELIVERED'].includes(status)) {
        return res.status(400).json({
            statusCode: 400,
            statusMessage: 'Invalid status',
            data: null
        });
    }
    res.json({
        statusCode: 200,
        statusMessage: 'Order status updated successfully',
        data: {
            orderId,
            status
        }
    });
});

// Logout endpoint
app.post('/v1/runners/logout', (req, res) => {
    const { errorCode = "" } = req.body;
    if (errorCode === 'USER_ONLINE' || errorCode === 'INVALID_TOKEN') {
        return res.status(400).json({
            statusCode: 400,
            statusMessage: 'Bad Request',
            data: null,
            errorCode
        });
    }
    // if (errorCode === 'INTERNAL') {
    //     return res.status(500).json({
    //         statusCode: 500,
    //         statusMessage: 'Internal Server Error',
    //         data: null
    //     });
    // }
    res.json({
        statusCode: 200,
        statusMessage: 'OK',
        data: {
            message: 'Logged out successfully'
        }
    });
});

// Configs endpoint
app.get('/v1/runners/configs', (req, res) => {
    res.json({
        statusCode: 200,
        statusMessage: "Success",
        data: {
            experiments: {},
            flags: {
                minAppVersion: 1
            }
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Ozone mock server listening on port ${PORT}`);
}); 
