# 🗄️ MongoDB Atlas Setup Guide for Rihla Hub

This guide will help you set up a **FREE** MongoDB Atlas database for persistent, encrypted data storage.

## 📋 Prerequisites

- Email address for MongoDB Atlas account
- 5 minutes of time

---

## 🚀 Step 1: Create MongoDB Atlas Account

1. Go to **[MongoDB Atlas](https://cloud.mongodb.com)**
2. Click **"Try Free"** or **"Get Started Free"**
3. Sign up with email or Google account
4. Verify your email

---

## 🏗️ Step 2: Create a Free Cluster

1. After logging in, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (512MB - perfect for starting)
3. Select **Cloud Provider & Region**:
   - Recommended: **AWS** - **Bahrain (me-south-1)** (closest to Saudi Arabia)
   - Alternative: **AWS** - **Mumbai (ap-south-1)**
4. Name your cluster: `RihlaCluster` (or any name)
5. Click **"Create"**

⏳ Wait 1-3 minutes for cluster creation...

---

## 🔐 Step 3: Configure Security

### A. Create Database User

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter credentials:
   - **Username**: `rihla_admin`
   - **Password**: Generate a strong password (save it!)
5. Under **"Database User Privileges"**, select **"Read and write to any database"**
6. Click **"Add User"**

### B. Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production: Add only your server's IP address
4. Click **"Confirm"**

---

## 🔗 Step 4: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js, **Version**: 5.5 or later
5. Copy the connection string. It looks like:
   ```
   mongodb+srv://rihla_admin:<password>@rihlacluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual password

---

## ⚙️ Step 5: Configure Rihla Backend

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create your `.env` file:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` and set your MongoDB connection:
   ```env
   MONGO_URL=mongodb+srv://rihla_admin:YOUR_PASSWORD@rihlacluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=rihla_enterprise
   JWT_SECRET=generate-a-strong-random-string-here-at-least-64-characters
   JWT_EXPIRES_IN=7d
   ```

4. Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

---

## 📦 Step 6: Install Dependencies & Run

```bash
# Install new dependencies
npm install

# Start the server
npm run dev

# Or for production
npm start
```

You should see:
```
🔄 Connecting to MongoDB Atlas...
✅ MongoDB Atlas connected successfully
📦 Database: rihla_enterprise
🌱 Checking if database needs seeding...
✅ Admin user created (admin@rihla.com / admin123)
✅ Standard user created (user@rihla.com / user123)
🎉 Database seeding complete!
🚀 Rihla Backend v2.0 (MongoDB) running on port 5000
```

---

## ✅ Step 7: Verify Setup

1. Test the health endpoint:
   ```
   http://localhost:5000/api/health
   ```

2. Try logging in:
   - Email: `admin@rihla.com`
   - Password: `admin123`

3. **IMPORTANT**: Change your password after first login!

---

## 🔒 Security Features

| Feature | Description |
|---------|-------------|
| **Encryption at Rest** | AES-256 encryption for all stored data |
| **Encryption in Transit** | TLS/SSL for all connections |
| **Password Hashing** | bcrypt with 12 rounds |
| **JWT Tokens** | 7-day expiration (configurable) |
| **IP Whitelisting** | Optional network restrictions |

---

## 🔧 Troubleshooting

### "MongoNetworkError" or timeout
- Check your network access settings in Atlas
- Ensure your IP is whitelisted
- Try adding 0.0.0.0/0 temporarily for testing

### "Authentication failed"
- Verify username and password in connection string
- Make sure to URL-encode special characters in password
- Check Database Access settings

### "Connection string invalid"
- Ensure you replaced `<password>` with actual password
- Check for extra spaces in the `.env` file
- Verify the cluster name is correct

---

## 📊 MongoDB Atlas Dashboard

Access your data through the Atlas UI:

1. Go to **Database** > **Browse Collections**
2. You'll see collections:
   - `users` - Login accounts with hashed passwords
   - `orders` - All transactions
   - `products` - Inventory
   - `customers` - Customer data
   - `employees` - Staff records
   - `brands` - Brand configuration

---

## 🎉 Done!

Your Rihla Hub now has:

- ✅ **Persistent data storage** - No more daily resets!
- ✅ **Encrypted passwords** - Industry-standard bcrypt
- ✅ **7-day login sessions** - No need to login daily
- ✅ **Secure database** - AES-256 encryption
- ✅ **Automatic backups** - Available on paid plans

---

## 📞 Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- MongoDB Community: https://www.mongodb.com/community/forums
