import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Document, Page } from "react-pdf";
import {
  ArrowLeft,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Maximize,
  RotateCw,
} from "lucide-react";
import { useCourse } from "@/context/CourseContext";

// IMPORTANT: loads local bundled worker (see src/pdf-worker.js)
import "../pdf-worker";

// Optional (improves selectable text + annotations styling)
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfViewer = () => {
  const { lectureId, docType } = useParams(); // docType: "notes" | "assignment"
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchLectureById } = useCourse() ?? {};

  /* ------------------------------------------------------------------
   * If we navigated from modal we may already have fileUrl/fileName in state
   * ------------------------------------------------------------------ */
  const stateFileUrl = location.state?.fileUrl || null;
  const stateFileName = location.state?.fileName || null;

  const [fileUrl, setFileUrl] = useState(stateFileUrl);
  const [fileName, setFileName] = useState(stateFileName);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [fitWidth, setFitWidth] = useState(false);
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [loading, setLoading] = useState(!stateFileUrl);
  const [error, setError] = useState(null);

  // container width (for fit-to-width)
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(null);

  /* ------------------------------------------------------------------
   * Measure container width (for responsive fit-width)
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        // subtract a little padding
        setContainerWidth(containerRef.current.clientWidth - 16);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Block Save / Print shortcuts while viewer mounted
  useEffect(() => {
    const blockKeys = (e) => {
      // Ctrl+S / Cmd+S  OR  Ctrl+P / Cmd+P
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", blockKeys);
    return () => window.removeEventListener("keydown", blockKeys);
  }, []); // no deps; we only register once on mount

  /* ------------------------------------------------------------------
   * Fetch lecture if we didn't get url in route state
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (stateFileUrl) return; // we already have everything
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const lecture = await fetchLectureById?.(lectureId);
        if (!lecture) throw new Error("Lecture not found.");

        let url = "";
        let name = "";
        if (docType === "assignment") {
          url = lecture?.assignment?.fileUrl;
          name = lecture?.assignment?.title || "Assignment";
        } else {
          url = lecture?.notes?.fileUrl;
          name = lecture?.notes?.fileName || "Notes";
        }

        if (!url) throw new Error("Document not available.");
        if (!ignore) {
          setFileUrl(url);
          setFileName(name);
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Failed to load document.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [lectureId, docType, stateFileUrl, fetchLectureById]);

  /* ------------------------------------------------------------------
   * react-pdf load handlers
   * ------------------------------------------------------------------ */
  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const isPdf = useMemo(() => {
    if (!fileUrl) return false;
    // `react-pdf` can detect MIME; ext check is just a fast guess for fallback UI
    return fileUrl.toLowerCase().includes(".pdf");
  }, [fileUrl]);

  /* ------------------------------------------------------------------
   * Toolbar actions
   * ------------------------------------------------------------------ */
  const goBack = () => navigate(-1);
  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1.2);
  const rotatePage = () => setRotation((r) => (r + 90) % 360);
  const toggleFitWidth = () => setFitWidth((f) => !f);
  const nextPage = () =>
    setPageNumber((p) => (numPages ? Math.min(p + 1, numPages) : p));
  const prevPage = () => setPageNumber((p) => Math.max(p - 1, 1));

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */
  return (
    <div
      className="bg-[#0f0f0f] text-white min-h-screen flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar */}
      <header className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2 border-b border-[#2a2a2a] bg-[#181818]/95 backdrop-blur">
        <button
          onClick={goBack}
          className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <FileText size={18} className="text-orange-400 shrink-0" />
        <h1 className="text-sm sm:text-base font-medium truncate flex-1">
          {fileName || (docType === "assignment" ? "Assignment" : "Notes")}
        </h1>

        {/* Zoom controls (hide some on mobile) */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white"
            aria-label="Zoom out"
          >
            <Minus size={18} />
          </button>
          <span className="text-xs w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white"
            aria-label="Zoom in"
          >
            <Plus size={18} />
          </button>
          {/* Rotate */}
          <button
            onClick={rotatePage}
            className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white"
            title="Rotate 90°"
          >
            <RotateCw size={18} />
          </button>
          {/* Reset zoom (small text link) */}
          <button
            onClick={resetZoom}
            className="px-2 py-1 rounded-md text-[11px] text-gray-400 hover:text-white hover:bg-white/10"
            title="Reset Zoom"
          >
            Reset
          </button>
          <button
            onClick={toggleFitWidth}
            className={`p-1 rounded-md hover:bg-white/10 ${
              fitWidth ? "text-orange-400" : "text-gray-300 hover:text-white"
            }`}
            title="Fit to Width"
          >
            <Maximize size={18} />
          </button>
        </div>
      </header>

      {/* Body */}
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto flex flex-col items-center justify-start py-4 px-2 sm:px-4"
      >
        {loading && (
          <div className="mt-20 text-gray-400 text-sm">Loading document...</div>
        )}

        {!loading && error && (
          <div className="mt-20 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && fileUrl && (
          <>
            {isPdf ? (
              <>
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(err) => setError(err.message)}
                  loading={
                    <div className="mt-20 text-gray-400 text-sm">
                      Loading PDF…
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={fitWidth ? undefined : scale}
                    width={
                      fitWidth && containerWidth
                        ? Math.min(containerWidth, 1000)
                        : undefined
                    }
                    rotate={rotation}
                    className="shadow-lg bg-black/20 rounded"
                  />
                </Document>

                {/* Page controls */}
                {numPages && (
                  <div className="mt-4 flex items-center gap-3 text-sm text-gray-300">
                    <button
                      onClick={prevPage}
                      disabled={pageNumber <= 1}
                      className="p-1 rounded-md disabled:opacity-40 hover:bg-white/10"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span>
                      Page {pageNumber} / {numPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={pageNumber >= numPages}
                      className="p-1 rounded-md disabled:opacity-40 hover:bg-white/10"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Fallback embed if it's not a PDF
              <iframe
                src={fileUrl}
                title="Document"
                className="w-full max-w-3xl h-[80vh] rounded border border-[#2a2a2a]"
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PdfViewer;
