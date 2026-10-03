import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

const GOOGLE_MAPS_TILES = {
  streets: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
};

// Calculate heading angle in degrees between two points
function calculateBearing(startLat, startLng, destLat, destLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function TrackingMapView({ tracking, className = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ restaurant: null, driver: null, destination: null });
  const polylinesRef = useRef({ traveled: null, remaining: null });
  const [mapType, setMapType] = useState('streets');
  const [followRider, setFollowRider] = useState(true);
  const [telemetrySpeed, setTelemetrySpeed] = useState(32);
  const prevDriverCoordsRef = useRef(null);

  const isDarkMode = useMemo(
    () => document.documentElement.classList.contains('dark'),
    []
  );

  // Custom marker generator with animated radar rings
  const createIcon = useCallback((emoji, bgColor, size = 38, isDriver = false, heading = 0) => {
    if (isDriver) {
      return L.divIcon({
        className: 'custom-tracking-driver-marker',
        html: `
          <div style="position:relative; width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:${size + 14}px; height:${size + 14}px; border-radius:9999px; background:rgba(249,115,22,0.35); animation:pulse 1.8s ease-in-out infinite;"></div>
            <div style="position:relative; width:${size}px; height:${size}px; background:${bgColor}; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:${Math.round(size * 0.52)}px; box-shadow:0 6px 16px rgba(249,115,22,0.5); border:2.5px solid #ffffff; transform: rotate(${heading > 90 && heading < 270 ? '0deg' : '0deg'}); transition:transform 0.3s ease;">
              ${emoji}
            </div>
            <div style="position:absolute; bottom:-6px; right:-4px; width:14px; height:14px; border-radius:9999px; background:#10b981; border:2px solid #ffffff; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    }

    return L.divIcon({
      className: 'custom-tracking-marker',
      html: `
        <div style="
          width:${size}px; height:${size}px;
          background:${bgColor};
          border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          font-size:${Math.round(size * 0.5)}px;
          box-shadow: 0 4px 12px ${bgColor}55;
          border: 2px solid white;
          transition: transform 0.3s ease;
        ">${emoji}</div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [11.5564, 104.9282],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer(GOOGLE_MAPS_TILES.streets, {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
    }).addTo(map);

    // If user drags the map manually, pause auto-follow camera
    map.on('dragstart', () => {
      setFollowRider(false);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Recenter map on driver
  const handleRecenterRider = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !tracking?.driverLat || !tracking?.driverLng) return;
    setFollowRider(true);
    map.panTo([tracking.driverLat, tracking.driverLng], { animate: true, duration: 0.8 });
  }, [tracking]);

  // Fit all markers in view
  const handleFitAll = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setFollowRider(false);
    const validMarkers = Object.values(markersRef.current).filter(Boolean);
    if (validMarkers.length > 0) {
      const group = L.featureGroup(validMarkers);
      map.fitBounds(group.getBounds().pad(0.18), { maxZoom: 16 });
    }
  }, []);

  // Update markers, animated movement, and polyline routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tracking) return;

    const restaurantCoords = [
      tracking.restaurantLat || 11.5564,
      tracking.restaurantLng || 104.9282,
    ];
    const deliveryCoords = [
      tracking.deliveryLat || 11.5510,
      tracking.deliveryLng || 104.9250,
    ];
    const driverCoords =
      tracking.driverLat && tracking.driverLng
        ? [tracking.driverLat, tracking.driverLng]
        : null;

    // Restaurant marker
    if (!markersRef.current.restaurant) {
      markersRef.current.restaurant = L.marker(restaurantCoords, {
        icon: createIcon('🍽️', '#ef4444', 36),
      })
        .addTo(map)
        .bindPopup(
          '<div style="text-align:center;font-weight:800;font-size:12px">BiteCraft Kitchen</div><div style="font-size:10px;color:#666">Order dispatched</div>'
        );
    }

    // Destination marker
    if (!markersRef.current.destination) {
      markersRef.current.destination = L.marker(deliveryCoords, {
        icon: createIcon('📍', '#10b981', 36),
      })
        .addTo(map)
        .bindPopup(
          '<div style="text-align:center;font-weight:800;font-size:12px">Delivery Address</div><div style="font-size:10px;color:#666">Your Doorstep</div>'
        );
    }

    // Driver marker with smooth coordinate animation
    if (driverCoords) {
      let heading = 0;
      if (prevDriverCoordsRef.current) {
        heading = calculateBearing(
          prevDriverCoordsRef.current[0],
          prevDriverCoordsRef.current[1],
          driverCoords[0],
          driverCoords[1]
        );
      } else {
        heading = calculateBearing(
          driverCoords[0],
          driverCoords[1],
          deliveryCoords[0],
          deliveryCoords[1]
        );
      }
      prevDriverCoordsRef.current = driverCoords;

      // Simulated speed variance
      setTelemetrySpeed(Math.floor(26 + Math.random() * 9));

      if (!markersRef.current.driver) {
        markersRef.current.driver = L.marker(driverCoords, {
          icon: createIcon('🛵', '#f97316', 44, true, heading),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup(
            `<div style="text-align:center;font-weight:800;font-size:12px">${tracking.driverName || 'Driver'}</div>
             <div style="text-align:center;font-size:10px;color:#666">${tracking.formattedEta || 'En route'} • ${tracking.formattedDistance || ''}</div>`
          );

        // Initial fit bounds
        const group = L.featureGroup([
          markersRef.current.restaurant,
          markersRef.current.driver,
          markersRef.current.destination,
        ]);
        map.fitBounds(group.getBounds().pad(0.18), { maxZoom: 16 });
      } else {
        // Update driver icon with new heading
        markersRef.current.driver.setIcon(createIcon('🛵', '#f97316', 44, true, heading));

        // Smooth slide animation
        const currentLatLng = markersRef.current.driver.getLatLng();
        const targetLatLng = L.latLng(driverCoords);

        if (
          Math.abs(currentLatLng.lat - targetLatLng.lat) > 0.00001 ||
          Math.abs(currentLatLng.lng - targetLatLng.lng) > 0.00001
        ) {
          const steps = 24;
          const latStep = (targetLatLng.lat - currentLatLng.lat) / steps;
          const lngStep = (targetLatLng.lng - currentLatLng.lng) / steps;
          let step = 0;

          const animateMarker = () => {
            if (step >= steps) return;
            step++;
            const newLat = currentLatLng.lat + latStep * step;
            const newLng = currentLatLng.lng + lngStep * step;
            markersRef.current.driver?.setLatLng([newLat, newLng]);
            requestAnimationFrame(animateMarker);
          };
          requestAnimationFrame(animateMarker);
        }

        markersRef.current.driver.setPopupContent(
          `<div style="text-align:center;font-weight:800;font-size:12px">${tracking.driverName || 'Driver'}</div>
           <div style="text-align:center;font-size:10px;color:#666">${tracking.formattedEta || 'En route'} ${tracking.formattedDistance ? `• ${tracking.formattedDistance}` : ''}</div>`
        );
      }

      // Smooth camera pan if followRider is active
      if (followRider) {
        map.panTo(driverCoords, { animate: true, duration: 0.6 });
      }

      // Dual-tone route polylines: Traveled (solid orange) vs Remaining (dashed emerald)
      const traveledPath = [restaurantCoords, driverCoords];
      const remainingPath = [driverCoords, deliveryCoords];

      if (polylinesRef.current.traveled) {
        polylinesRef.current.traveled.setLatLngs(traveledPath);
      } else {
        polylinesRef.current.traveled = L.polyline(traveledPath, {
          color: '#ea580c',
          weight: 5,
          opacity: 0.85,
          smoothFactor: 1,
        }).addTo(map);
      }

      if (polylinesRef.current.remaining) {
        polylinesRef.current.remaining.setLatLngs(remainingPath);
      } else {
        polylinesRef.current.remaining = L.polyline(remainingPath, {
          color: '#10b981',
          weight: 4,
          opacity: 0.75,
          dashArray: '6, 10',
          smoothFactor: 1,
        }).addTo(map);
      }
    }
  }, [tracking, createIcon, followRider]);

  // Switch tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(GOOGLE_MAPS_TILES[mapType], {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
    }).addTo(map);
  }, [mapType]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[320px] sm:h-[420px] z-0"
        style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}
      />

      {/* Top Left: Map Style Toggle */}
      <div className="absolute top-3.5 left-3.5 z-[500] flex items-center gap-2">
        <div className="flex rounded-xl overflow-hidden border border-white/60 dark:border-slate-700 shadow-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-0.5">
          <button
            type="button"
            onClick={() => setMapType('streets')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
              mapType === 'streets'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Street Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
              mapType === 'satellite'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Top Right: Live GPS Badge & Camera Follow Toggle */}
      <div className="absolute top-3.5 right-14 z-[500] flex items-center gap-2">
        {tracking?.isLive && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>LIVE GPS</span>
          </div>
        )}
      </div>

      {/* Floating Camera Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2">
        {/* Recenter on Rider / Follow Rider */}
        <button
          type="button"
          onClick={handleRecenterRider}
          className={`px-3 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer border ${
            followRider
              ? 'bg-orange-500 text-white border-orange-400 shadow-orange-500/30'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Center camera on moving rider"
        >
          <span>🎯</span>
          <span className="text-[11px]">{followRider ? 'Locking Rider' : 'Follow Rider'}</span>
        </button>

        {/* View Full Route */}
        <button
          type="button"
          onClick={handleFitAll}
          className="px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer text-center"
          title="View entire delivery route"
        >
          View Full Route
        </button>
      </div>

      {/* Bottom Left: Live Telemetry HUD */}
      {tracking?.driverName && (
        <div className="absolute bottom-4 left-4 z-[500] max-w-[240px] sm:max-w-xs">
          <div className="px-3.5 py-2.5 rounded-2xl bg-slate-950/85 text-white border border-slate-800/80 shadow-xl backdrop-blur-md flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              🛵
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white truncate">{tracking.driverName}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded">
                  {telemetrySpeed} km/h
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {tracking.formattedDistance ? `${tracking.formattedDistance} away` : 'En route to your location'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

TrackingMapView.propTypes = {
  tracking: PropTypes.object,
  className: PropTypes.string,
};
