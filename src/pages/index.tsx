import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import axios from "axios";
import { Geist } from "next/font/google";
import Head from "next/head";

import { TabNavigation, ConversionType } from "../components/TabNavigation";
import { DropzoneArea } from "../components/DropzoneArea";
import { ImageAdvancedOptions } from "../components/ImageAdvancedOptions";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const API_BASE = "/api/convert";

export default function Home() {
  const [conversionType, setConversionType] =
    useState<ConversionType>("office-to-pdf");
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Image Controls
  const [imageFormat, setImageFormat] = useState("webp");
  const [imageQuality, setImageQuality] = useState(80);
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [dimensionType, setDimensionType] = useState<"px" | "%">("%");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalSize, setOriginalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Handle interconnected aspect ratio scaling dynamically
  const handleWidthChange = (val: string) => {
    setImageWidth(val);
    if (maintainAspectRatio && val !== "") {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        if (dimensionType === "%") {
          setImageHeight(val);
        } else if (originalSize) {
          const ratio = originalSize.height / originalSize.width;
          setImageHeight(Math.round(numVal * ratio).toString());
        }
      }
    } else if (val === "" && maintainAspectRatio) {
      setImageHeight("");
    }
  };

  const handleHeightChange = (val: string) => {
    setImageHeight(val);
    if (maintainAspectRatio && val !== "") {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        if (dimensionType === "%") {
          setImageWidth(val);
        } else if (originalSize) {
          const ratio = originalSize.width / originalSize.height;
          setImageWidth(Math.round(numVal * ratio).toString());
        }
      }
    } else if (val === "" && maintainAspectRatio) {
      setImageWidth("");
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);

    const formData = new FormData();
    formData.append("file", file);
    if (conversionType === "image") {
      formData.append("format", imageFormat);
      formData.append("quality", imageQuality.toString());
      if (imageWidth) formData.append("width", imageWidth.toString());
      if (imageHeight) formData.append("height", imageHeight.toString());
      formData.append("dimensionType", dimensionType);
      formData.append("maintainAspectRatio", maintainAspectRatio.toString());
    }

    try {
      const response = await axios.post(
        `${API_BASE}/${conversionType}`,
        formData,
        {
          responseType: "blob", // Expect binary file stream back
        },
      );

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;

      let ext = "";
      if (conversionType === "office-to-pdf") ext = "pdf";
      if (conversionType === "pdf-to-docx") ext = "docx";
      if (conversionType === "image") ext = imageFormat;

      const originalName =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      link.setAttribute("download", `${originalName}-converted.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      // Give a slight delay before resetting for UX
      setTimeout(() => setFile(null), 1000);
    } catch (error) {
      console.error(error);
      alert(
        "Conversion failed. Ensure the server is running, the file is valid, and Gotenberg/Python are setup properly.",
      );
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#050510] relative text-white ${geistSans.className} overflow-hidden font-sans`}
    >
      <Head>
        <title>Handvert - File Conversions</title>
        <meta
          name="description"
          content="Beautiful private document and image conversion"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>

      {/* Aesthetic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
              Handvert
            </span>{" "}
            Magic.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto">
            Lightning fast, private file conversions. Transform your files right
            on your own machine.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-[32px] p-2 shadow-2xl overflow-hidden"
        >
          <TabNavigation
            conversionType={conversionType}
            onTabChange={(type) => {
              setConversionType(type);
              setFile(null);
            }}
          />

          <div className="px-2 md:px-6 pb-8 pt-4">
            <AnimatePresence mode="popLayout">
              {conversionType === "image" && (
                <ImageAdvancedOptions
                  imageFormat={imageFormat}
                  setImageFormat={setImageFormat}
                  imageQuality={imageQuality}
                  setImageQuality={setImageQuality}
                  imageWidth={imageWidth}
                  handleWidthChange={handleWidthChange}
                  imageHeight={imageHeight}
                  handleHeightChange={handleHeightChange}
                  dimensionType={dimensionType}
                  setDimensionType={(t) => {
                    setDimensionType(t);
                    setImageWidth("");
                    setImageHeight("");
                  }}
                  maintainAspectRatio={maintainAspectRatio}
                  setMaintainAspectRatio={setMaintainAspectRatio}
                />
              )}
            </AnimatePresence>

            <DropzoneArea
              conversionType={conversionType}
              file={file}
              onFileSelected={setFile}
              onOriginalSizeCalculated={setOriginalSize}
            />

            {/* Action Area */}
            <div className="mt-6">
              <button
                onClick={handleConvert}
                disabled={!file || isConverting}
                className={`relative w-full overflow-hidden flex items-center justify-center gap-2 py-4 rounded-[18px] text-base font-bold transition-all duration-300 ${
                  !file || isConverting
                    ? "bg-white/[0.05] text-gray-500 cursor-not-allowed border border-white/[0.05]"
                    : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_30px_-5px_theme(colors.indigo.500)]"
                }`}
              >
                {isConverting ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin w-5 h-5" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:auto-fix" className="w-5 h-5" />
                    Convert Now
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
