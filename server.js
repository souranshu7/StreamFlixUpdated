const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with your own secret key

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/streamflix')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Define User schema and model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscription: { type: String, default: 'None' },
    profilePicture: { type: String, default: '' },
    lastPayment: {
        amount: { type: Number, default: 0 },
        date: { type: Date, default: null },
    },
});

const User = mongoose.model('User', userSchema);

// Define Subscription schema and model
const subscriptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    features: { type: [String], required: true },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Define Payment schema and model
const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
});

const Payment = mongoose.model('Payment', paymentSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// User registration endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'User registration failed' });
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
});

// Updated subscription endpoint with proper authentication
app.post('/subscribe', authenticateToken, async (req, res) => {
    const { subscriptionName } = req.body;

    try {
        const subscription = await Subscription.findOne({ name: subscriptionName });
        if (!subscription) {
            return res.status(400).json({ error: 'Invalid subscription' });
        }

        // Update the user's subscription
        await User.findByIdAndUpdate(req.userId, { subscription: subscriptionName });

        res.json({ success: true, message: 'Subscription updated successfully' });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(400).json({ success: false, message: 'Subscription update failed' });
    }
});

// Example endpoint for handling UPI payments
app.post('/pay', authenticateToken, async (req, res) => {
    const { amount } = req.body;

    try {
        // Save payment details
        const payment = new Payment({ userId: req.userId, amount });
        await payment.save();

        // Update the user's last payment details
        await User.findByIdAndUpdate(req.userId, {
            lastPayment: { amount, date: new Date() },
        });

        res.json({ success: true, message: 'Payment processed successfully' });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(400).json({ success: false, message: 'Payment processing failed' });
    }
});

// Profile endpoint
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                subscription: user.subscription || 'None',
                profilePicture: user.profilePicture || '',
                lastPayment: user.lastPayment || null,
            },
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Update profile endpoint
app.put('/profile', authenticateToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { $set: req.body },
            { new: true }
        );

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Fetch user profile data
const token = 'your_jwt_token_here'; // Replace with the actual token for testing

fetch('http://localhost:3002/profile', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`, // Use the token variable instead of localStorage
        'Content-Type': 'application/json',
    },
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('Profile fetched successfully:', data.user);
    } else {
        console.log('Failed to fetch profile data:', data.message);
    }
})
.catch(error => console.error('Error fetching profile:', error));

// Update user profile data
fetch('http://localhost:3002/profile', {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`, // Use the token variable instead of localStorage
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        name: 'John Doe',
        dob: '1990-01-01',
        phone: '1234567890',
    }),
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        alert('Profile updated successfully!');
        console.log('Updated User Data:', data.user);
    } else {
        alert('Failed to update profile.');
    }
})
.catch(error => console.error('Error updating profile:', error));

// Example user data
const exampleUserData = {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "johndoe@example.com",
    "password": "$2b$10$hashedpassword",
    "subscription": "Premium",
    "name": "John Doe",
    "dob": "1990-01-01",
    "phone": "1234567890",
    "profilePicture": "data:image/png;base64,...",
    "lastPayment": {
        "amount": 15.99,
        "date": "2025-04-01T00:00:00.000Z"
    }
};