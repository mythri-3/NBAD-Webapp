const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());

const mongoUri = 'mongodb://127.0.0.1:27017';
const mongoClient = new MongoClient(mongoUri);
const dbName = 'final_nbad';
const jwtSecret = 'MythriGudibanda';

const authenticateJwt = expressJwt({
    secret: jwtSecret,
    algorithms: ['HS256']
});

app.use(express.json());

async function initializeDatabase() {
    await mongoClient.connect();
    console.log('MongoDB connection established');
}


function createSalt() {
    return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password, salt) {
    const hash = crypto.createHash('sha256');
    hash.update(password + salt);
    return hash.digest('hex');
}

// User signup endpoint
app.post('/api/signup', async (req, res) => {
    const { password, username } = req.body;
    const salt = createSalt();
    const encryptedPassword = hashPassword(password, salt);

    const newUser = {
        username,
        password: encryptedPassword,
        salt,
    };

    try {
        const db = mongoClient.db(dbName);
        const result = await db.collection('users').insertOne(newUser);
        res.json({ status: 200, success: true, response: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    const { password, username } = req.body;

    try {
        const db = mongoClient.db(dbName);
        const user = await db.collection('users').findOne({ username });

        if (user) {
            const encryptedInputPassword = hashPassword(password, user.salt);

            if (encryptedInputPassword === user.password) {
                const token = jwt.sign(
                    { username: user.username, userId: user._id },
                    jwtSecret,
                    { expiresIn: '5m' }
                );

                res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        username: user.username,
                        user_id: user._id
                    },
                    token
                });
            } else {
                res.status(401).json({ success: false, message: 'Incorrect password' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Unable to retrieve user' });
    }
});

// User logout endpoint
app.post('/api/logout', (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token not provided' });
    }

    try {
        jwt.verify(token, jwtSecret);
        res.setHeader('Clear-Token', 'true');
        res.json({ success: true, message: 'Logout successful' });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

// Refresh token endpoint
app.post('/api/refreshToken', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtSecret);
        const newToken = jwt.sign(
            { username: decoded.username, userId: decoded.userId },
            jwtSecret,
            { expiresIn: '5m' }
        );
        res.json({ success: true, message: 'Token refreshed successfully', accessToken: newToken });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
});

// API to fetch AI adoption trends
app.get('/api/aiAdoption', authenticateJwt, async (req, res) => {
    try {
        const db = mongoClient.db(dbName);
        const data = await db.collection('ai_adoption').find().toArray();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch data' });
    }
});

// API to fetch AI use cases
app.get('/api/aiUseCases', authenticateJwt, async (req, res) => {
    try {
        const db = mongoClient.db(dbName);
        const data = await db.collection('ai_use_cases').find().toArray();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch data' });
    }
});

// Default route
app.get('/', async (req, res) => {
    res.status(200).json({ success: true, message: 'Everything is functioning as expected.' });
});

// Server initialization
const server = app.listen(port, async () => {
    await initializeDatabase();
    console.log(`Server is operational on port ${port}`);
});

// Clean up on exit
process.on('exit', async () => {
    await mongoClient.close();
    server.close();
    console.log('Server and database connection terminated');
});

module.exports = app;
