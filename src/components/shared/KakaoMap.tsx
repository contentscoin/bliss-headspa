"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: { map: unknown; position: unknown }) => {
          setMap: (map: unknown | null) => void;
        };
        InfoWindow: new (options: {
          content: string;
          removable?: boolean;
        }) => {
          open: (map: unknown, marker: unknown) => void;
          close: () => void;
        };
        event: {
          addListener: (
            target: unknown,
            type: string,
            handler: () => void
          ) => void;
        };
      };
    };
  }
}

interface KakaoMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
  height?: string;
}

export default function KakaoMap({
  lat,
  lng,
  name,
  address,
  height = "300px",
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!appKey) {
      setError(true);
      return;
    }

    // Check if SDK is already loaded
    if (window.kakao?.maps) {
      setLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => setLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => setLoaded(true));
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, [appKey]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const { kakao } = window;
    const center = new kakao.maps.LatLng(lat, lng);
    const map = new kakao.maps.Map(mapRef.current, {
      center,
      level: 3,
    });

    const marker = new kakao.maps.Marker({
      map,
      position: center,
    });

    const infoWindow = new kakao.maps.InfoWindow({
      content: `<div style="padding:8px 12px;font-size:13px;line-height:1.4;min-width:150px;">
        <strong>${name}</strong><br/>
        <span style="color:#666;font-size:12px;">${address}</span>
      </div>`,
      removable: true,
    });

    let isOpen = false;
    kakao.maps.event.addListener(marker, "click", () => {
      if (isOpen) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }
      isOpen = !isOpen;
    });
  }, [loaded, lat, lng, name, address]);

  if (error || !appKey) {
    return (
      <div className="space-y-3">
        <div
          className="rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm"
          style={{ height }}
        >
          <div className="text-center px-4">
            <p className="font-medium">지도를 불러올 수 없습니다</p>
            <p className="text-xs mt-1">{address}</p>
          </div>
        </div>
        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Navigation className="size-4 mr-2" />
          카카오맵에서 길찾기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="rounded-lg" style={{ height }} />
      <a
        href={`https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Navigation className="size-4 mr-2" />
        카카오맵에서 길찾기
      </a>
    </div>
  );
}
