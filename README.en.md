# Google Maps Data Collector

[中文版](./readme.md)

A Google Maps data collection tool developed with Next.js + TypeScript + React, using SerpApi's Google Maps API for map searches and comment retrieval.

## Features

### 🔍 Map Search
- Search for locations on Google Maps based on keywords and regions
- Support for Chinese search and result display
- Real-time display of search result count

### 📍 Location Details
- View detailed information about locations (address, phone, website, business hours, etc.)
- Display location ratings and number of reviews
- Support for location category tags

### 💬 Review Management
- Retrieve all user reviews for specified locations
- Display reviewer information, ratings, dates, and content
- Support for review image display

### 📊 Data Export
- Export map search results in CSV format
- Export location review data in CSV format
- Support for Chinese field names and data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React + Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **API**: SerpApi Google Maps API

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment Variables

The project includes a `.env.local` file with SerpApi API Key configuration:

```env
NEXT_PUBLIC_SERPAPI_KEY=XXXXXXX
NEXT_PUBLIC_API_BASE_URL=https://serpapi.com/search
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build Production Version

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## User Guide

### Search for Locations

1. Enter keywords on the homepage (e.g., restaurants, coffee shops, hotels)
2. Enter search area (e.g., Beijing Chaoyang District, Shanghai Pudong New District)
3. Click the "Search" button
4. View the search results list

### View Location Details

1. Click on any location card in the search results
2. View detailed information about the location
3. Click "Load Reviews" to get user reviews
4. Browse all review content

### Export Data

#### Export Location Data
- Click the "Export Data" button on the homepage search results page
- Automatically download a CSV file containing all location information

#### Export Review Data
- Click the "Export Reviews" button on the location details page after loading reviews
- Automatically download a CSV file containing all reviews

## API Interfaces

### Google Maps Search API
- **Interface**: `https://serpapi.com/google-maps-api`
- **Purpose**: Search for locations on the map based on keywords and regions
- **Returns**: List of locations, including names, addresses, ratings, etc.

### Google Maps Reviews API
- **Interface**: `https://serpapi.com/google-maps-reviews-api`
- **Purpose**: Retrieve all reviews for a location based on its place_id
- **Returns**: List of reviews, including user information, ratings, content, etc.

## Project Structure

```
chrome-map-datas/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage component
│   └── place/[id]/        # Location details page
│       └── page.tsx
├── lib/                   # Utility library
│   └── api.ts            # API calls and data export functions
├── types/                 # TypeScript type definitions
│   └── index.ts
├── .env.local            # Environment variable configuration
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # Project documentation
```

## Notes

1. **API Limitations**: SerpApi has request frequency limitations, please use reasonably
2. **Data Accuracy**: Search results and review data come from Google Maps, accuracy depends on Google's data
3. **Network Requirements**: Requires a stable network connection to access SerpApi services
4. **Browser Compatibility**: Recommended to use modern browsers (Chrome, Firefox, Safari, Edge)


## License

MIT License