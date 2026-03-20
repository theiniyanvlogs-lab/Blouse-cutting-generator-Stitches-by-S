# Blouse Cutting Drawing Generator

A React + Vite app that converts tailoring measurements into a simple blouse cutting drawing (Front, Back, Sleeve) using SVG.

## Features
- Enter blouse measurements
- Auto-calculate tailoring formulas
- Generate front / back / sleeve cutting drawing
- Download as PNG
- Download as PDF
- Works on GitHub + Vercel

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy on Vercel
1. Push this project to GitHub
2. Go to Vercel
3. Import GitHub repo
4. Framework preset: Vite
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy

## Tailor formulas used
- Back shoulder = SH / 2 - 1.25
- Front shoulder = SH / 2 - 1.75
- Back chest = UCH / 4 + 0.75
- Front chest = UCH / 4 + 0.25
- Armhole = (Arm Round + 0.5) / 2
- Waist + ease = W / 4 + 1.5
- Sleeve X = Arm Round / 2 - 1
- Sleeve Y = X / 2

## Future upgrades
- Princess cut
- Churidar pattern
- Frock pattern
- Neck style presets
- Dart control
- Seam allowance outer offset
