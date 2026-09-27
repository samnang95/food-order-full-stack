import { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { useTranslation } from '../../../core';
import { useSavedAddresses } from '../../profile/use_saved_addresses';
import { SaveAddressModal } from './SaveAddressModal';

const DISTRICTS = [
  { name: 'BKK 1', coords: [11.551, 104.925], label: 'Boeng Keng Kang 1' },
  { name: 'Daun Penh', coords: [11.572, 104.925], label: 'Daun Penh (Central Market)' },
  { name: 'Tuol Tom Poung', coords: [11.538, 104.912], label: 'Russian Market Area' },
  { name: 'Chamkarmon', coords: [11.538, 104.92], label: 'Chamkarmon District' },
  { name: 'Toul Kork', coords: [11.578, 104.895], label: 'Toul Kork University Area' },
  { name: 'Riverside', coords: [11.568, 104.933], label: 'Sisowath Quay Riverside' },
  { name: '7 Makara', coords: [11.565, 104.915], label: 'Olympic Stadium Area' },
  { name: 'Chroy Changvar', coords: [11.595, 104.935], label: 'Chroy Changvar Peninsula' },
];

const GOOGLE_MAPS_TILES = {
  streets: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  satellite: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
};

export function DeliveryLocationPicker({
  selectedDistrict,
  setSelectedDistrict,
  streetAddress,
  setStreetAddress,
  deliveryNote,
  setDeliveryNote,
  coordinates,
  setCoordinates,
}) {
  const { t } = useTranslation();
  const { addresses } = useSavedAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapType, setMapType] = useState('streets'); // 'streets' | 'satellite'

  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  // Sync theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const createPinIcon = useCallback(() => {
    return L.divIcon({
      className: 'custom-pin-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(249, 115, 22, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 34px; height: 34px; border-radius: 12px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.45); border: 2.5px solid white; font-size: 16px;">
            📍
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCoords = coordinates || DISTRICTS[0].coords;

    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl = GOOGLE_MAPS_TILES[mapType] || GOOGLE_MAPS_TILES.streets;
    const tileClass = isDarkMode && mapType === 'streets' ? 'leaflet-tile-streets' : '';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: '0123',
      attribution: '&copy; Google Maps',
      className: tileClass,
    }).addTo(map);

    const marker = L.marker(initialCoords, {
      icon: createPinIcon(),
      draggable: true,
    }).addTo(map);

    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      const newCoords = [Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000];
      setCoordinates(newCoords);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const newCoords = [Math.round(lat * 10000) / 10000, Math.round(lng * 10000) / 10000];
      marker.setLatLng(newCoords);
      setCoordinates(newCoords);
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update theme & map type tiles smoothly
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileUrl = GOOGLE_MAPS_TILES[mapType] || GOOGLE_MAPS_TILES.streets;
    const tileClass = isDarkMode && mapType === 'streets' ? 'leaflet-tile-streets' : '';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: '0123',
      attribution: '&copy; Google Maps',
      className: tileClass,
    }).addTo(mapInstanceRef.current);
  }, [isDarkMode, mapType]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setStreetAddress(addr.address);
    if (addr.note) setDeliveryNote(addr.note);

    if (addr.lat && addr.lng) {
      const newCoords = [addr.lat, addr.lng];
      setCoordinates(newCoords);
      if (markerRef.current) markerRef.current.setLatLng(newCoords);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(newCoords, 16, { duration: 0.8 });
      }
    }

    const lower = addr.address.toLowerCase();
    const matched = DISTRICTS.find((d) => lower.includes(d.name.toLowerCase()));
    if (matched) {
      setSelectedDistrict(matched.name);
    }
  };

  const handleDistrictSelect = (district) => {
    setSelectedAddressId(null);
    setSelectedDistrict(district.name);
    setStreetAddress(`Street 271, Sangkat ${district.name}, Phnom Penh`);
    setCoordinates(district.coords);

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng(district.coords);
      mapInstanceRef.current.flyTo(district.coords, 15, { duration: 0.8 });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-black">
            1
          </span>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {t('checkout.deliveryAddress')}
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          📍 Phnom Penh
        </span>
      </div>

      {/* Saved Addresses Book Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t('checkout.selectSavedAddress')}
          </label>
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center space-x-1"
          >
            <span>➕</span>
            <span>{t('checkout.saveCurrentLocation')}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id || streetAddress === addr.address;
            const icon =
              addr.label === 'Home'
                ? '🏠'
                : addr.label === 'Work'
                ? '🏢'
                : addr.label === 'Partner'
                ? '❤️'
                : addr.label === 'Gym'
                ? '🏋️'
                : '📍';

            return (
              <button
                key={addr.id}
                type="button"
                onClick={() => handleSelectSavedAddress(addr)}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 text-left border ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 ring-2 ring-orange-500/30 scale-101'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <span className="text-base">{icon}</span>
                <div>
                  <div className="flex items-center space-x-1.5 leading-tight">
                    <span>{addr.label}</span>
                    {addr.isDefault && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400'
                        }`}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] block truncate max-w-[130px] sm:max-w-[170px] font-normal mt-0.5 ${
                      isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {addr.address.split(',')[0]}
                  </span>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-2 rounded-2xl text-xs font-bold transition-all border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-orange-600 hover:border-orange-400 dark:hover:text-orange-400 flex items-center space-x-1.5 active:scale-95"
          >
            <span>📍</span>
            <span>+ Save Pin</span>
          </button>
        </div>
      </div>

      {/* Quick District Chips */}
      <div>
        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
          Select Area / Khan
        </label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {DISTRICTS.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => handleDistrictSelect(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                selectedDistrict === d.name
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-102'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Interactive Map with Google Maps */}
      <div className="relative isolate z-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 h-48 sm:h-56 w-full shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Helper instruction */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-xs border border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-1.5">
          <span>👆</span>
          <span>Click map or drag pin to adjust drop point</span>
        </div>

        {/* Map Type Switcher (Google Streets vs Google Satellite) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-0.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <button
            type="button"
            onClick={() => setMapType('streets')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              mapType === 'streets'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🗺️ Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              mapType === 'satellite'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🛰️ Satellite
          </button>
        </div>

        {coordinates && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono text-white/90 shadow-xs">
            📍 {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
          </div>
        )}
      </div>

      {/* Street Address Input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Detailed Street & Building Address *
          </label>
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
          >
            <span>💾</span>
            <span>Save to Address Book</span>
          </button>
        </div>
        <input
          type="text"
          required
          value={streetAddress}
          onChange={(e) => {
            setSelectedAddressId(null);
            setStreetAddress(e.target.value);
          }}
          placeholder="e.g. Building 45, Street 302, Sangkat Boeng Keng Kang 1"
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Rider Delivery Notes */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
          {t('checkout.noteForRider')}
        </label>
        <input
          type="text"
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          placeholder="e.g. Call upon arrival, leave at condo reception, 3rd floor"
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
        />
      </div>

      {/* Save Address Modal */}
      <SaveAddressModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        initialAddress={streetAddress}
        initialNote={deliveryNote}
        initialCoords={coordinates || DISTRICTS[0].coords}
        onSaveSuccess={(newAddr) => {
          setSelectedAddressId(newAddr.id);
          setStreetAddress(newAddr.address);
          if (newAddr.note) setDeliveryNote(newAddr.note);
        }}
      />
    </div>
  );
}

DeliveryLocationPicker.propTypes = {
  selectedDistrict: PropTypes.string.isRequired,
  setSelectedDistrict: PropTypes.func.isRequired,
  streetAddress: PropTypes.string.isRequired,
  setStreetAddress: PropTypes.func.isRequired,
  deliveryNote: PropTypes.string.isRequired,
  setDeliveryNote: PropTypes.func.isRequired,
  coordinates: PropTypes.array,
  setCoordinates: PropTypes.func.isRequired,
};
