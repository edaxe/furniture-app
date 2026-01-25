# FurnishSnap - Product Requirements Document

## Overview
FurnishSnap is an iOS app that uses AI to detect furniture in photos and shows shoppable product matches from various retailers.

## Core Features

### 1. Furniture Detection
- Users can take photos or select from gallery
- AI detects furniture items in the image
- Bounding boxes highlight detected items
- Confidence scores shown for each detection

### 2. Product Matching
- Tap on detected furniture to see similar products
- 3 product matches shown per item
- Products include:
  - Name and description
  - Price and retailer
  - Similarity score
  - Direct purchase link

### 3. Shopping Lists
- Create rooms to organize saved items
- Save favorite product matches to rooms
- View total cost per room
- Quick access to purchase links

### 4. Freemium Model
- 5 free scans per month
- Pro upgrade for unlimited scans

## Tech Stack

### Mobile (React Native/Expo)
- Expo managed workflow
- React Navigation
- Zustand for state management
- AsyncStorage for persistence

### Backend (Python/FastAPI)
- FastAPI for REST API
- Google Cloud Vision for detection
- Pydantic for validation
- Docker for deployment

## API Endpoints

### Detection
- `POST /api/detect` - Detect furniture in image
- Request: multipart form with image file
- Response: List of detected items with bounding boxes

### Products
- `GET /api/products/match?category={category}` - Get matching products
- Response: List of similar products

### Health
- `GET /health` - Health check

## Future Enhancements
- AR furniture preview
- Price tracking and alerts
- Social sharing
- Retailer affiliate integrations
