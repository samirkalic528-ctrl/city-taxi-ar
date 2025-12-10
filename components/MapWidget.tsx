
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapWidgetProps {
    lat: number;
    lng: number;
}

const MapWidget: React.FC<MapWidgetProps> = ({ lat, lng }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize Map only if it doesn't exist
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                trackResize: false // Optimization
            }).setView([lat, lng], 16);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
            }).addTo(mapInstanceRef.current);

            const icon = L.divIcon({
                className: 'bg-transparent',
                html: '<div style="width:20px; height:20px; background:#fbbf24; border-radius:50%; box-shadow: 0 0 15px #fbbf24; border: 2px solid white;"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
        } else {
            // Lightweight update
            mapInstanceRef.current.setView([lat, lng], 16);
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            }
        }

        // CLEANUP FUNCTION TO PREVENT MEMORY LEAKS
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, []); // Removed [lat, lng] from dependency array to prevent re-initialization logic errors, handled inside

    // Separate effect for position updates to avoid destroying map
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng]);
            markerRef.current.setLatLng([lat, lng]);
        }
    }, [lat, lng]);

    return (
        <div className="w-full h-full relative group perspective-800 pointer-events-auto">
             {/* 3D Tilted container */}
            <div 
                ref={mapContainerRef} 
                className="w-full h-full rounded-xl border border-amber-400/50 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] transform rotate-x-20 bg-gray-900"
                style={{ transform: 'perspective(800px) rotateX(25deg)' }}
            >
            </div>
            {/* Overlay Grid */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20" style={{ transform: 'perspective(800px) rotateX(25deg)' }}></div>
        </div>
    );
};

export default MapWidget;
