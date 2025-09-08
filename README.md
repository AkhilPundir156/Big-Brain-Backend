# Big Brain - Backend

Welcome to the **Big Brain** backend repository!  

This project is the powerhouse behind **Big Brain**, built with **Node.js**, **Express**, and **MongoDB**. It provides secure and scalable APIs for managing and interacting with "Brain Items" and user data, seamlessly powering the Big Brain frontend.  

The backend integrates cutting-edge technologies to enable a rich AI-powered knowledge system:  
- **Vector Database** → for semantic search, embeddings, and intelligent retrieval  
- **Cloudinary** → for optimized image and file storage  
- **Xenova Transformers** → for generating and storing vector embeddings locally  
- **Gemini 2.5 Flash** → for advanced AI integration, summarization, and contextual Q&A  
- **Cross-platform support** → works with Instagram, Twitter (X), YouTube, TikTok, files, images, and general content ingestion  

Together, these components make Big Brain a **personal AI-powered knowledge universe**, capable of:  
- Storing and organizing multi-modal content  
- Summarizing and interacting with documents, videos, and social media links  
- Providing contextual chat over all saved knowledge  


---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/big-brain-backend.git
cd big-brain
```
### 2. Install dependencies
```
npm install
# or
yarn install
```
### 3. Set up environment variables
Create a .env file in the root with the following variables:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/bigbrain
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
OPENAI_API_KEY = YOUR OPEN API KEY
CLIENT_URL = "http://localhost:3001"
GOOGLE_CLIENT_ID = google_client_id for oauth
GOOGLE_CLIENT_SECRET = google client secret
GOOGLE_CALLBACK_URL = "http://localhost:3000/api/v1/user/auth/google/callback"
CLOUDINARY_URL = cloudinary url for file upload
```
### 4. Start the development server
```
npm run start
# or
yarn start
```
---
### 📁 Project Structure
```
src/
├─ config/        # environment setup
├─ connectDB      # DB Connection
├─ controllers/   # Route controllers (Brain, User, etc.)
├─ middleware/    # Auth & validation middlewares
├─ models/        # Mongoose models (Brain, User, etc.)
├─ OAuth          # Google Authentication
├─ routes/        # API routes
├─ Types          # Types
├─ utils/         # Helpers & services
└─ server.js      # Entry point and Express App
```
---
### 🤝 Contributing
We welcome contributions! Please follow these steps:
#### 1. Pick an issue from the repository issues list.
#### 2. Create a branch:
```
main-issue-name-your-name

Example:
main-fix-auth-bug-alex
```
#### 3. Make changes following project conventions.
#### 4. Commit changes using structured messages with tags.
```
[FIX] big_brain_backend: fixed auth middleware
- updated JWT validation
- removed unused imports

[ADD] big_brain_backend: added new brain sharing endpoint

[REM] big_brain_backend: removed deprecated routes

[REF] big_brain_backend: refactored user service

[IMP] big_brain_backend: improved query performance
```
#### 5. Push your branch.
```
git push origin main-issue-name-your-name
```
#### 6. Create a Pull Request on GitHub and reference the issue.
---
Please ensure your commit message and PR description clearly explain your changes.
Thank you for contributing to Big Brain! 🎉
## Thanks!
