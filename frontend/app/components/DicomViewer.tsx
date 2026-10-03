"use client";

import {
  Enums,
  imageLoader,
  metaData,
  RenderingEngine,
  type Types,
} from "@cornerstonejs/core";
import { init as cornerstoneInit } from "@cornerstonejs/core";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import { useEffect, useRef, useState } from "react";

type Props = {
  fileUrl: string;
  modality: string;
  description: string | null;
};

type DicomMetadata = {
  studyDate: string | null;
  rows: number | null;
  columns: number | null;
};

const VIEWPORT_ID = "dicom-stack";
const RENDERING_ENGINE_ID = "dicom-rendering-engine";

let cornerstoneInitialization: Promise<void> | null = null;

function initializeCornerstone() {
  if (!cornerstoneInitialization) {
    cornerstoneInitialization = (async () => {
      await cornerstoneInit();

      await dicomImageLoaderInit({
        maxWebWorkers:
          typeof navigator !== "undefined"
            ? navigator.hardwareConcurrency || 1
            : 1,
      });
    })();
  }

  return cornerstoneInitialization;
}

function formatStudyDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  // DICOM DA format: YYYYMMDD.
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }

  return value;
}

function readDicomMetadata(
  imageId: string,
  image: Types.IImage,
): DicomMetadata {
  const pixelModule = metaData.get(
    Enums.MetadataModules.IMAGE_PIXEL,
    imageId,
  ) as
    | {
        rows?: number;
        columns?: number;
      }
    | undefined;

  const studyModule = metaData.get(
    Enums.MetadataModules.GENERAL_STUDY,
    imageId,
  ) as
    | {
        studyDate?: string;
      }
    | undefined;

  return {
    studyDate: studyModule?.studyDate ?? null,
    rows: pixelModule?.rows ?? image.rows ?? null,
    columns: pixelModule?.columns ?? image.columns ?? null,
  };
}

export function DicomViewer({ fileUrl, modality, description }: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DicomMetadata>({
    studyDate: null,
    rows: null,
    columns: null,
  });

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    async function initialize() {
      try {
        setLoading(true);
        setError(null);

        await initializeCornerstone();

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

        const imageId = `wadouri:${new URL(
          fileUrl,
          window.location.origin,
        ).toString()}`;

        /*
         * Explicitly load the image.
         *
         * This gives us the IImage object for dimensions while also
         * populating Cornerstone's metadata layer.
         */
        const image = await imageLoader.loadAndCacheImage(imageId);

        if (cancelled) {
          return;
        }

        const dicomMetadata = readDicomMetadata(imageId, image);

        setMetadata(dicomMetadata);

        const viewport = renderingEngine.getViewport(
          VIEWPORT_ID,
        ) as Types.IStackViewport;

        await viewport.setStack([imageId]);

        viewport.resetCamera();
        viewport.render();

        resizeObserver = new ResizeObserver(() => {
          if (
            !cancelled &&
            renderingEngineRef.current &&
            !renderingEngineRef.current.hasBeenDestroyed
          ) {
            renderingEngineRef.current.resize(true, true);
          }
        });

        resizeObserver.observe(elementRef.current);

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

  function getViewport() {
    const renderingEngine = renderingEngineRef.current;

    if (!renderingEngine || renderingEngine.hasBeenDestroyed) {
      return null;
    }

    return renderingEngine.getViewport(VIEWPORT_ID) as Types.IStackViewport;
  }

  function handleFit() {
    const viewport = getViewport();

    if (!viewport) {
      return;
    }

    viewport.resetCamera({
      resetPan: false,
      resetZoom: true,
    });

    viewport.render();
  }

  function handleReset() {
    const viewport = getViewport();

    if (!viewport) {
      return;
    }

    viewport.resetCamera({
      resetPan: true,
      resetZoom: true,
      resetToCenter: true,
    });

    viewport.render();
  }

  return (
    <section>
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "500px",
          height: "70vh",
          background: "#000",
          overflow: "hidden",
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
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            Loading scan…
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {!loading && !error && (
        <>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              padding: "1rem 0",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong>Modality</strong>
              <div>{modality}</div>
            </div>
            <div>
              <strong>Description</strong>
              <div>{description ?? "None"}</div>
            </div>

            <div>
              <strong>Study date</strong>
              <div>{formatStudyDate(metadata.studyDate)}</div>
            </div>

            <div>
              <strong>Dimensions</strong>
              <div>
                {metadata.rows && metadata.columns
                  ? `${metadata.columns} × ${metadata.rows}`
                  : "Unknown"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <button type="button" onClick={handleFit}>
              Fit
            </button>

            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </>
      )}
    </section>
  );
}
