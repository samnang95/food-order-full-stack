import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { useTranslation } from '../../../core';

// Phnom Penh district fallback coordinates
const DISTRICT_COORDINATES = {
  'bkk': [11.5510, 104.9250],
  'boeng keng kang': [11.5510, 104.9250],
  'daun penh': [11.5720, 104.9250],
  'chamkarmon': [11.5380, 104.9200],
  'toul kork': [11.5780, 104.8950],
  'tuol kouk': [11.5780, 104.8950],
  'tuol tom poung': [11.5380, 104.9120],
  '7 makara': [11.5650, 104.9150],
  'chroy changvar': [11.5950, 104.9350],
};

function getDeliveryCoords(order, driverLoc) {
  if (driverLoc?.deliveryLat && driverLoc?.deliveryLng) {
    return [driverLoc.deliveryLat, driverLoc.deliveryLng];
  }
  const address = (order?.deliveryAddress || '').toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (address.includes(key)) {
      return coords;
    }
  }
  // Default to central Phnom Penh (BKK1 area)
  return [11.5520, 104.9240];
}

function getRestaurantCoords(driverLoc) {
  if (driverLoc?.restaurantLat && driverLoc?.restaurantLng) {
    return [driverLoc.restaurantLat, driverLoc.restaurantLng];
  }
  // BiteCraft Flagship Kitchen in central Phnom Penh
  return [11.5564, 104.9282];
}

