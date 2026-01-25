# FurnishSnap

An iOS app that uses AI to detect furniture in photos and shows shoppable product matches from various retailers.

## Features

- **Furniture Detection** - Take photos or select from gallery, AI detects furniture items with bounding boxes
- **Product Matching** - Tap detected items to see similar products with prices and purchase links
- **Shopping Lists** - Organize saved items by room, track total costs
- **Freemium Model** - 5 free scans per month

## Tech Stack

### Mobile (React Native/Expo)
- Expo managed workflow
- React Navigation (tabs + stack)
- Zustand for state management
- AsyncStorage for persistence

### Backend (Python/FastAPI)
- FastAPI REST API
- Google Cloud Vision (mock mode for development)
- Pydantic validation
- Docker support

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Xcode (for iOS Simulator)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### Mobile Setup

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start --ios
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/detect` | POST | Detect furniture in image (multipart form) |
| `/api/products/match` | GET | Get matching products by category |

### Example: Get Product Matches

```bash
curl "http://localhost:8000/api/products/match?category=sofa"
```

## Project Structure

```
furniture-app/
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API calls
│   │   ├── store/         # Zustand stores
│   │   └── navigation/    # React Navigation
│   └── App.tsx
├── backend/                # FastAPI server
│   ├── app/
│   │   ├── routers/       # API routes
│   │   ├── services/      # Business logic
│   │   ├── models/        # Pydantic models
│   │   └── data/          # Mock data
│   └── requirements.txt
└── prd.md                  # Product requirements
```

## Configuration

### Backend Environment Variables

Copy `.env.example` to `.env`:

```bash
# Enable real Google Cloud Vision (default: mock mode)
USE_MOCK_DETECTION=false
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Mobile API URL

Update `app.json` for production:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api-domain.com"
    }
  }
}
```

## License

MIT
