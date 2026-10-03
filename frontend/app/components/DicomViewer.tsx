"use client";

import { useEffect, useRef, useState } from "react";

import {
  Enums,
  RenderingEngine,
  type Types,
  init as cornerstoneInit,
} from "@cornerstonejs/core";

import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { DicomControls } from "./DicomControls";

type Props = {
  fileUrl: string;
};

const VIEWPORT_ID = "dicom-stack";
const RENDERING_ENGINE_ID = "dicom-rendering-engine";

export function DicomViewer({ fileUrl }: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const renderingEngineRef = useRef<RenderingEngine | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    async function initialize() {
      try {
        setLoading(true);
        setError(null);

        await cornerstoneInit();
        await dicomImageLoaderInit({});

        if (cancelled || !elementRef.current) {
          return;
        }

        const renderingEngine = new RenderingEngine(RENDERING_ENGINE_ID);

        renderingEngineRef.current = renderingEngine;

        renderingEngine.enableElement({
          viewportId: VIEWPORT_ID,
          type: Enums.ViewportType.STACK,
          element: elementRef.current,
        });

        resizeObserver = new ResizeObserver(() => {
          if (!renderingEngine.hasBeenDestroyed) {
            renderingEngine.resize(true, false);
          }
        });

        resizeObserver.observe(elementRef.current);

        const viewport = renderingEngine.getViewport(
          VIEWPORT_ID,
        ) as Types.IStackViewport;

        const imageId = `wadouri:${new URL(
          fileUrl,
          window.location.origin,
        ).toString()}`;

        await viewport.setStack([imageId]);

        viewport.resetCamera();
        viewport.render();

        if (!cancelled) {
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError("Unable to load the DICOM image.");
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;

      resizeObserver?.disconnect();

      renderingEngineRef.current?.destroy();
      renderingEngineRef.current = null;
    };
  }, [fileUrl]);

  return (
    <section>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "70vh",
          minHeight: "400px",
          background: "#000",
        }}
      >
        <div
          ref={elementRef}
          style={{
            width: "100%",
            height: "100%",
          }}
        />

        {loading && (
          <div role="status" aria-live="polite">
            Loading scan...
          </div>
        )}

        {error && <div role="alert">{error}</div>}
      </div>

      {!loading && !error && (
        <DicomControls renderingEngineRef={renderingEngineRef} />
      )}
    </section>
  );
}
