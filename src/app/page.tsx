"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PRESET_COLORS = [
  "#1a1a1a", "#E74C3C", "#E67E22", "#F1C40F", "#2ECC71",
  "#1ABC9C", "#3498DB", "#9B59B6", "#E91E63", "#795548",
  "#607D8B", "#FF5722",
];

const FONTS = [
  { name: "Comic Sans", value: "'Comic Sans MS', cursive" },
  { name: "Courier", value: "'Courier New', monospace" },
  { name: "Times", value: "'Times New Roman', serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
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
  const [font, setFont] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState("18");
  const [date, setDate] = useState("");
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [filter, setFilter] = useState("none");
  const [image, setImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleReset = useCallback(() => {
    setTitle("My Photo");
    setTextStyles([]);
    setFont(FONTS[0].value);
    setFontSize("18");
    setDate("");
    setTextColor("#1a1a1a");
    setFilter("none");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

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
    // Prevent download if no image
    if (!image) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 20;
    const imageAreaWidth = 352;
    const imageAreaHeight = 264;
    const textAreaHeight = 80;
    const borderRadius = 12;
    
    const width = imageAreaWidth + padding * 2;
    const height = imageAreaHeight + textAreaHeight + padding * 2;
    
    canvas.width = width;
    canvas.height = height;

    // Helper function to draw rounded rectangle
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
    roundRect(0, 0, width, height, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const drawTextAndFinish = () => {
      // Draw title
      const fontSizeNum = parseInt(fontSize);
      const fontWeight = textStyles.includes("bold") ? "bold" : "normal";
      const fontStyle = textStyles.includes("italic") ? "italic" : "normal";
      
      // Extract font family name for canvas
      let fontFamily = font;
      if (font.includes("Comic Sans")) fontFamily = "Comic Sans MS, cursive";
      else if (font.includes("Courier")) fontFamily = "Courier New, monospace";
      else if (font.includes("Times")) fontFamily = "Times New Roman, serif";
      else if (font.includes("Arial")) fontFamily = "Arial, sans-serif";
      else if (font.includes("Georgia")) fontFamily = "Georgia, serif";
      else if (font.includes("Verdana")) fontFamily = "Verdana, sans-serif";
      
      ctx.font = `${fontStyle} ${fontWeight} ${fontSizeNum}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const titleY = imageAreaHeight + padding + 30;
      ctx.fillText(title || "Untitled", width / 2, titleY);
      
      // Draw underline if needed
      if (textStyles.includes("underline")) {
        const textWidth = ctx.measureText(title || "Untitled").width;
        ctx.beginPath();
        ctx.moveTo((width - textWidth) / 2, titleY + fontSizeNum / 2 + 2);
        ctx.lineTo((width + textWidth) / 2, titleY + fontSizeNum / 2 + 2);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw date if present
      if (date) {
        ctx.font = `12px ${fontFamily}`;
        ctx.fillStyle = "#9ca3af";
        ctx.fillText(new Date(date).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        }), width / 2, titleY + 28);
      }

      // Download
      const link = document.createElement("a");
      link.download = `${(title || "photo").replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Save context state
      ctx.save();
      
      // Create rounded clipping path for image
      roundRect(padding, padding, imageAreaWidth, imageAreaHeight, borderRadius);
      ctx.clip();
      
      // Calculate dimensions to cover the area (like object-cover)
      const imgAspect = img.width / img.height;
      const boxAspect = imageAreaWidth / imageAreaHeight;
      
      let sourceX = 0, sourceY = 0, sourceW = img.width, sourceH = img.height;
      
      if (imgAspect > boxAspect) {
        // Image is wider - crop sides
        sourceW = img.height * boxAspect;
        sourceX = (img.width - sourceW) / 2;
      } else {
        // Image is taller - crop top/bottom
        sourceH = img.width / boxAspect;
        sourceY = (img.height - sourceH) / 2;
      }
      
      // Draw image
      ctx.drawImage(
        img, 
        sourceX, sourceY, sourceW, sourceH,
        padding, padding, imageAreaWidth, imageAreaHeight
      );
      
      // Restore context to remove clip
      ctx.restore();
      
      // Apply filter manually (need to respect rounded corners)
      if (filter !== "none") {
        const imageData = ctx.getImageData(0, 0, width, height);
        const filteredData = applyFilter(ctx, imageData, filter);
        ctx.putImageData(filteredData, 0, 0);
      }
      
      drawTextAndFinish();
    };
    img.src = image;
  }, [title, textStyles, font, fontSize, date, textColor, filter, image, applyFilter]);

  const isBold = textStyles.includes("bold");
  const isItalic = textStyles.includes("italic");
  const isUnderline = textStyles.includes("underline");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-neutral-50 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Dot Pattern Background */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: 0.5,
          }}
        />
        
        <div className="relative z-10 h-screen flex flex-col">
          {/* Header */}
          <header className="flex-shrink-0 py-5 px-6 border-b border-neutral-200 bg-white/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <h1 className="text-xl font-semibold text-neutral-800 tracking-tight">
                Retro Photo Editor
              </h1>
              <span className="text-xs font-medium text-neutral-400 tracking-wide uppercase">Free Tool</span>
            </div>
          </header>

          {/* Main Content - Side by Side */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row">
              
              {/* Left: Preview */}
              <div className="flex-1 p-6 lg:p-10 flex items-center justify-center overflow-auto">
                <div className="w-full max-w-sm">
                  {/* Photo Card */}
                  <div 
                    className="bg-white rounded-2xl border border-neutral-200 p-5 pb-8 shadow-xl transition-all duration-500 hover:shadow-2xl"
                    style={{ transform: "rotate(-1deg)" }}
                  >
                    {/* Image Area */}
                    <div 
                      className="aspect-[4/3] relative overflow-hidden rounded-xl bg-neutral-100 mb-5 cursor-pointer group"
                      onClick={handleUpload}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt="Preview"
                          className="w-full h-full object-cover transition-all duration-300"
                          style={{ filter }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 transition-all group-hover:text-neutral-500">
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center mb-3 group-hover:border-neutral-400 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium">Click to upload</span>
                        </div>
                      )}
                    </div>

                    {/* Title Area */}
                    <div className="text-center px-2">
                      <h2
                        className="leading-relaxed break-words transition-all"
                        style={{
                          fontFamily: font,
                          fontWeight: isBold ? "bold" : "normal",
                          fontStyle: isItalic ? "italic" : "normal",
                          textDecoration: isUnderline ? "underline" : "none",
                          color: textColor,
                          fontSize: `${fontSize}px`,
                        }}
                      >
                        {title || "Untitled"}
                      </h2>
                      {date && (
                        <p className="text-xs mt-2 text-neutral-400 font-medium" style={{ fontFamily: font }}>
                          {new Date(date).toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Controls */}
              <div className="w-full lg:w-[400px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-white/80 backdrop-blur-sm flex flex-col">
                <Tabs defaultValue="text" className="flex-1 flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b border-neutral-200 bg-transparent p-0 h-auto flex-shrink-0">
                    <TabsTrigger 
                      value="text" 
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-800 data-[state=active]:bg-transparent py-4 text-sm font-medium text-neutral-500 data-[state=active]:text-neutral-900 transition-all"
                    >
                      Text
                    </TabsTrigger>
                    <TabsTrigger 
                      value="style" 
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-800 data-[state=active]:bg-transparent py-4 text-sm font-medium text-neutral-500 data-[state=active]:text-neutral-900 transition-all"
                    >
                      Style
                    </TabsTrigger>
                    <TabsTrigger 
                      value="filters" 
                      className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-800 data-[state=active]:bg-transparent py-4 text-sm font-medium text-neutral-500 data-[state=active]:text-neutral-900 transition-all"
                    >
                      Filters
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto">
                    {/* Text Tab */}
                    <TabsContent value="text" className="m-0 p-6 space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</Label>
                          <span className={`text-xs font-medium ${title.length > 30 ? "text-red-500" : "text-neutral-400"}`}>
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
                          className="h-11 text-sm font-medium border-neutral-200 focus-visible:ring-neutral-300 bg-white"
                          maxLength={35}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Text Style</Label>
                        <ToggleGroup 
                          type="multiple" 
                          value={textStyles}
                          onValueChange={setTextStyles}
                          className="justify-start gap-2"
                        >
                          <ToggleGroupItem 
                            value="bold" 
                            className="w-10 h-10 text-sm font-bold border border-neutral-200 bg-white text-neutral-600 data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:border-neutral-900 rounded-lg transition-all"
                          >
                            B
                          </ToggleGroupItem>
                          <ToggleGroupItem 
                            value="italic" 
                            className="w-10 h-10 text-sm font-medium italic border border-neutral-200 bg-white text-neutral-600 data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:border-neutral-900 rounded-lg transition-all"
                          >
                            I
                          </ToggleGroupItem>
                          <ToggleGroupItem 
                            value="underline" 
                            className="w-10 h-10 text-sm font-medium underline border border-neutral-200 bg-white text-neutral-600 data-[state=on]:bg-neutral-900 data-[state=on]:text-white data-[state=on]:border-neutral-900 rounded-lg transition-all"
                          >
                            U
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</Label>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="h-11 text-sm border-neutral-200 focus-visible:ring-neutral-300 bg-white"
                        />
                      </div>
                    </TabsContent>

                    {/* Style Tab */}
                    <TabsContent value="style" className="m-0 p-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Font</Label>
                        <Select value={font} onValueChange={setFont}>
                          <SelectTrigger className="h-11 text-sm font-medium border-neutral-200 bg-white">
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

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Size</Label>
                          <span className="text-xs font-medium text-neutral-400">{fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="36"
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                          className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Color</Label>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_COLORS.map((color) => (
                            <Tooltip key={color}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setTextColor(color)}
                                  className={`w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 ${
                                    textColor === color 
                                      ? "ring-2 ring-offset-2 ring-neutral-400 scale-110" 
                                      : "hover:ring-1 hover:ring-offset-1 hover:ring-neutral-300"
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">{color}</p></TooltipContent>
                            </Tooltip>
                          ))}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="w-8 h-8 rounded-full border border-dashed border-neutral-300 flex items-center justify-center hover:border-neutral-400 transition-colors">
                                <span className="text-neutral-400 text-sm">+</span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                              <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-28 h-28 cursor-pointer rounded-lg"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Filters Tab */}
                    <TabsContent value="filters" className="m-0 p-6">
                      <div className="grid grid-cols-4 gap-3">
                        {FILTERS.map((f) => (
                          <button
                            key={f.name}
                            onClick={() => setFilter(f.value)}
                            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 hover:bg-neutral-100 ${
                              filter === f.value 
                                ? "bg-neutral-100 ring-1 ring-neutral-300" 
                                : ""
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-lg overflow-hidden border transition-all ${
                                filter === f.value ? "border-neutral-400" : "border-neutral-200"
                              }`}
                            >
                              <div
                                className="w-full h-full bg-gradient-to-br from-rose-200 via-amber-100 to-sky-200"
                                style={{ filter: f.value }}
                              />
                            </div>
                            <span className={`text-[10px] font-medium ${
                              filter === f.value ? "text-neutral-800" : "text-neutral-500"
                            }`}>{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>

                {/* Action Buttons - Fixed at bottom */}
                <div className="flex-shrink-0 p-5 border-t border-neutral-200 bg-white/90 backdrop-blur-sm space-y-3">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="flex-1 h-11 text-sm font-medium border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 rounded-xl transition-all"
                    >
                      Reset
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleUpload}
                      className="flex-1 h-11 text-sm font-medium border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 rounded-xl transition-all"
                    >
                      Upload
                    </Button>
                  </div>
                  <Button 
                    onClick={handleDownload}
                    disabled={!image}
                    className="w-full h-12 text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {image ? "Download Photo" : "Upload an image first"}
                  </Button>
                </div>
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
