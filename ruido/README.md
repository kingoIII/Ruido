# ruido - Sound Library Platform

A modern, black-themed sound library platform built with React, TypeScript, and Three.js, similar to Splice. Features include audio visualization, sample management, and a sleek dark interface.

## 🚀 Features

- **Black Theme Design**: Sleek, modern dark interface with purple accents
- **Three.js Audio Visualization**: Real-time 3D audio visualizations with multiple modes
- **Sample Management**: Upload, organize, and manage audio samples
- **Library Browser**: Browse and search through audio samples with filters
- **Audio Player**: Built-in audio player with playlist support
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works on desktop and mobile devices
- **Ready for Backend Integration**: Complete API service layer ready for server connection

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **UI Components**: Tailwind CSS, Radix UI, shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Audio**: Web Audio API integration

## 📁 Project Structure

```
ruido/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── Header.tsx    # Main header component
│   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   ├── Dashboard.tsx # Dashboard page
│   │   ├── Library.tsx   # Sample library page
│   │   ├── Upload.tsx    # File upload page
│   │   └── AudioVisualizer.tsx # 3D audio visualizer
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── AudioPlayerContext.tsx # Audio player context
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts    # Authentication hook
│   │   └── useAudioPlayer.ts # Audio player hook
│   ├── services/         # API services
│   │   └── api.ts        # Main API service
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # All type definitions
│   ├── utils/            # Utility functions
│   │   └── audio.ts      # Audio processing utilities
│   ├── App.tsx           # Main app component
│   ├── App.css           # Global styles
│   ├── main.tsx          # App entry point
│   └── index.css         # Base styles
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ruido
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint
- `pnpm run mock:api` - Start local JSON server using `db.json`

## 🔧 Backend Integration

The application is structured to easily connect to backend services. Here's how to integrate:

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=https://your-api-server.com/api
REACT_APP_UPLOAD_URL=https://your-api-server.com/upload
```

### 2. API Service Configuration

The `src/services/api.ts` file contains all API calls. Key endpoints to implement on your backend:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

#### Samples
- `GET /samples` - Get samples with pagination and filters
- `GET /samples/:id` - Get single sample
- `POST /upload/sample` - Upload new sample
- `PUT /samples/:id` - Update sample
- `DELETE /samples/:id` - Delete sample
- `POST /samples/:id/favorite` - Favorite sample
- `GET /samples/:id/download` - Download sample

#### Packs
- `GET /packs` - Get sample packs
- `POST /packs` - Create new pack
- `PUT /packs/:id` - Update pack
- `DELETE /packs/:id` - Delete pack

#### Playlists
- `GET /playlists` - Get user playlists
- `POST /playlists` - Create playlist
- `PUT /playlists/:id` - Update playlist
- `DELETE /playlists/:id` - Delete playlist

### 3. Database Schema

Recommended database tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Audio samples table
CREATE TABLE audio_samples (
  id UUID PRIMARY KEY,
  title VARCHAR,
  artist VARCHAR,
  filename VARCHAR,
  duration FLOAT,
  bpm INTEGER,
  key VARCHAR,
  genre VARCHAR,
  tags TEXT[],
  description TEXT,
  audio_url VARCHAR,
  waveform_url VARCHAR,
  user_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Sample packs table
CREATE TABLE audio_packs (
  id UUID PRIMARY KEY,
  title VARCHAR,
  artist VARCHAR,
  description TEXT,
  cover_image_url VARCHAR,
  genre VARCHAR,
  bpm VARCHAR,
  tags TEXT[],
  user_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Pack samples relationship
CREATE TABLE pack_samples (
  pack_id UUID REFERENCES audio_packs(id),
  sample_id UUID REFERENCES audio_samples(id),
  PRIMARY KEY (pack_id, sample_id)
);
```

## ☁️ Cloud Storage Integration

### File Upload Configuration

The upload system supports various cloud storage providers:

#### AWS S3
```typescript
// In your backend API
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Upload endpoint
app.post('/upload/sample', upload.single('audio'), async (req, res) => {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `samples/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  };
  
  const result = await s3.upload(uploadParams).promise();
  // Save to database with result.Location as audio_url
});
```

#### Google Cloud Storage
```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
```

#### Azure Blob Storage
```typescript
import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
```

## 🎨 Customization

### Theme Colors

The black theme uses these primary colors defined in `src/App.css`:

- **Background**: `#000000` (Pure black)
- **Cards/Panels**: `#1f2937` (Dark gray)
- **Borders**: `#374151` (Medium gray)
- **Primary Accent**: `#8b5cf6` (Purple)
- **Text**: `#ffffff` (White)
- **Secondary Text**: `#9ca3af` (Light gray)

### Adding New Visualizer Types

To add new 3D visualizations, edit `src/components/AudioVisualizer.tsx`:

```typescript
// Add new visualizer type
const MyCustomVisualizer: React.FC<{ audioData: number[] }> = ({ audioData }) => {
  // Your Three.js visualization logic here
  return <mesh>...</mesh>
}

// Add to the renderVisualizer function
const renderVisualizer = () => {
  switch (visualizerType) {
    case 'custom':
      return <MyCustomVisualizer audioData={audioData} />
    // ... other cases
  }
}
```

## 🔐 Security Considerations

1. **Authentication**: Implement JWT tokens for secure authentication
2. **File Validation**: Validate audio file types and sizes on upload
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **CORS**: Configure CORS properly for your domain
5. **Content Security Policy**: Set up CSP headers
6. **File Scanning**: Scan uploaded files for malware

## 📱 Mobile Responsiveness

The application is built with mobile-first design principles:

- Responsive grid layouts
- Touch-friendly controls
- Optimized Three.js performance for mobile
- Adaptive navigation for smaller screens

## 🚀 Deployment

### Frontend Deployment

1. Build the application:
```bash
pnpm run build
```

2. Deploy the `dist` folder to your hosting provider:
   - **Vercel**: Connect your GitHub repo
   - **Netlify**: Drag and drop the `dist` folder
   - **AWS S3 + CloudFront**: Upload to S3 bucket
   - **Firebase Hosting**: Use Firebase CLI

### Backend Deployment

Recommended backend deployment options:
- **Node.js**: Express.js or Fastify
- **Python**: FastAPI or Django
- **Go**: Gin or Echo
- **Cloud Functions**: AWS Lambda, Google Cloud Functions
- **Containers**: Docker with Kubernetes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments for implementation details

---

**Built with ❤️ for the audio community**

