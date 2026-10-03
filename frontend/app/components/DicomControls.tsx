import { RenderingEngine, Types } from "@cornerstonejs/core";

const VIEWPORT_ID = "dicom-stack";

type DicomControlsProps = {
  renderingEngineRef: React.RefObject<RenderingEngine | null>;
};

export function DicomControls({ renderingEngineRef }: DicomControlsProps) {
  function getViewport() {
    return renderingEngineRef.current?.getViewport(VIEWPORT_ID) as
      | Types.IStackViewport
      | undefined;
  }

  function fit() {
    const viewport = getViewport();

    if (!viewport) {
      return;
    }

    viewport.resetCamera();
    viewport.render();
  }

  function reset() {
    const viewport = getViewport();

    if (!viewport) {
      return;
    }

    viewport.resetCamera();
    viewport.render();
  }

  return (
    <div>
      <button type="button" onClick={fit}>
        Fit
      </button>

      <button type="button" onClick={reset}>
        Reset
      </button>
    </div>
  );
}
