# Odaville Website

## Deployment Instructions

### Prerequisites
- A Vercel account
- A MongoDB database (you can use MongoDB Atlas)
- Node.js and npm installed locally for development

### Deployment Steps

1. **Fork or Clone the Repository**
   ```bash
   git clone <repository-url>
   cd odaville
   ```

2. **Set Up MongoDB**
   - Create a MongoDB database (preferably on MongoDB Atlas)
   - Get your MongoDB connection string

3. **Deploy to Vercel**

   #### Main Website Deployment
   1. Create a new project on Vercel
   2. Connect your repository
   3. Configure the following environment variables:
      - `MONGODB_URI`: Your MongoDB connection string
      - `NODE_ENV`: Set to "production"
      - `FRONTEND_URL`: Your main website URL (will be available after first deploy)
      - `ADMIN_URL`: Your admin panel URL (will be available after admin panel deploy)
      - `JWT_SECRET`: A secure random string for JWT token generation
   4. Deploy the project

   #### Admin Panel Deployment
   1. Create a second project on Vercel
   2. Connect the same repository
   3. Set the following environment variables (same as main website)
   4. In the project settings:
      - Set the Production Branch to `main`
      - Set the Root Directory to `frontend/admin`
   5. Deploy the project

4. **Update CORS Settings**
   After both deployments are complete:
   1. Go to your main website project settings in Vercel
   2. Update the `FRONTEND_URL` and `ADMIN_URL` environment variables with the actual URLs
   3. Redeploy the project/

### Development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the values
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### File Structure
```
/
├── frontend/          # Main website frontend
│   └── admin/        # Admin panel frontend
├── backend/          # Backend API
├── vercel.json       # Vercel configuration
└── .env.example      # Example environment variables
```

### Important Notes
- The main website and admin panel are deployed as separate Vercel projects
- Both share the same backend API
- Make sure to set up proper CORS settings in the environment variables
- File uploads in production should use a cloud storage solution like AWS S3 