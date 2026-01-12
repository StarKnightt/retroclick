"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SmoothCursor } from "@/components/smooth-cursor";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#0f0f0f", "#E74C3C", "#E67E22", "#F1C40F", "#2ECC71",
  "#1ABC9C", "#3498DB", "#9B59B6", "#E91E63", "#795548",
  "#607D8B", "#FF5722",
];

const FONTS = [
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Libre Baskerville", value: "'Libre Baskerville', serif" },
  { name: "Courier", value: "'Courier New', monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Garamond", value: "'EB Garamond', serif" },
  { name: "DM Serif", value: "'DM Serif Display', serif" },
  { name: "Comic Neue", value: "'Comic Neue', cursive" },
  { name: "Caveat", value: "'Caveat', cursive" },
  { name: "Dancing Script", value: "'Dancing Script', cursive" },
  { name: "Pacifico", value: "'Pacifico', cursive" },
  { name: "Shadows Into Light", value: "'Shadows Into Light', cursive" },
  { name: "Indie Flower", value: "'Indie Flower', cursive" },
];

const FILTERS = [
  { name: "None", value: "none" },
  { name: "B&W", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Vintage", value: "sepia(50%) contrast(90%)" },
  { name: "Warm", value: "sepia(30%) saturate(140%)" },
  { name: "Cool", value: "saturate(80%) hue-rotate(20deg)" },
  { name: "Fade", value: "contrast(90%) brightness(110%) saturate(80%)" },
  { name: "Vivid", value: "saturate(150%) contrast(110%)" },
];

export default function PhotoEditor() {
  const [title, setTitle] = useState("My Photo");
  const [textStyles, setTextStyles] = useState<string[]>([]);
  const [dateStyles, setDateStyles] = useState<string[]>([]);
  const [font, setFont] = useState(FONTS[9].value); // Pacifico as default
  const [fontSize, setFontSize] = useState("18");
  const [date, setDate] = useState("");
  const [textColor, setTextColor] = useState("#0f0f0f");
  const [filter, setFilter] = useState("none");
  const [image, setImage] = useState<string | null>(null);
  
  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        // Reset zoom and pan when new image is uploaded
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleReset = useCallback(() => {
    setTitle("My Photo");
    setTextStyles([]);
    setDateStyles([]);
    setFont(FONTS[9].value); // Pacifico
    setFontSize("18");
    setDate("");
    setTextColor("#0f0f0f");
    setFilter("none");
    setImage(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 1.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const containerRect = imageContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const maxPanX = (containerRect.width * (zoom - 1)) / 2;
      const maxPanY = (containerRect.height * (zoom - 1)) / 2;
      
      const newX = Math.max(-maxPanX, Math.min(maxPanX, e.clientX - dragStart.x));
      const newY = Math.max(-maxPanY, Math.min(maxPanY, e.clientY - dragStart.y));
      
      setPan({ x: newX, y: newY });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile panning
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const containerRect = imageContainerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      const maxPanX = (containerRect.width * (zoom - 1)) / 2;
      const maxPanY = (containerRect.height * (zoom - 1)) / 2;
      
      const newX = Math.max(-maxPanX, Math.min(maxPanX, touch.clientX - dragStart.x));
      const newY = Math.max(-maxPanY, Math.min(maxPanY, touch.clientY - dragStart.y));
      
      setPan({ x: newX, y: newY });
    }
  }, [isDragging, zoom, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse wheel zoom - use native event listener to properly prevent default
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || !image) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(prev => Math.max(0.5, Math.min(1.2, prev + delta)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [image]);

  // Touch event listeners for mobile panning (non-passive to allow preventDefault)
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container || !image) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [image, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Constrain pan when zoom changes
  useEffect(() => {
    if (zoom <= 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  const applyFilter = useCallback((ctx: CanvasRenderingContext2D, imageData: ImageData, filterValue: string): ImageData => {
    const data = imageData.data;
    
    if (filterValue === "none") return imageData;
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      if (filterValue.includes("grayscale")) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = gray;
      }
      
      if (filterValue.includes("sepia")) {
        const amount = filterValue.includes("50%") ? 0.5 : filterValue.includes("30%") ? 0.3 : 1;
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = r + (tr - r) * amount;
        g = g + (tg - g) * amount;
        b = b + (tb - b) * amount;
      }
      
      if (filterValue.includes("saturate")) {
        const amount = filterValue.includes("150%") ? 1.5 : filterValue.includes("140%") ? 1.4 : 0.8;
        const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * amount;
        g = gray + (g - gray) * amount;
        b = gray + (b - gray) * amount;
      }
      
      if (filterValue.includes("contrast")) {
        const amount = filterValue.includes("110%") ? 1.1 : 0.9;
        r = ((r / 255 - 0.5) * amount + 0.5) * 255;
        g = ((g / 255 - 0.5) * amount + 0.5) * 255;
        b = ((b / 255 - 0.5) * amount + 0.5) * 255;
      }
      
      if (filterValue.includes("brightness(110%)")) {
        r *= 1.1;
        g *= 1.1;
        b *= 1.1;
      }
      
      if (filterValue.includes("hue-rotate")) {
        const angle = 20 * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newR = r * (0.213 + cos * 0.787 - sin * 0.213) + g * (0.715 - cos * 0.715 - sin * 0.715) + b * (0.072 - cos * 0.072 + sin * 0.928);
        const newG = r * (0.213 - cos * 0.213 + sin * 0.143) + g * (0.715 + cos * 0.285 + sin * 0.140) + b * (0.072 - cos * 0.072 - sin * 0.283);
        const newB = r * (0.213 - cos * 0.213 - sin * 0.787) + g * (0.715 - cos * 0.715 + sin * 0.715) + b * (0.072 + cos * 0.928 + sin * 0.072);
        r = newR;
        g = newG;
        b = newB;
      }
      
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
    
    return imageData;
  }, []);

  const handleDownload = useCallback(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Match the CSS preview behavior exactly
      // Preview uses: object-cover with transform: scale(zoom) translate(pan.x/zoom, pan.y/zoom)
      
      const previewBoxAspect = 4 / 3;
      const imgAspect = img.width / img.height;
      
      // Calculate base source area (what object-cover shows at zoom=1)
      let baseSourceW: number;
      let baseSourceH: number;
      let baseSourceX: number;
      let baseSourceY: number;
      
      if (imgAspect > previewBoxAspect) {
        // Image is wider - crop sides
        baseSourceH = img.height;
        baseSourceW = img.height * previewBoxAspect;
        baseSourceX = (img.width - baseSourceW) / 2;
        baseSourceY = 0;
      } else {
        // Image is taller - crop top/bottom
        baseSourceW = img.width;
        baseSourceH = img.width / previewBoxAspect;
        baseSourceX = 0;
        baseSourceY = (img.height - baseSourceH) / 2;
      }
      
      // When zoom > 1, we see LESS of the image (zoomed in)
      // When zoom < 1, we see the same but scaled smaller (with potential background)
      // The CSS uses scale(zoom), so at zoom=0.5, the image is 50% size
      
      // For export, we want to capture what's visible:
      // At zoom > 1: Take a smaller portion of the source (1/zoom of the base)
      // At zoom = 1: Take the full base source
      // At zoom < 1: Take the full base source (it's just displayed smaller in preview)
      
      let sourceW: number;
      let sourceH: number;
      let sourceX: number;
      let sourceY: number;
      
      if (zoom >= 1) {
        // Zoomed in - take a smaller portion
        sourceW = baseSourceW / zoom;
        sourceH = baseSourceH / zoom;
        
        // Calculate center offset then apply pan
        // Pan is in screen pixels, convert to source pixels
        const panSourceX = (pan.x / zoom) * (sourceW / baseSourceW) * zoom;
        const panSourceY = (pan.y / zoom) * (sourceH / baseSourceH) * zoom;
        
        sourceX = baseSourceX + (baseSourceW - sourceW) / 2 - panSourceX;
        sourceY = baseSourceY + (baseSourceH - sourceH) / 2 - panSourceY;
        
        // Clamp to valid bounds
        sourceX = Math.max(baseSourceX, Math.min(sourceX, baseSourceX + baseSourceW - sourceW));
        sourceY = Math.max(baseSourceY, Math.min(sourceY, baseSourceY + baseSourceH - sourceH));
      } else {
        // Zoomed out - still use base source, but output will show it smaller with background
        sourceW = baseSourceW;
        sourceH = baseSourceH;
        sourceX = baseSourceX;
        sourceY = baseSourceY;
      }
      
      // Output dimensions - use source dimensions for high quality
      // But cap at reasonable max to avoid huge files
      const maxDimension = 4000;
      let outputImageW = Math.round(sourceW);
      let outputImageH = Math.round(sourceH);
      
      if (outputImageW > maxDimension || outputImageH > maxDimension) {
        const scaleFactor = maxDimension / Math.max(outputImageW, outputImageH);
        outputImageW = Math.round(outputImageW * scaleFactor);
        outputImageH = Math.round(outputImageH * scaleFactor);
      }
      
      // For zoom < 1, the image area shows the image smaller with background
      let actualImageW = outputImageW;
      let actualImageH = outputImageH;
      
      if (zoom < 1) {
        // Image is scaled down in the preview
        actualImageW = Math.round(outputImageW * zoom);
        actualImageH = Math.round(outputImageH * zoom);
      }
      
      // Scale padding and text relative to output size
      const scale = Math.max(outputImageW, outputImageH) / 1000;
      const padding = Math.round(40 * scale);
      const textAreaHeight = Math.round(120 * scale);
      const borderRadius = Math.round(24 * scale);
      
      const width = outputImageW + padding * 2;
      const height = outputImageH + textAreaHeight + padding * 2;
      
      canvas.width = width;
      canvas.height = height;

      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      // White background with rounded corners
      roundRect(0, 0, width, height, Math.round(32 * scale));
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Draw image area background (for zoom < 1 where image doesn't fill)
      ctx.save();
      roundRect(padding, padding, outputImageW, outputImageH, borderRadius);
      ctx.clip();
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(padding, padding, outputImageW, outputImageH);
      
      // Draw the image
      if (zoom < 1) {
        // Center the smaller image
        const offsetX = padding + (outputImageW - actualImageW) / 2;
        const offsetY = padding + (outputImageH - actualImageH) / 2;
        ctx.drawImage(
          img, 
          sourceX, sourceY, sourceW, sourceH,
          offsetX, offsetY, actualImageW, actualImageH
        );
      } else {
        // Normal draw
        ctx.drawImage(
          img, 
          sourceX, sourceY, sourceW, sourceH,
          padding, padding, outputImageW, outputImageH
        );
      }
      
      ctx.restore();
      
      // Apply filter if any
      if (filter !== "none") {
        const imageData = ctx.getImageData(0, 0, width, height);
        const filteredData = applyFilter(ctx, imageData, filter);
        ctx.putImageData(filteredData, 0, 0);
      }
      
      // Draw text
      const scaledFontSize = Math.round(parseInt(fontSize) * scale * 2);
      const fontWeight = textStyles.includes("bold") ? "bold" : "normal";
      const fontStyle = textStyles.includes("italic") ? "italic" : "normal";
      
      let fontFamily = font;
      if (font.includes("Playfair")) fontFamily = "Playfair Display, serif";
      else if (font.includes("Libre")) fontFamily = "Libre Baskerville, serif";
      else if (font.includes("Courier")) fontFamily = "Courier New, monospace";
      else if (font.includes("Georgia")) fontFamily = "Georgia, serif";
      else if (font.includes("Garamond")) fontFamily = "EB Garamond, serif";
      else if (font.includes("DM Serif")) fontFamily = "DM Serif Display, serif";
      else if (font.includes("Comic")) fontFamily = "Comic Neue, cursive";
      else if (font.includes("Caveat")) fontFamily = "Caveat, cursive";
      else if (font.includes("Dancing")) fontFamily = "Dancing Script, cursive";
      else if (font.includes("Pacifico")) fontFamily = "Pacifico, cursive";
      else if (font.includes("Shadows")) fontFamily = "Shadows Into Light, cursive";
      else if (font.includes("Indie")) fontFamily = "Indie Flower, cursive";
      
      ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const titleY = outputImageH + padding + textAreaHeight * 0.4;
      ctx.fillText(title || "Untitled", width / 2, titleY);
      
      if (textStyles.includes("underline")) {
        const textWidth = ctx.measureText(title || "Untitled").width;
        ctx.beginPath();
        ctx.moveTo((width - textWidth) / 2, titleY + scaledFontSize / 2 + 4 * scale);
        ctx.lineTo((width + textWidth) / 2, titleY + scaledFontSize / 2 + 4 * scale);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
      }

      if (date) {
        const dateFontWeight = dateStyles.includes("bold") ? "bold" : "normal";
        const dateFontStyle = dateStyles.includes("italic") ? "italic" : "normal";
        const dateFontSize = Math.round(18 * scale);
        ctx.font = `${dateFontStyle} ${dateFontWeight} ${dateFontSize}px ${fontFamily}`;
        ctx.fillStyle = "#9ca3af";
        const dateText = new Date(date).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        });
        const dateY = titleY + scaledFontSize * 0.8;
        ctx.fillText(dateText, width / 2, dateY);
        
        if (dateStyles.includes("underline")) {
          const dateTextWidth = ctx.measureText(dateText).width;
          ctx.beginPath();
          ctx.moveTo((width - dateTextWidth) / 2, dateY + dateFontSize / 2 + 2 * scale);
          ctx.lineTo((width + dateTextWidth) / 2, dateY + dateFontSize / 2 + 2 * scale);
          ctx.strokeStyle = "#9ca3af";
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
        }
      }

      // Download as high quality PNG
      const link = document.createElement("a");
      link.download = `${(title || "photo").replace(/\s+/g, "_")}_hq.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      
      toast.success("Photo downloaded!", {
        description: "Your retro photo has been saved",
        duration: 3000,
      });
    };
    img.src = image;
  }, [title, textStyles, dateStyles, font, fontSize, date, textColor, filter, image, zoom, pan, applyFilter]);

  const isBold = textStyles.includes("bold");
  const isItalic = textStyles.includes("italic");
  const isUnderline = textStyles.includes("underline");
  
  const isDateBold = dateStyles.includes("bold");
  const isDateItalic = dateStyles.includes("italic");
  const isDateUnderline = dateStyles.includes("underline");

  return (
    <TooltipProvider>
      <SmoothCursor />
      <div className="min-h-screen min-h-[100dvh] bg-[#fafafa] relative overflow-x-hidden">
        {/* Beautiful dot pattern background */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d1d5db 1.5px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />
        {/* Soft color gradient overlays */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -10%, rgba(244, 114, 182, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 90% 40%, rgba(167, 139, 250, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 10% 60%, rgba(96, 165, 250, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 50% 100%, rgba(251, 191, 36, 0.06) 0%, transparent 50%)
            `,
          }}
        />
        
        <div className="relative z-10 min-h-screen min-h-[100dvh] flex flex-col">
          {/* Minimal Header */}
          <header className="shrink-0 py-3 px-4 sm:py-4 sm:px-6 border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-base sm:text-lg font-medium text-neutral-800 tracking-tight">
                  RetroClick
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* GitHub Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href="https://github.com/StarKnightt/retroclick" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">View on GitHub</p></TooltipContent>
                </Tooltip>
                
                {/* Buy Me a Coffee Link */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href="https://buymeacoffee.com/prasen" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 border border-neutral-200 hover:border-amber-200 transition-all text-xs sm:text-sm font-medium"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 00-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 00-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 01-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 013.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 01-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 01-4.743.295 37.059 37.059 0 01-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0011.343.376.483.483 0 01.535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 01.39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 01-.169.364z"/>
                      </svg>
                      <span className="hidden sm:inline">Coffee</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Buy me a coffee ☕</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Preview - Fixed height on mobile */}
            <div className="shrink-0 lg:flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-[#fafafa] overflow-hidden">
              <div className="w-full max-w-sm sm:max-w-md">
                {/* Photo Card */}
                <div 
                  className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-100 p-4 sm:p-6 pb-6 sm:pb-8 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] sm:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-700"
                >
                  {/* Image Area with Zoom Controls */}
                  <div className="relative">
                    <div 
                      ref={imageContainerRef}
                      className={`aspect-[4/3] relative overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-50 mb-4 sm:mb-5 ${
                        image ? (zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default') : 'cursor-pointer'
                      } group select-none touch-none`}
                      onClick={!image ? handleUpload : undefined}
                      onMouseDown={image ? handleMouseDown : undefined}
                      onMouseMove={image ? handleMouseMove : undefined}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform duration-200 pointer-events-none"
                          style={{ 
                            filter,
                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            transformOrigin: 'center center',
                          }}
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 transition-all group-hover:text-neutral-400">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-dashed border-neutral-200 flex items-center justify-center mb-3 sm:mb-4 group-hover:border-neutral-300 transition-colors">
                            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">Tap to upload</span>
                          <span className="text-[10px] sm:text-xs text-neutral-300 mt-1">JPG, PNG, WebP</span>
                        </div>
                      )}
                      
                      {/* Zoom hint overlay - hidden on mobile */}
                      {image && zoom === 1 && (
                        <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 shadow-lg">
                            Scroll to zoom • Drag to pan
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Zoom Controls */}
                    {image && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 sm:gap-1 bg-white rounded-full shadow-lg border border-neutral-100 p-0.5 sm:p-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={handleZoomOut}
                              disabled={zoom <= 0.5}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">Zoom Out</p></TooltipContent>
                        </Tooltip>
                        
                        <button
                          onClick={handleZoomReset}
                          className="px-1.5 sm:px-2 h-7 sm:h-8 rounded-full text-[10px] sm:text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-all min-w-[40px] sm:min-w-[48px]"
                        >
                          {Math.round(zoom * 100)}%
                        </button>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={handleZoomIn}
                              disabled={zoom >= 1.2}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">Zoom In</p></TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {/* Title Area */}
                  <div className="text-center px-2 sm:px-4 mt-6 sm:mt-8">
                    <h2
                      className="leading-relaxed break-words transition-all"
                      style={{
                        fontFamily: font,
                        fontWeight: isBold ? "bold" : "normal",
                        fontStyle: isItalic ? "italic" : "normal",
                        textDecoration: isUnderline ? "underline" : "none",
                        color: textColor,
                        fontSize: `${Math.max(14, parseInt(fontSize) - 2)}px`,
                        textUnderlineOffset: '4px',
                      }}
                    >
                      {title || "Untitled"}
                    </h2>
                    {date && (
                      <p 
                        className={`text-[10px] sm:text-xs mt-2 sm:mt-3 text-neutral-400 tracking-wide ${isDateBold ? 'font-bold' : 'font-medium'} ${isDateItalic ? 'italic' : ''} ${isDateUnderline ? 'underline' : ''}`}
                        style={{ fontFamily: font }}
                      >
                        {new Date(date).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Made by credit */}
                <p className="text-center mt-4 sm:mt-5 text-[10px] sm:text-xs text-neutral-400">
                  Made with ❤️ by{" "}
                  <a 
                    href="https://prasen.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-600 hover:text-neutral-900 underline underline-offset-2 transition-colors font-medium"
                  >
                    Prasenjit
                  </a>
                </p>
              </div>
            </div>

            {/* Right: Controls - Scrollable on mobile */}
            <div className="flex-1 lg:flex-none lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-100 bg-white flex flex-col overflow-hidden">
              <Tabs defaultValue="text" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start rounded-none border-b border-neutral-100 bg-transparent p-0 h-auto shrink-0">
                  <TabsTrigger 
                    value="text" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-neutral-400 data-[state=active]:text-neutral-900 tracking-wide uppercase transition-all"
                  >
                    Text
                  </TabsTrigger>
                  <TabsTrigger 
                    value="style" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-neutral-400 data-[state=active]:text-neutral-900 tracking-wide uppercase transition-all"
                  >
                    Style
                  </TabsTrigger>
                  <TabsTrigger 
                    value="filters" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-neutral-400 data-[state=active]:text-neutral-900 tracking-wide uppercase transition-all"
                  >
                    Filters
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {/* Text Tab */}
                  <TabsContent value="text" className="m-0 p-4 sm:p-6 space-y-5 sm:space-y-7">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-widest">Title</Label>
                        <span className={`text-[10px] sm:text-[11px] font-medium ${title.length > 30 ? "text-rose-500" : "text-neutral-300"}`}>
                          {title.length}/35
                        </span>
                      </div>
                      <Input
                        value={title}
                        onChange={(e) => {
                          if (e.target.value.length <= 35) {
                            setTitle(e.target.value);
                          }
                        }}
                        placeholder="Enter title..."
                        className="h-10 sm:h-12 text-sm font-medium border-neutral-100 focus-visible:ring-neutral-200 bg-neutral-50/50 rounded-lg sm:rounded-xl"
                        maxLength={35}
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-widest">Text Style</Label>
                      <ToggleGroup 
                        type="multiple" 
                        value={textStyles}
                        onValueChange={setTextStyles}
                        className="justify-start gap-1.5 sm:gap-2"
                      >
                        <ToggleGroupItem 
                          value="bold" 
                          className="w-9 h-9 sm:w-11 sm:h-11 text-xs sm:text-sm font-bold border border-neutral-100 bg-white text-neutral-500 data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:border-neutral-900 rounded-lg sm:rounded-xl transition-all"
                        >
                          B
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="italic" 
                          className="w-9 h-9 sm:w-11 sm:h-11 text-xs sm:text-sm font-medium italic border border-neutral-100 bg-white text-neutral-500 data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:border-neutral-900 rounded-lg sm:rounded-xl transition-all"
                        >
                          I
                        </ToggleGroupItem>
                        <ToggleGroupItem 
                          value="underline" 
                          className="w-9 h-9 sm:w-11 sm:h-11 text-xs sm:text-sm font-medium underline border border-neutral-100 bg-white text-neutral-500 data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:border-neutral-900 rounded-lg sm:rounded-xl transition-all"
                        >
                          U
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-widest">Date</Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-10 sm:h-12 text-sm border-neutral-100 focus-visible:ring-neutral-200 bg-neutral-50/50 rounded-lg sm:rounded-xl"
                      />
                      {date && (
                        <div className="pt-2">
                          <Label className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2 block">Date Style</Label>
                          <ToggleGroup 
                            type="multiple" 
                            value={dateStyles}
                            onValueChange={setDateStyles}
                            className="justify-start gap-1.5 sm:gap-2"
                          >
                            <ToggleGroupItem 
                              value="bold" 
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border transition-all ${isDateBold ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:border-neutral-300 text-neutral-500'}`}
                            >
                              <span className="font-bold text-sm">B</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="italic" 
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border transition-all ${isDateItalic ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:border-neutral-300 text-neutral-500'}`}
                            >
                              <span className="italic text-sm">I</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="underline" 
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border transition-all ${isDateUnderline ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:border-neutral-300 text-neutral-500'}`}
                            >
                              <span className="underline text-sm">U</span>
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Style Tab */}
                  <TabsContent value="style" className="m-0 p-4 sm:p-6 space-y-5 sm:space-y-7">
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-widest">Font</Label>
                      <Select value={font} onValueChange={setFont}>
                        <SelectTrigger className="h-10 sm:h-12 text-sm font-medium border-neutral-100 bg-neutral-50/50 rounded-lg sm:rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map((f) => (
                            <SelectItem key={f.name} value={f.value} style={{ fontFamily: f.value }}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-widest">Size</Label>
                        <span className="text-[10px] sm:text-xs font-medium text-neutral-500 bg-neutral-100 px-1.5 sm:px-2 py-0.5 rounded-md">{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="36"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="w-full h-1 bg-neutral-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                      />
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <Label className="text-[10px] sm:text-[11px] font-medium text-neutral-400 uppercase tracking-widest">Color</Label>
                      <div className="flex flex-wrap gap-2 sm:gap-2.5">
                        {PRESET_COLORS.map((color) => (
                          <Tooltip key={color}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setTextColor(color)}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 ${
                                  textColor === color 
                                    ? "ring-2 ring-offset-2 ring-neutral-300 scale-105" 
                                    : "hover:ring-1 hover:ring-offset-1 hover:ring-neutral-200"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">{color}</p></TooltipContent>
                          </Tooltip>
                        ))}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border border-dashed border-neutral-200 flex items-center justify-center hover:border-neutral-300 transition-colors bg-white">
                              <span className="text-neutral-400 text-xs sm:text-sm">+</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3 sm:p-4">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-24 h-24 sm:w-32 sm:h-32 cursor-pointer rounded-xl"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Filters Tab */}
                  <TabsContent value="filters" className="m-0 p-4 sm:p-6">
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {FILTERS.map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setFilter(f.value)}
                          className={`flex flex-col items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 hover:bg-neutral-50 ${
                            filter === f.value 
                              ? "bg-neutral-50 ring-1 ring-neutral-200" 
                              : ""
                          }`}
                        >
                          <div
                            className={`w-full aspect-square rounded-lg sm:rounded-xl overflow-hidden border transition-all ${
                              filter === f.value ? "border-neutral-300" : "border-neutral-100"
                            }`}
                          >
                            <div
                              className="w-full h-full bg-gradient-to-br from-rose-200 via-amber-100 to-sky-200"
                              style={{ filter: f.value }}
                            />
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-medium tracking-wide ${
                            filter === f.value ? "text-neutral-800" : "text-neutral-400"
                          }`}>{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Action Buttons - Fixed at bottom */}
              <div className="shrink-0 p-3 sm:p-5 border-t border-neutral-100 space-y-2 sm:space-y-3 bg-white">
                <div className="flex gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="flex-1 h-9 sm:h-11 text-[10px] sm:text-xs font-medium tracking-wide border-neutral-100 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 rounded-lg sm:rounded-xl transition-all uppercase"
                  >
                    Reset
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleUpload}
                    className="flex-1 h-9 sm:h-11 text-[10px] sm:text-xs font-medium tracking-wide border-neutral-100 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 rounded-lg sm:rounded-xl transition-all uppercase"
                  >
                    Upload
                  </Button>
                </div>
                <Button 
                  onClick={handleDownload}
                  disabled={!image}
                  className="w-full h-10 sm:h-12 text-[10px] sm:text-xs font-semibold tracking-widest uppercase bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg sm:rounded-xl transition-all hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {image ? "Download Photo" : "Upload an image first"}
                </Button>
              </div>
            </div>
          </main>
        </div>

        {/* Hidden Elements */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </TooltipProvider>
  );
}
