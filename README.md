# StreamFever - Video Subscription Service

StreamFever is a video subscription platform that allows users to explore and enjoy a wide range of movies and TV shows. The platform supports user authentication, subscription management, and payment processing.

## Features

- **User Authentication**: Register, login, and manage user profiles.
- **Subscription Plans**: Choose from Basic, Standard, and Premium plans with varying features.
- **Payment Integration**: Supports UPI and credit card payments using Razorpay and Paytm.
- **Content Access**: Unlock content based on the user's subscription plan.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.
- **Backend API**: Powered by Node.js, Express, and MongoDB for user and subscription management.

## Project Structure
webdev/ ├── backend/ │ ├── package.json # Backend dependencies ├── images/ # Static assets for the UI ├── content.html # Content page for streaming ├── credit-card.html # Credit card payment page ├── index.html # Landing page ├── payment-history.html # Payment history page ├── payment.html # Payment selection page ├── profile.html # User profile page ├── server.js # Backend server ├── subscriptions.html # Subscription plans page ├── thank-you.html # Thank you page after payment ├── upi.html # UPI payment page ├── package.json # Frontend dependencies

## Technologies Used

### Frontend
- **HTML/CSS**: For structuring and styling the UI.
- **React**: For dynamic and interactive components.
- **Tailwind CSS**: For responsive and modern styling.
- **Bootstrap Icons**: For icons and visual elements.

### Backend
- **Node.js**: Server-side runtime.
- **Express**: Web framework for building APIs.
- **MongoDB**: Database for storing user and subscription data.
- **Mongoose**: ODM for MongoDB.
- **JWT**: For secure user authentication.
- **Razorpay & Paytm**: For payment processing.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/streamfever.git
   cd streamfever
2. Install dependencies for the backend:
   cd backend
   npm install
3. Install dependencies for the frontend:
   cd ..
   npm install
4. Start the backend server:
   node server.js
5. Open index.html in your browser to view the application.

Usage
Register/Login: Create an account or log in to access the platform.
Choose a Plan: Select a subscription plan from the available options.
Make a Payment: Complete the payment using UPI or credit card.
Enjoy Content: Access content based on your subscription level.

API Endpoints
Authentication
POST /register: Register a new user.
POST /login: Authenticate a user and return a JWT token.
Profile
GET /profile: Fetch user profile details.
PUT /profile: Update user profile information.
Subscription
POST /subscribe: Update the user's subscription plan.
Payment
POST /pay: Process a payment.
