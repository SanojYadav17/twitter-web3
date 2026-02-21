import React, { useState, useRef, useEffect, useCallback } from "react";

const FILTERS = [
  { id: "original", label: "Original", values: {} },
  { id: "vivid", label: "Vivid", values: { brightness: 110, contrast: 115, saturate: 130 } },
  { id: "warm", label: "Warm", values: { brightness: 105, contrast: 105, saturate: 110, sepia: 20 } },
  { id: "cool", label: "Cool", values: { brightness: 105, contrast: 110, saturate: 90, hueRotate: 15 } },
  { id: "bw", label: "B&W", values: { grayscale: 100, contrast: 120 } },
  { id: "vintage", label: "Vintage", values: { brightness: 105, contrast: 90, saturate: 80, sepia: 30 } },
  { id: "dramatic", label: "Dramatic", values: { brightness: 90, contrast: 140, saturate: 120 } },
  { id: "fade", label: "Fade", values: { brightness: 115, contrast: 85, saturate: 80 } },
  { id: "noir", label: "Noir", values: { grayscale: 100, contrast: 150, brightness: 95 } },
];

const ASPECT_RATIOS = [
  { id: "free", label: "Free", icon: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
];

function buildFilterCSS(adj) {
  const parts = [];
  if (adj.brightness !== undefined && adj.brightness !== 100)
    parts.push(`brightness(${adj.brightness}%)`);
  if (adj.contrast !== undefined && adj.contrast !== 100)
    parts.push(`contrast(${adj.contrast}%)`);
  if (adj.saturate !== undefined && adj.saturate !== 100)
    parts.push(`saturate(${adj.saturate}%)`);
  if (adj.sepia) parts.push(`sepia(${adj.sepia}%)`);
  if (adj.grayscale) parts.push(`grayscale(${adj.grayscale}%)`);
  if (adj.hueRotate) parts.push(`hue-rotate(${adj.hueRotate}deg)`);
  if (adj.blur) parts.push(`blur(${adj.blur}px)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

function ImageEditor({ imageSrc, onSave, onCancel, aspectHint }) {
  const previewRef = useRef(null);
  const containerRef = useRef(null);

  // Tabs
  const [activeTab, setActiveTab] = useState("crop");

  // Crop
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'move' | 'tl' | 'tr' | 'bl' | 'br'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [aspectRatio, setAspectRatio] = useState("free");

  // Transform
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Adjustments
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
    blur: 0,
  });

  // Filter presets
  const [activeFilter, setActiveFilter] = useState("original");

  // Image dimensions
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.width, h: img.height });

      // Fit to container (max 500x400)
      const maxW = 500, maxH = 400;
      let dw = img.width, dh = img.height;
      if (dw > maxW) { dh = dh * maxW / dw; dw = maxW; }
      if (dh > maxH) { dw = dw * maxH / dh; dh = maxH; }
      setDisplaySize({ w: Math.round(dw), h: Math.round(dh) });
      setCrop({ x: 0, y: 0, w: Math.round(dw), h: Math.round(dh) });

      // Auto aspect if hint
      if (aspectHint === "profile") {
        setAspectRatio("1:1");
        const side = Math.min(Math.round(dw), Math.round(dh));
        const cx = Math.round((dw - side) / 2);
        const cy = Math.round((dh - side) / 2);
        setCrop({ x: cx, y: cy, w: side, h: side });
      } else if (aspectHint === "cover") {
        setAspectRatio("16:9");
        let cw = Math.round(dw);
        let ch = Math.round(cw / (16 / 9));
        if (ch > dh) { ch = Math.round(dh); cw = Math.round(ch * (16 / 9)); }
        const cx = Math.round((dw - cw) / 2);
        const cy = Math.round((dh - ch) / 2);
        setCrop({ x: cx, y: cy, w: cw, h: ch });
      }
    };
    img.src = imageSrc;
  }, [imageSrc, aspectHint]);

  const handleAspectChange = useCallback((id) => {
    setAspectRatio(id);
    if (id === "free") return;
    const ar = ASPECT_RATIOS.find(a => a.id === id);
    if (!ar || !ar.ratio) return;
    let cw = displaySize.w;
    let ch = cw / ar.ratio;
    if (ch > displaySize.h) {
      ch = displaySize.h;
      cw = ch * ar.ratio;
    }
    setCrop({
      x: Math.round((displaySize.w - cw) / 2),
      y: Math.round((displaySize.h - ch) / 2),
      w: Math.round(cw),
      h: Math.round(ch),
    });
  }, [displaySize]);

  // Crop drag handlers
  const handleCropMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCropStart({ ...crop });
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dx = mx - dragStart.x;
      const dy = my - dragStart.y;

      const ratio = aspectRatio !== "free"
        ? ASPECT_RATIOS.find(a => a.id === aspectRatio)?.ratio
        : null;

      if (dragType === "move") {
        let nx = Math.max(0, Math.min(cropStart.x + dx, displaySize.w - cropStart.w));
        let ny = Math.max(0, Math.min(cropStart.y + dy, displaySize.h - cropStart.h));
        setCrop(c => ({ ...c, x: nx, y: ny }));
      } else {
        let { x, y, w, h } = cropStart;
        if (dragType === "br" || dragType === "tr") {
          w = Math.max(40, Math.min(cropStart.w + dx, displaySize.w - x));
        }
        if (dragType === "bl" || dragType === "tl") {
          const newX = Math.max(0, cropStart.x + dx);
          w = Math.max(40, cropStart.w - (newX - cropStart.x));
          x = newX;
        }
        if (dragType === "br" || dragType === "bl") {
          if (ratio) { h = w / ratio; } else { h = Math.max(40, Math.min(cropStart.h + dy, displaySize.h - y)); }
        }
        if (dragType === "tl" || dragType === "tr") {
          if (ratio) {
            h = w / ratio;
            y = cropStart.y + cropStart.h - h;
          } else {
            const newY = Math.max(0, cropStart.y + dy);
            h = Math.max(40, cropStart.h - (newY - cropStart.y));
            y = newY;
          }
        }
        if (y + h > displaySize.h) h = displaySize.h - y;
        if (x + w > displaySize.w) w = displaySize.w - x;
        setCrop({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
      }
    };
    const handleUp = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, dragType, dragStart, cropStart, aspectRatio, displaySize]);

  const applyFilterPreset = (filterId) => {
    setActiveFilter(filterId);
    const preset = FILTERS.find(f => f.id === filterId);
    if (!preset) return;
    setAdjustments({
      brightness: preset.values.brightness || 100,
      contrast: preset.values.contrast || 100,
      saturate: preset.values.saturate || 100,
      sepia: preset.values.sepia || 0,
      grayscale: preset.values.grayscale || 0,
      hueRotate: preset.values.hueRotate || 0,
      blur: preset.values.blur || 0,
    });
  };

  const updateAdjustment = (key, val) => {
    setActiveFilter("original");
    setAdjustments(a => ({ ...a, [key]: val }));
  };

  const resetAll = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAdjustments({ brightness: 100, contrast: 100, saturate: 100, sepia: 0, grayscale: 0, hueRotate: 0, blur: 0 });
    setActiveFilter("original");
    setCrop({ x: 0, y: 0, w: displaySize.w, h: displaySize.h });
    setAspectRatio("free");
  };

  const handleSave = () => {
    if (!imgRef.current || !imgSize.w) return;
    const scaleX = imgSize.w / displaySize.w;
    const scaleY = imgSize.h / displaySize.h;

    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceW = crop.w * scaleX;
    const sourceH = crop.h * scaleY;

    const canvas = document.createElement("canvas");

    // Handle rotation
    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? sourceH : sourceW;
    canvas.height = isRotated ? sourceW : sourceH;

    const ctx = canvas.getContext("2d");
    ctx.filter = buildFilterCSS(adjustments);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const drawW = sourceW;
    const drawH = sourceH;
    ctx.drawImage(imgRef.current, sourceX, sourceY, sourceW, sourceH, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const result = canvas.toDataURL("image/jpeg", 0.85);
    onSave(result);
  };

  const filterCSS = buildFilterCSS(adjustments);
  const transformCSS = `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;

  const adjSliders = [
    { key: "brightness", label: "Brightness", icon: "☀️", min: 50, max: 150 },
    { key: "contrast", label: "Contrast", icon: "◐", min: 50, max: 150 },
    { key: "saturate", label: "Saturation", icon: "🎨", min: 0, max: 200 },
    { key: "sepia", label: "Warmth", icon: "🌅", min: 0, max: 100 },
    { key: "blur", label: "Blur", icon: "💧", min: 0, max: 5 },
  ];

  return (
    <div className="img-editor-overlay" onClick={onCancel}>
      <div className="img-editor" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="img-editor-header">
          <button className="img-editor-close" onClick={onCancel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <h3>Edit Image</h3>
          <div className="img-editor-header-actions">
            <button className="img-editor-reset" onClick={resetAll}>Reset</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Apply</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="img-editor-tabs">
          {[
            { id: "crop", label: "Crop", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.13 1L6 16a2 2 0 002 2h15"/><path d="M1 6.13L16 6a2 2 0 012 2v15"/></svg> },
            { id: "adjust", label: "Adjust", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
            { id: "filters", label: "Filters", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> },
            { id: "transform", label: "Transform", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg> },
          ].map(tab => (
            <button
              key={tab.id}
              className={`img-editor-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="img-editor-preview">
          <div
            ref={containerRef}
            className="img-editor-canvas-wrap"
            style={{ width: displaySize.w, height: displaySize.h }}
          >
            <img
              ref={previewRef}
              src={imageSrc}
              alt=""
              style={{
                width: displaySize.w,
                height: displaySize.h,
                filter: filterCSS,
                transform: transformCSS,
              }}
              draggable={false}
            />
            {activeTab === "crop" && (
              <>
                {/* Dark overlay outside crop */}
                <div className="crop-overlay-top" style={{ height: crop.y, width: displaySize.w }} />
                <div className="crop-overlay-bottom" style={{ top: crop.y + crop.h, height: displaySize.h - crop.y - crop.h, width: displaySize.w }} />
                <div className="crop-overlay-left" style={{ top: crop.y, height: crop.h, width: crop.x }} />
                <div className="crop-overlay-right" style={{ top: crop.y, height: crop.h, left: crop.x + crop.w, width: displaySize.w - crop.x - crop.w }} />

                {/* Crop selection */}
                <div
                  className="crop-selection"
                  style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                  onMouseDown={(e) => handleCropMouseDown(e, "move")}
                >
                  {/* Grid lines */}
                  <div className="crop-grid">
                    <div className="crop-grid-h" style={{ top: "33.3%" }} />
                    <div className="crop-grid-h" style={{ top: "66.6%" }} />
                    <div className="crop-grid-v" style={{ left: "33.3%" }} />
                    <div className="crop-grid-v" style={{ left: "66.6%" }} />
                  </div>
                  {/* Corner handles */}
                  <div className="crop-handle tl" onMouseDown={(e) => handleCropMouseDown(e, "tl")} />
                  <div className="crop-handle tr" onMouseDown={(e) => handleCropMouseDown(e, "tr")} />
                  <div className="crop-handle bl" onMouseDown={(e) => handleCropMouseDown(e, "bl")} />
                  <div className="crop-handle br" onMouseDown={(e) => handleCropMouseDown(e, "br")} />
                  {/* Edge mid handles */}
                  <div className="crop-edge top" />
                  <div className="crop-edge bottom" />
                  <div className="crop-edge left" />
                  <div className="crop-edge right" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="img-editor-controls">
          {activeTab === "crop" && (
            <div className="crop-controls">
              <div className="aspect-ratios">
                {ASPECT_RATIOS.map(ar => (
                  <button
                    key={ar.id}
                    className={`aspect-btn ${aspectRatio === ar.id ? "active" : ""}`}
                    onClick={() => handleAspectChange(ar.id)}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "adjust" && (
            <div className="adjust-controls">
              {adjSliders.map(s => (
                <div className="adjust-slider" key={s.key}>
                  <div className="adjust-slider-header">
                    <span className="adjust-slider-icon">{s.icon}</span>
                    <span className="adjust-slider-label">{s.label}</span>
                    <span className="adjust-slider-value">{adjustments[s.key]}{s.key === 'blur' ? 'px' : '%'}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.key === 'blur' ? 0.1 : 1}
                    value={adjustments[s.key]}
                    onChange={(e) => updateAdjustment(s.key, parseFloat(e.target.value))}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "filters" && (
            <div className="filter-presets">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  className={`filter-preset ${activeFilter === f.id ? "active" : ""}`}
                  onClick={() => applyFilterPreset(f.id)}
                >
                  <div className="filter-preview-wrap">
                    <img
                      src={imageSrc}
                      alt=""
                      className="filter-preview-img"
                      style={{ filter: buildFilterCSS({ brightness: 100, contrast: 100, saturate: 100, ...f.values }) }}
                    />
                  </div>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "transform" && (
            <div className="transform-controls">
              <div className="transform-row">
                <button className="transform-btn" onClick={() => setRotation(r => (r - 90 + 360) % 360)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1014.85-10.36L1 10"/></svg>
                  <span>Rotate Left</span>
                </button>
                <button className="transform-btn" onClick={() => setRotation(r => (r + 90) % 360)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 01-14.85-10.36L23 10" transform="scale(-1,1) translate(-24,0)"/></svg>
                  <span>Rotate Right</span>
                </button>
                <button className={`transform-btn ${flipH ? "active" : ""}`} onClick={() => setFlipH(f => !f)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M4 7l4 5-4 5"/><path d="M20 7l-4 5 4 5"/></svg>
                  <span>Flip H</span>
                </button>
                <button className={`transform-btn ${flipV ? "active" : ""}`} onClick={() => setFlipV(f => !f)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M7 4l5 4-5 4"/><path d="M7 20l5-4-5-4" transform="rotate(90 12 12)"/></svg>
                  <span>Flip V</span>
                </button>
              </div>
              <div className="rotation-display">
                <span>Rotation: {rotation}°</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageEditor;
