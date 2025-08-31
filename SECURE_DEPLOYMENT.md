# 🔒 Secure Recipe Recommender Deployment Guide

## 🎯 **Overview**

This setup separates your frontend and backend for maximum security:
- **Backend Server**: Handles API keys, database, and AI processing
- **Frontend**: Simple HTML file that connects to the backend
- **No API keys exposed** in the frontend code

## 🚀 **Quick Deployment Steps**

### **1. Deploy Backend to Railway (FREE)**

1. **Go to** [Railway.app](https://railway.app)
2. **Sign up** with GitHub
3. **Click** "New Project" → "Deploy from GitHub repo"
4. **Connect** your repository
5. **Add Environment Variables:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SECRET_KEY=your_secret_key_here
   DATABASE_URL=your_database_url_here
   ```
6. **Deploy** automatically!

### **2. Deploy Frontend (Multiple Options)**

#### **Option A: GitHub Pages (FREE)**
1. **Push** `frontend.html` to your GitHub repository
2. **Go to** repository Settings → Pages
3. **Select** "Deploy from a branch"
4. **Choose** main branch and `/ (root)` folder
5. **Save** - your app will be live at `https://yourusername.github.io/Recipe`

#### **Option B: Netlify (FREE)**
1. **Go to** [Netlify.com](https://netlify.com)
2. **Drag and drop** `frontend.html` file
3. **Your app is live** instantly!

#### **Option C: Vercel (FREE)**
1. **Go to** [Vercel.com](https://vercel.com)
2. **Import** your GitHub repository
3. **Deploy** automatically

## 🔧 **Environment Variables Setup**

### **For Railway Backend:**
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=your-database-connection-string
```

### **Database Options:**
- **PlanetScale** (FREE): `mysql://username:password@host/database`
- **Railway PostgreSQL** (FREE): Auto-generated when you add PostgreSQL service
- **SQLite** (Local): `sqlite:///recipe_db.sqlite`

## 📁 **File Structure**

```
recipe-recommender/
├── backend_server.py      # Secure backend with API keys
├── frontend.html          # Simple frontend (no API keys)
├── requirements.txt       # Python dependencies
├── .gitignore            # Protects sensitive files
└── README.md             # Documentation
```

## 🌐 **How It Works**

1. **Frontend** (`frontend.html`) runs in the browser
2. **Backend** (`backend_server.py`) runs on Railway
3. **Frontend** makes API calls to backend
4. **Backend** handles OpenAI API calls securely
5. **No API keys** are exposed to the frontend

## 🔒 **Security Features**

- ✅ **API keys stored** only on backend server
- ✅ **Environment variables** for sensitive data
- ✅ **CORS enabled** for cross-origin requests
- ✅ **Input validation** on all endpoints
- ✅ **Error handling** with fallback recipes
- ✅ **Password hashing** for user security

## 🎯 **Deployment Commands**

### **Push to GitHub (Safe - No API Keys):**
```bash
git add backend_server.py frontend.html requirements.txt .gitignore
git commit -m "Add secure backend and frontend"
git push origin main
```

### **Deploy Backend:**
1. **Railway** will automatically detect Python app
2. **Install dependencies** from `requirements.txt`
3. **Run** `backend_server.py`
4. **Set environment variables** in Railway dashboard

### **Deploy Frontend:**
1. **Upload** `frontend.html` to any static hosting
2. **Update** backend URL in frontend if needed
3. **Test** connection to backend

## 🌟 **Benefits of This Approach**

### **Security:**
- 🔒 **API keys never exposed** to frontend
- 🔒 **Backend handles** all sensitive operations
- 🔒 **Environment variables** for configuration

### **Scalability:**
- 📈 **Backend can scale** independently
- 📈 **Frontend can be** hosted anywhere
- 📈 **Database can be** upgraded separately

### **Maintenance:**
- 🔧 **Easy to update** backend without touching frontend
- 🔧 **Frontend can be** cached by CDN
- 🔧 **Backend can be** monitored and logged

## 🎉 **Your App Will Be:**

- ✅ **Completely secure** - API keys protected
- ✅ **Accessible worldwide** - via any browser
- ✅ **Easy to maintain** - separate frontend/backend
- ✅ **Scalable** - can handle many users
- ✅ **FREE to host** - using free tiers

## 🔗 **Example URLs:**

- **Frontend**: `https://yourusername.github.io/Recipe`
- **Backend**: `https://your-app-name.railway.app`
- **API Health**: `https://your-app-name.railway.app/api/health`

## 🚀 **Ready to Deploy!**

1. **Push** your code to GitHub (safe - no API keys)
2. **Deploy backend** to Railway
3. **Deploy frontend** to GitHub Pages/Netlify/Vercel
4. **Set environment variables** in Railway
5. **Test** your secure Recipe Recommender!

**Your Recipe Recommender will be live and secure!** 🌟
