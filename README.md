# 🚗 Tezzo Carpool

**Share the journey, not just the ride.**

Tezzo is a carpooling web app where people can find rides, offer seats in their own car, and travel together sustainably — saving money and cutting down CO₂ emissions.

## ✨ Features

- 🔍 Search for available rides between two cities
- 🚘 Offer a ride and manage seat availability
- 💬 In-app chat with the driver/co-passengers
- ⭐ Driver ratings & reviews
- 📅 Booking management ("My Bookings")
- 🌱 CO₂ savings estimate per shared ride
- 🔔 Ride reminder notifications
- 👤 User profile & authentication

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** (build tool)
- **Tailwind CSS 4**
- **Lucide Icons**, **Motion (Framer Motion)**, **Recharts**

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+ recommended)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the app at `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

The production-ready build will be generated in the `dist/` folder.

## 📁 Project Structure

```
src/
├── components/   # UI components (Header, RideCard, Modals, etc.)
├── data/         # Mock data (rides, reviews)
├── utils/        # Helper utilities (time, CO2 calc, notifications)
├── types.ts      # Shared TypeScript types
├── App.tsx       # Root app component
└── main.tsx      # App entry point
```

## 📝 License

This project is currently unlicensed. Add a license of your choice before making it public if needed.