export function DeliveryMapCard({ order, driverLoc }) {
  const { t, isKhmer } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ restaurant: null, driver: null, destination: null });
  const polylinesRef = useRef({ completed: null, remaining: null });
  const tileLayerRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [callAlert, setCallAlert] = useState(false);

  // Status computation
  const status = (order?.status || '').toLowerCase();
  const isOutForDelivery = status === 'out_for_delivery';
  const isDelivered = status === 'delivered';

  const restaurantCoords = useMemo(() => getRestaurantCoords(driverLoc), [driverLoc]);
  const destinationCoords = useMemo(() => getDeliveryCoords(order, driverLoc), [order, driverLoc]);

  // Current rider location
  const riderCoords = useMemo(() => {
    if (isDelivered) return destinationCoords;
    if (driverLoc?.lat && driverLoc?.lng) return [driverLoc.lat, driverLoc.lng];
    if (isOutForDelivery) {
      // Interpolate mid-way if no live coordinates received yet
      return [
        (restaurantCoords[0] + destinationCoords[0]) / 2,
        (restaurantCoords[1] + destinationCoords[1]) / 2,
      ];
    }
    return restaurantCoords;
  }, [driverLoc, isDelivered, isOutForDelivery, restaurantCoords, destinationCoords]);

  // Listen to dark mode changes on <html>
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Update map tile layer when dark mode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);
  }, [isDarkMode]);

  // Create custom DivIcons
  const createIcons = useCallback((heading = 0) => {
    const restaurantIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(249, 115, 22, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 12px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4); border: 2px solid white; font-size: 15px;">
            👨‍🍳
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const destinationIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(16, 185, 129, 0.25); animation: pulse 2s infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #059669); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); border: 2px solid white; font-size: 15px;">
            🏠
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const driverIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 9999px; background: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 36px; height: 36px; border-radius: 9999px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5); border: 2.5px solid white; font-size: 18px; transform: rotate(${heading}deg); transition: transform 0.4s ease;">
            🛵
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    return { restaurantIcon, destinationIcon, driverIcon };
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // Custom compact zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer
    const isDark = document.documentElement.classList.contains('dark');
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
    }).addTo(map);

    const { restaurantIcon, destinationIcon, driverIcon } = createIcons(driverLoc?.heading || 0);

    // Restaurant marker
    markersRef.current.restaurant = L.marker(restaurantCoords, { icon: restaurantIcon })
      .addTo(map)
      .bindTooltip(t('orders.restaurantLocation'), { permanent: false, direction: 'top' });

    // Destination marker
    markersRef.current.destination = L.marker(destinationCoords, { icon: destinationIcon })
      .addTo(map)
      .bindTooltip(order?.deliveryAddress || t('orders.deliveryLocation'), {
        permanent: false,
        direction: 'top',
      });

    // Rider marker
    markersRef.current.driver = L.marker(riderCoords, { icon: driverIcon })
      .addTo(map)
      .bindTooltip(t('orders.driverOnTheWay'), { permanent: false, direction: 'top' });

    // Polylines
    polylinesRef.current.completed = L.polyline([restaurantCoords, riderCoords], {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.85,
    }).addTo(map);

    polylinesRef.current.remaining = L.polyline([riderCoords, destinationCoords], {
      color: '#f97316',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85,
    }).addTo(map);

    // Fit bounds to include all markers
    const bounds = L.latLngBounds([restaurantCoords, destinationCoords, riderCoords]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [createIcons, destinationCoords, driverLoc?.heading, order?.deliveryAddress, restaurantCoords, riderCoords, t]);

  // Update positions dynamically when rider moves or order updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Update restaurant position
    if (markersRef.current.restaurant) {
      markersRef.current.restaurant.setLatLng(restaurantCoords);
    }

    // Update destination position
    if (markersRef.current.destination) {
      markersRef.current.destination.setLatLng(destinationCoords);
    }

    // Update driver position and icon heading
    if (markersRef.current.driver) {
      markersRef.current.driver.setLatLng(riderCoords);
      const { driverIcon } = createIcons(driverLoc?.heading || 0);
      markersRef.current.driver.setIcon(driverIcon);
    }

    // Update polylines
    if (polylinesRef.current.completed) {
      polylinesRef.current.completed.setLatLngs([restaurantCoords, riderCoords]);
    }
    if (polylinesRef.current.remaining) {
      polylinesRef.current.remaining.setLatLngs([riderCoords, destinationCoords]);
    }
  }, [riderCoords, restaurantCoords, destinationCoords, driverLoc?.heading, createIcons]);

  // Recenter button action
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([restaurantCoords, destinationCoords, riderCoords]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  };

  const etaMinutes = driverLoc?.eta !== undefined ? driverLoc.eta : isDelivered ? 0 : 8;
  const progressPercent = Math.round(
    driverLoc?.progress !== undefined
      ? driverLoc.progress * 100
      : isDelivered
      ? 100
      : isOutForDelivery
      ? 50
      : 0
  );

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-0 transition-all">
      {/* Card Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2.5 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-lg shadow-md shadow-orange-500/25">
            🛵
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>{t('orders.mapTitle')}</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{t('orders.gpsConnected')}</span>
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
              {t('orders.mapSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRecenter}
            type="button"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95 shadow-xs"
            title={t('orders.recenterMap')}
          >
            <span>🎯</span>
            <span className="hidden sm:inline">{t('orders.recenterMap')}</span>
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-72 sm:h-96 bg-slate-100 dark:bg-slate-800">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating ETA Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center space-x-2.5">
          <span className="text-xl">⚡</span>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-tight">
              {t('orders.estimatedArrival')}
            </span>
            <span className="text-xs sm:text-sm font-black text-orange-600 dark:text-orange-400 leading-tight">
              {isDelivered
                ? t('orders.statusDelivered')
                : etaMinutes <= 1
                ? (isKhmer ? 'កំពុងមកដល់ភ្លាមៗ' : 'Arriving now!')
                : `${etaMinutes} ${t('common.mins')}`}
            </span>
          </div>
        </div>

        {/* Live Distance Progress Bar Overlay */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-80 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center space-x-1">
              <span>{isDelivered ? '🎉' : '🛵'}</span>
              <span>{isDelivered ? t('orders.driverDelivered') : t('orders.riderMoving')}</span>
            </span>
            <span className="text-orange-600 dark:text-orange-400 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 h-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Driver Information Footer Card */}
      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/25 shrink-0">
              🛵
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {t('orders.driverOnTheWay')}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('orders.driverVehicle')}
              {driverLoc?.lat && driverLoc?.lng && (
                <span className="hidden md:inline text-slate-400 ml-1.5 font-mono">
                  ({driverLoc.lat.toFixed(4)}, {driverLoc.lng.toFixed(4)})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Call Driver Button */}
        <div className="w-full sm:w-auto flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setCallAlert(true);
              setTimeout(() => setCallAlert(false), 4000);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <span>📞</span>
            <span>{t('orders.callRider')} (+855 12 777 888)</span>
          </button>
        </div>
      </div>

      {/* Simulated Call Banner */}
      {callAlert && (
        <div className="p-3 bg-emerald-500 text-white text-center text-xs font-bold animate-in slide-in-from-bottom duration-200">
          📱 {isKhmer ? 'កំពុងតភ្ជាប់ទៅកាន់អ្នកដឹកជញ្ជូន សុខ តារា (+855 12 777 888)...' : 'Calling Rider Sok Dara (+855 12 777 888)...'}
        </div>
      )}
    </div>
  );
}

DeliveryMapCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    deliveryAddress: PropTypes.string,
  }),
  driverLoc: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    heading: PropTypes.number,
    eta: PropTypes.number,
    restaurantLat: PropTypes.number,
    restaurantLng: PropTypes.number,
    deliveryLat: PropTypes.number,
    deliveryLng: PropTypes.number,
    progress: PropTypes.number,
  }),
};
