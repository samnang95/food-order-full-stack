import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';

const GOOGLE_MAPS_TILES = {
  streets: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
};

export function TrackingMapView({ tracking, className = '' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ restaurant: null, driver: null, destination: null });
  const polylineRef = useRef(null);
  const [mapType, setMapType] = useState('streets');

  const isDarkMode = useMemo(
    () => document.documentElement.classList.contains('dark'),
    []
  );

  // Create custom icons
  const createIcon = useCallback((emoji, bgColor, size = 38) => {
    return L.divIcon({
      className: 'custom-tracking-marker',
      html: `<div style="
        width:${size}px; height:${size}px;
        background:${bgColor};
        border-radius:14px;
        display:flex; align-items:center; justify-content:center;
        font-size:${Math.round(size * 0.5)}px;
        box-shadow: 0 4px 12px ${bgColor}44;
        border: 2px solid white;
        transition: transform 0.3s ease;
      ">${emoji}</div>`,
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

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and polyline when tracking data changes
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
          '<div style="text-align:center;font-weight:800;font-size:12px">BiteCraft Kitchen</div>'
        );
    }

    // Destination marker
    if (!markersRef.current.destination) {
      markersRef.current.destination = L.marker(deliveryCoords, {
        icon: createIcon('📍', '#10b981', 36),
      })
        .addTo(map)
        .bindPopup(
          '<div style="text-align:center;font-weight:800;font-size:12px">Your Location</div>'
        );
    }

    // Driver marker (animate movement)
    if (driverCoords) {
      if (!markersRef.current.driver) {
        markersRef.current.driver = L.marker(driverCoords, {
          icon: createIcon('🛵', '#f97316', 42),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup(
            `<div style="text-align:center;font-weight:800;font-size:12px">${tracking.driverName || 'Driver'}</div>
             <div style="text-align:center;font-size:10px;color:#666">${tracking.formattedEta || 'En route'}</div>`
          );
      } else {
        // Smooth slide animation
        const currentLatLng = markersRef.current.driver.getLatLng();
        const targetLatLng = L.latLng(driverCoords);

        // Only animate if the position actually changed
        if (
          Math.abs(currentLatLng.lat - targetLatLng.lat) > 0.00001 ||
          Math.abs(currentLatLng.lng - targetLatLng.lng) > 0.00001
        ) {
          const steps = 20;
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

      // Route polyline
      const routePoints = [restaurantCoords, driverCoords, deliveryCoords];

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(routePoints);
      } else {
        polylineRef.current = L.polyline(routePoints, {
          color: '#f97316',
          weight: 4,
          opacity: 0.7,
          dashArray: '8, 12',
          smoothFactor: 2,
        }).addTo(map);
      }

      // Fit bounds to show all markers
      const group = L.featureGroup([
        markersRef.current.restaurant,
        markersRef.current.driver,
        markersRef.current.destination,
      ]);
      map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 16 });
    }
  }, [tracking, createIcon]);

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
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[300px] sm:h-[380px] z-0"
        style={{ background: isDarkMode ? '#1e293b' : '#f1f5f9' }}
      />

      {/* Map Type Toggle */}
      <div className="absolute top-3 left-3 z-[500]">
        <div className="flex rounded-xl overflow-hidden border border-white/60 dark:border-slate-600 shadow-md">
          <button
            type="button"
            onClick={() => setMapType('streets')}
            className={`px-3 py-1.5 text-[10px] font-bold transition-colors ${
              mapType === 'streets'
                ? 'bg-orange-500 text-white'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 text-[10px] font-bold transition-colors ${
              mapType === 'satellite'
                ? 'bg-orange-500 text-white'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Live indicator */}
      {tracking?.isLive && (
        <div className="absolute top-3 right-14 z-[500]">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-500/30">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Live</span>
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
