import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

interface ImageAdvancedOptionsProps {
  imageFormat: string;
  setImageFormat: (v: string) => void;
  imageQuality: number;
  setImageQuality: (v: number) => void;
  imageWidth: string;
  handleWidthChange: (v: string) => void;
  imageHeight: string;
  handleHeightChange: (v: string) => void;
  dimensionType: "px" | "%";
  setDimensionType: (v: "px" | "%") => void;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (v: boolean) => void;
}

export function ImageAdvancedOptions({
  imageFormat,
  setImageFormat,
  imageQuality,
  setImageQuality,
  imageWidth,
  handleWidthChange,
  imageHeight,
  handleHeightChange,
  dimensionType,
  setDimensionType,
  maintainAspectRatio,
  setMaintainAspectRatio,
}: ImageAdvancedOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 space-y-4"
    >
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Target Format
        </label>
        <select
          value={imageFormat}
          onChange={(e) => setImageFormat(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="webp" className="bg-[#111]">
            WebP (Recommended)
          </option>
          <option value="png" className="bg-[#111]">
            PNG
          </option>
          <option value="jpeg" className="bg-[#111]">
            JPEG
          </option>
        </select>
      </div>

      {/* Advanced Settings */}
      <div className="bg-black/30 rounded-[24px] p-4 md:p-6 border border-white/[0.03] shadow-inner">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Icon icon="mdi:tune-variant" className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200">
            Advanced Options
          </h3>
        </div>

        <div className="space-y-6">
          {/* Quality Slider */}
          <div className="bg-white/[0.02] p-5 rounded-[20px] border border-white/[0.03]">
            <div className="flex justify-between items-center text-sm mb-5">
              <span className="text-gray-400 font-medium">
                Compression Quality
              </span>
              <span className="text-indigo-300 font-mono bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 text-xs">
                {imageQuality}%
              </span>
            </div>
            <div className="px-1">
              <input
                type="range"
                min="10"
                max="100"
                value={imageQuality}
                onChange={(e) => setImageQuality(Number(e.target.value))}
                className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-white/[0.02] p-3 md:p-5 rounded-[20px] border border-white/[0.03]">
            <div className="flex justify-between items-center mb-5">
              <span className="text-gray-400 text-sm font-medium">
                Resize Target
              </span>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/[0.05]">
                <button
                  onClick={() => setDimensionType("%")}
                  className={`px-3 py-1.5 text-[0.7rem] sm:text-xs font-medium rounded-md transition-colors ${dimensionType === "%" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Percent (%)
                </button>
                <button
                  onClick={() => setDimensionType("px")}
                  className={`px-3 py-1.5 text-[0.7rem] sm:text-xs font-medium rounded-md transition-colors ${dimensionType === "px" ? "bg-indigo-500/20 text-indigo-300" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Pixels (px)
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center mb-1">
              <div className="flex-1 relative group">
                <input
                  type="number"
                  placeholder={dimensionType === "%" ? "Scale W" : "Width"}
                  value={imageWidth}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] text-white placeholder-gray-600 text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold uppercase pointer-events-none transition-colors group-hover:text-indigo-400/50">
                  {dimensionType}
                </span>
              </div>

              {/* Central Linked Toggle Icon */}
              <div className="flex items-center justify-center shrink-0 w-10 z-10 px-1">
                <button
                  onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    maintainAspectRatio
                      ? "bg-indigo-500/20 border border-indigo-500/60 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                      : "bg-white/[0.03] border border-white/[0.08] text-gray-500 hover:text-gray-300 hover:bg-white/[0.08]"
                  }`}
                  title={
                    maintainAspectRatio
                      ? "Unlock aspect ratio"
                      : "Lock aspect ratio"
                  }
                >
                  <Icon
                    icon={
                      maintainAspectRatio
                        ? "mdi:link-variant"
                        : "mdi:link-variant-off"
                    }
                    className="w-4 h-4"
                  />
                </button>
              </div>

              <div className="flex-1 relative group">
                <input
                  type="number"
                  placeholder={dimensionType === "%" ? "Scale H" : "Height"}
                  value={imageHeight}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] text-white placeholder-gray-600 text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold uppercase pointer-events-none transition-colors group-hover:text-indigo-400/50">
                  {dimensionType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
