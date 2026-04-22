"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";

declare global {
  interface Window {
    __kakaoDiagPatched?: boolean;
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => {
          relayout: () => void;
          setCenter: (latlng: unknown) => void;
        };
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

// Module-level singleton to avoid duplicate script injection under React StrictMode
let sdkLoadPromise: Promise<void> | null = null;

function loadKakaoSdk(appKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.kakao?.maps?.LatLng) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const finalize = () => {
      if (!window.kakao?.maps?.load) {
        reject(new Error("Kakao SDK failed to initialize"));
        return;
      }
      window.kakao.maps.load(() => resolve());
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kakao-sdk="true"]'
    );
    if (existing) {
      if (window.kakao?.maps) {
        finalize();
      } else {
        existing.addEventListener("load", finalize, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Kakao SDK load error")),
          { once: true }
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.dataset.kakaoSdk = "true";
    script.addEventListener("load", finalize, { once: true });
    script.addEventListener(
      "error",
      () => {
        sdkLoadPromise = null;
        reject(new Error("Kakao SDK load error"));
      },
      { once: true }
    );
    document.head.appendChild(script);

    // Diagnostic: capture Kakao's auth-failure messages so we can see the
    // actual reason in the console (Kakao logs auth errors via console.warn
    // instead of throwing). Wrapping here is non-destructive — other
    // console output is preserved.
    if (typeof window !== "undefined" && !window.__kakaoDiagPatched) {
      window.__kakaoDiagPatched = true;
      const origWarn = console.warn.bind(console);
      const origError = console.error.bind(console);
      const banner = (label: string, ...args: unknown[]) => {
        try {
          const text = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
          if (text.toLowerCase().includes("kakao") || text.includes("appkey") || text.includes("도메인")) {
            origError(
              `%c[KakaoMap Diagnostic] %c${label}: ${text}`,
              "color:#c00;font-weight:bold",
              "color:#333"
            );
          }
        } catch {
          /* ignore */
        }
      };
      console.warn = (...args: unknown[]) => {
        banner("warn", ...args);
        origWarn(...args);
      };
      console.error = (...args: unknown[]) => {
        banner("error", ...args);
        origError(...args);
      };
    }
  });

  return sdkLoadPromise;
}

export default function KakaoMap({
  lat,
  lng,
  name,
  address,
  height = "300px",
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!appKey) {
      setError(true);
      return;
    }
    let cancelled = false;
    loadKakaoSdk(appKey)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [appKey]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const { kakao } = window;
    if (!kakao?.maps?.LatLng) {
      setError(true);
      return;
    }

    const container = mapRef.current;
    let cancelled = false;
    type KakaoMapInstance = InstanceType<typeof kakao.maps.Map>;
    let map: KakaoMapInstance | null = null;
    let roConstruct: ResizeObserver | null = null;
    let roRelayout: ResizeObserver | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const center = new kakao.maps.LatLng(lat, lng);

    const constructMap = (w: number, h: number) => {
      if (cancelled || map) return;
      // Need a real size. If still too small, wait for the next RO tick.
      if (w < 100 || h < 80) return;

      map = new kakao.maps.Map(container, { center, level: 3 });
      const marker = new kakao.maps.Marker({ map, position: center });

      const infoWindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:8px 12px;font-size:13px;line-height:1.4;min-width:150px;">
          <strong>${name}</strong><br/>
          <span style="color:#666;font-size:12px;">${address}</span>
        </div>`,
        removable: true,
      });

      let isOpen = false;
      kakao.maps.event.addListener(marker, "click", () => {
        if (isOpen) infoWindow.close();
        else infoWindow.open(map!, marker);
        isOpen = !isOpen;
      });

      const relayout = () => {
        map?.relayout();
        map?.setCenter(center);
      };
      // Multiple passes cover late font/layout settles.
      [50, 200, 600, 1200].forEach((ms) =>
        timers.push(setTimeout(relayout, ms))
      );

      // Stop the "construct" observer, switch to a "relayout" observer.
      roConstruct?.disconnect();
      roConstruct = null;
      if (typeof ResizeObserver !== "undefined") {
        roRelayout = new ResizeObserver(() => relayout());
        roRelayout.observe(container);
      }
    };

    // Use ResizeObserver to learn the real rendered size. First fire
    // happens right after observe() with the actual layout size.
    if (typeof ResizeObserver !== "undefined") {
      roConstruct = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (rect) constructMap(rect.width, rect.height);
      });
      roConstruct.observe(container);
    } else {
      // Fallback: poll via rAF until sized.
      const poll = () => {
        if (cancelled || map) return;
        const { offsetWidth: w, offsetHeight: h } = container;
        if (w >= 100 && h >= 80) constructMap(w, h);
        else requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      roConstruct?.disconnect();
      roRelayout?.disconnect();
    };
  }, [ready, lat, lng, name, address]);

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
      <div
        ref={mapRef}
        className="rounded-lg w-full"
        style={{ height, minHeight: height, position: "relative", overflow: "hidden" }}
      />
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
