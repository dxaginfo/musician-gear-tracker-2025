# Musician Gear Tracker

A comprehensive web application designed to help musicians manage their equipment inventory, track maintenance schedules, and monitor the condition of their instruments.

## 📋 Overview

The Musician Gear Tracker is built for professional and amateur musicians who invest significantly in their gear and need to keep it well-maintained and organized. It provides a centralized system for inventory management, maintenance tracking, condition monitoring, and value assessment.

## ✨ Features

### Equipment Inventory Management
- Create detailed equipment records with specifications
- Upload and store equipment photos
- Organize gear by customizable categories
- Search and filter capabilities
- Bulk import/export of inventory data

### Maintenance Tracking
- Schedule routine maintenance with reminders
- Log repair history and costs
- Manage service provider contacts
- Customize maintenance types and intervals
- View upcoming maintenance on calendar

### Condition Monitoring
- Rate equipment condition on a 1-10 scale
- Compare before/after photos
- Track condition history over time
- Flag issues and track resolutions

### Equipment Value Tracking
- Store purchase information
- Estimate current market value
- Calculate depreciation
- Generate insurance documentation
- View total collection value

### Usage Logging
- Log which equipment is used for different events
- Check-out/check-in system for shared equipment
- View usage statistics and analytics
- Save favorite equipment configurations

### Mobile Access
- Responsive design for all devices
- Offline capabilities for basic functions
- Camera integration for quick photo capture
- Barcode/QR code scanning for quick lookup

## 🛠️ Tech Stack

### Front-end
- React.js with TypeScript
- Material-UI
- Redux with Redux Toolkit
- Formik with Yup validation
- Chart.js for data visualization
- React Dropzone for file uploads

### Back-end
- Node.js with Express
- RESTful API with OpenAPI specification
- JWT with OAuth 2.0 for authentication
- Role-based access control

### Database
- PostgreSQL
- AWS S3 for media storage
- Redis for caching

### DevOps
- Docker
- GitHub Actions for CI/CD
- AWS/Google Cloud/Heroku for hosting
- Sentry for error tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (v14+)
- Docker (optional, for containerized deployment)

### Local Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/dxaginfo/musician-gear-tracker-2025.git
   cd musician-gear-tracker-2025
   ```

2. Install dependencies
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables
   ```bash
   # Backend .env file
   cp backend/.env.example backend/.env
   # Edit the .env file with your database credentials and other settings

   # Frontend .env file
   cp frontend/.env.example frontend/.env
   ```

4. Set up the database
   ```bash
   # Run database migrations
   cd backend
   npm run migrate
   
   # (Optional) Seed with sample data
   npm run seed
   ```

5. Start the development servers
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # In a separate terminal, start frontend server
   cd frontend
   npm start
   ```

6. Access the application at `http://localhost:3000`

### Docker Deployment

1. Build and run with Docker Compose
   ```bash
   docker-compose up -d
   ```

2. Access the application at `http://localhost:8080`

## 📂 Project Structure

```
musician-gear-tracker-2025/
├── backend/                  # Server-side code
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   └── app.js            # Express application
│   ├── migrations/           # Database migrations
│   └── tests/                # Backend tests
├── frontend/                 # Client-side code
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux state management
│   │   ├── services/         # API service calls
│   │   ├── styles/           # CSS/SCSS styles
│   │   ├── utils/            # Utility functions
│   │   └── App.tsx           # Root component
│   └── tests/                # Frontend tests
├── docker/                   # Docker configuration
├── docs/                     # Documentation
└── scripts/                  # Utility scripts
```

## 🔒 Security Considerations

- Authentication and authorization implemented with JWT and OAuth 2.0
- Sensitive data encryption for passwords and valuable equipment details
- Regular security audits with vulnerability scanning
- HTTPS/SSL encryption for all communication
- GDPR compliance for user data

## 🔄 Integration Possibilities

- Reverb/eBay API for current market value estimation
- Google Calendar for maintenance scheduling
- Dropbox/Google Drive for additional backup
- Insurance company APIs for coverage verification
- Music venue management systems for usage tracking

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

Project Link: [https://github.com/dxaginfo/musician-gear-tracker-2025](https://github.com/dxaginfo/musician-gear-tracker-2025)