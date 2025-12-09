---
name: geo-media
description: GPS 검증, QR, Mapbox, 미디어 처리
---

# Geo & Media

## GPS Verification (Haversine)
```typescript
const haversineDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const verifyGPS = (user, store, threshold = 50) =>
  haversineDistance(user.lat, user.lng, store.lat, store.lng) <= threshold;
```

## QR Code
```typescript
// Generate
import QRCode from 'qrcode';
const qrDataUrl = await QRCode.toDataURL(`zzik://store/${storeId}`);

// Scan (html5-qrcode)
const scanner = new Html5QrcodeScanner("reader", { fps: 10 });
scanner.render(onScanSuccess, onScanFailure);
```

## Mapbox
```tsx
import Map, { Marker } from 'react-map-gl';

<Map
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  initialViewState={{ latitude: 37.5665, longitude: 126.978, zoom: 14 }}
  style={{ width: '100%', height: '100vh' }}
  mapStyle="mapbox://styles/mapbox/dark-v11"
>
  <Marker latitude={lat} longitude={lng} />
</Map>
```

## Media Upload
```typescript
// Compress before upload
import imageCompression from 'browser-image-compression';

const compressed = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920
});

// Upload to Supabase Storage
const { data } = await supabase.storage
  .from('journeys')
  .upload(`${userId}/${Date.now()}.jpg`, compressed);
```
