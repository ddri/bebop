# Bebop Setup Guide

This guide provides detailed instructions for setting up the Bebop development environment on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18.x or later recommended)
- **npm** (v9.x or later)
- **MongoDB** (local instance or MongoDB Atlas)
- **Git** for version control

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/bebop.git
cd bebop
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies defined in `package.json`.

## Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### Required Environment Variables

Edit the `.env` file and configure the following variables:

```
# Database
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bebop?retryWrites=true&w=majority"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_your_clerk_secret_key

# S3 Storage (Optional)
S3_ACCESS_KEY=your_s3_access_key
S3_SECRET_KEY=your_s3_secret_key
S3_BUCKET_NAME=your_s3_bucket_name
S3_REGION=your_s3_region
```

### MongoDB Setup

For local development, you can use MongoDB Atlas or run MongoDB locally:

1. **MongoDB Atlas**:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string from Atlas and update the `DATABASE_URL` in your `.env` file

2. **Local MongoDB**:
   - Install MongoDB Community Edition on your machine
   - Start the MongoDB service
   - Set `DATABASE_URL="mongodb://localhost:27017/bebop"`

### Authentication Setup

Bebop uses Clerk for authentication:

1. Create an account at [Clerk](https://clerk.dev/)
2. Create a new application
3. Configure the application with the required settings
4. Get your API keys and update the Clerk environment variables

## Step 4: Database Schema Setup

Initialize the database with Prisma:

```bash
npx prisma generate
npx prisma db push
```

This will set up your database according to the schema defined in `prisma/schema.prisma`.

## Step 5: Start the Development Server

```bash
npm run dev
```

This will start the Next.js development server on [http://localhost:3000](http://localhost:3000).

## Step 6: Building for Production

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify your MongoDB connection string
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Check that the MongoDB service is running if using locally

2. **Missing Environment Variables**:
   - Ensure all required environment variables are set in your `.env` file
   - Restart the development server after changing environment variables

3. **Build Errors**:
   - Clear the Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

4. **Authentication Issues**:
   - Verify your Clerk API keys
   - Check the Clerk dashboard for any configuration issues

## Additional Configuration

### GitHub Integration

To enable GitHub integration:

1. Create a GitHub OAuth App in your GitHub account settings
2. Set the Authorization callback URL to `http://localhost:3000/api/auth/callback/github` for development
3. Configure Clerk to use GitHub as an OAuth provider

### Social Media Integration

For social media integration (Bluesky, Mastodon, etc.):

1. Create developer accounts on the respective platforms
2. Obtain API keys and tokens
3. Add them to your environment variables

## Next Steps

After successfully setting up your development environment:

1. Explore the codebase to understand the structure
2. Try creating a sample topic and collection
3. Test the GitHub integration
4. Review the API documentation to understand available endpoints

For additional help, refer to the [Developer Documentation](./README.md).