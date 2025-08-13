# Dwellogo Backend API

A comprehensive Node.js backend for the Dwellogo real estate platform featuring JWT authentication, MongoDB with Mongoose, real-time features, and RESTful APIs.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Communication**: Socket.io for virtual tours and negotiations
- **Property Management**: Full CRUD operations for properties with advanced search
- **Virtual Tours**: Live co-touring with chat and navigation sync
- **Maintenance System**: Task management and contractor coordination
- **Negotiation Tools**: Real-time messaging and offer management
- **File Uploads**: Image and document handling with validation
- **Advanced APIs**: Neighborhood analysis, furniture placement, rent calculation

## Quick Start

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**:
   ```bash
   # Using MongoDB Community Edition
   mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name dwellogo-mongo mongo:latest
   ```

4. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

### Database Setup

The application will automatically create collections when first run. For sample data:

```bash
npm run seed
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

#### Auth Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout user

#### Properties Endpoints

- `GET /properties` - Get all properties (with filtering)
- `GET /properties/:id` - Get property by ID
- `POST /properties` - Create property (agents/admins only)
- `PUT /properties/:id` - Update property
- `POST /properties/:id/favorite` - Toggle favorite
- `POST /properties/:id/images` - Upload images
- `GET /properties/:id/similar` - Get similar properties

**Query Parameters for GET /properties**:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `search` - Text search
- `city` - Filter by city
- `state` - Filter by state
- `minPrice`, `maxPrice` - Price range
- `bedrooms` - Minimum bedrooms
- `bathrooms` - Minimum bathrooms
- `propertyType` - Property type filter
- `lat`, `lng`, `radius` - Location-based search

#### Tours Endpoints

- `GET /tours` - Get all tours
- `GET /tours/:id` - Get tour by ID
- `POST /tours` - Create tour
- `POST /tours/:id/join` - Join tour
- `POST /tours/:id/leave` - Leave tour
- `POST /tours/:id/messages` - Add chat message

#### Maintenance Endpoints

- `GET /maintenance` - Get maintenance tasks
- `POST /maintenance` - Create task
- `PUT /maintenance/:id` - Update task
- `DELETE /maintenance/:id` - Delete task

#### Negotiations Endpoints

- `GET /negotiations` - Get negotiations
- `POST /negotiations` - Create negotiation
- `GET /negotiations/:id` - Get negotiation by ID
- `POST /negotiations/:id/messages` - Add message
- `POST /negotiations/:id/offers` - Add offer

#### Tools Endpoints

- `POST /tools/split-rent` - Calculate split rent
- `GET /tools/neighborhood-analysis` - Get neighborhood data
- `GET /tools/furniture-items` - Get furniture catalog
- `POST /tools/furniture-layout` - Save layout

## Real-time Features

The application uses Socket.io for real-time communication:

### Virtual Tour Events
- `join-tour` - Join a tour room
- `tour-navigate` - Sync navigation
- `chat-message` - Tour chat
- `user-joined` - User join notification

### Negotiation Events
- `join-negotiation` - Join negotiation room
- `negotiation-message` - Real-time messages

## Data Models

### User Schema
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: 'user' | 'agent' | 'admin',
  avatar: String,
  preferences: {
    propertyType: [String],
    priceRange: { min: Number, max: Number },
    location: Object
  },
  savedProperties: [ObjectId]
}
```

### Property Schema
```javascript
{
  title: String,
  description: String,
  location: {
    address: Object,
    coordinates: { latitude: Number, longitude: Number }
  },
  features: {
    bedrooms: Number,
    bathrooms: Number,
    sqft: Number,
    propertyType: String
  },
  pricing: {
    listPrice: Number,
    taxes: Object,
    hoa: Object
  },
  media: {
    images: [Object],
    virtualTour: Object
  },
  status: String,
  listingAgent: ObjectId
}
```

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting on all routes
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- File upload validation
- Role-based authorization

## File Uploads

Supports image uploads for properties:
- Maximum file size: 10MB
- Allowed formats: JPEG, PNG, WebP
- Automatic filename generation
- File validation and error handling

## Error Handling

Standardized error responses:
```javascript
{
  success: false,
  message: "Error description",
  errors: [] // Validation errors if applicable
}
```

## Performance Optimization

- Database indexing for search performance
- Pagination for large datasets
- Image compression and optimization
- Connection pooling
- Caching strategies (Redis optional)

## Deployment

### Environment Variables
Set all required environment variables in production:
- `MONGODB_URI` - Production MongoDB connection
- `JWT_SECRET` - Strong secret key
- `CLIENT_URL` - Frontend URL
- Other API keys as needed

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Monitoring
- Health check endpoint: `GET /api/health`
- Logging with Morgan
- Error tracking integration ready

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## Support

For issues and questions:
- Create GitHub issues
- Check API documentation
- Review error logs