# 🚀 Quick Railway Deployment (5 Minutes)

## **Step-by-Step Guide**

### **1. Go to Railway**
- Visit: https://railway.app
- Click "Start a New Project"

### **2. Connect GitHub**
- Click "Deploy from GitHub repo"
- Authorize Railway to access your GitHub
- Select repository: `Emmyegon/2nd-HACKATHON`

### **3. Add Database**
- Click "New" → "Database" → "MySQL"
- Railway will create a free MySQL database
- Copy the connection details

### **4. Set Environment Variables**
In Railway dashboard → Variables tab, add:
```
OPENAI_API_KEY=your_openai_api_key_here
MYSQL_HOST=mysql.railway.internal
MYSQL_USER=root
MYSQL_PASSWORD=TET8gA9AycpFiFYd7KUJtX1chyHSdBbwag
MYSQL_DATABASE=railway
```

### **5. Deploy**
- Railway automatically detects Flask app
- Builds and deploys in 2-3 minutes
- Get your URL: `https://your-app-name.railway.app`

### **6. Access from Phone**
- Open the URL on your phone browser
- Your app is now live and mobile-optimized!

---

## **🎉 That's it! Your app is live and accessible from anywhere!**

**Features available on mobile:**
- ✅ Beautiful spices background
- ✅ User registration/login
- ✅ Ingredient selection
- ✅ AI recipe generation
- ✅ Recipe saving and browsing
- ✅ Responsive design
- ✅ Touch-friendly interface
