import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ConversionType } from './TabNavigation';

interface DropzoneAreaProps {
    conversionType: ConversionType;
    file: File | null;
    onFileSelected: (file: File | null) => void;
    onOriginalSizeCalculated: (size: { width: number; height: number } | null) => void;
}

export function DropzoneArea({ conversionType, file, onFileSelected, onOriginalSizeCalculated }: DropzoneAreaProps) {
    const acceptTypes = (): Record<string, string[]> => {
        if (conversionType === 'office-to-pdf') {
            return {
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
            };
        } else if (conversionType === 'pdf-to-docx') {
            return {
                'application/pdf': ['.pdf']
            };
        } else {
            return {
                'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'],
                'image/heic': ['.heic'],
                'image/heif': ['.heif']
            };
        }
    };

    const getAcceptedExtensions = () => {
        if (conversionType === 'office-to-pdf') return '.docx, .pptx, .xlsx';
        if (conversionType === 'pdf-to-docx') return '.pdf';
        return '.png, .jpg, .webp, .heic, .heif';
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const acceptedFile = acceptedFiles[0];
            onFileSelected(acceptedFile);
            
            // If it's an image, fetch original dimensions natively safely
            if (acceptedFile.type.startsWith('image/')) {
                const url = URL.createObjectURL(acceptedFile);
                const img = new globalThis.Image();
                img.onload = () => {
                    onOriginalSizeCalculated({ width: img.width, height: img.height });
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            } else {
                onOriginalSizeCalculated(null);
            }
        }
    }, [conversionType, onFileSelected, onOriginalSizeCalculated]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        maxFiles: 1,
        accept: acceptTypes()
    });

    return (
        <div 
            {...getRootProps()} 
            className={`relative overflow-hidden group cursor-pointer flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-[24px] transition-all duration-300 ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 
                file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30'
            }`}
        >
            <input {...getInputProps()} />
            
            <AnimatePresence mode="wait">
                {file ? (
                    <motion.div 
                        key="file"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center text-center p-6"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
                            <Icon icon="mdi:check-circle" className="text-emerald-400 w-8 h-8" />
                        </div>
                        <p className="text-lg font-semibold text-white truncate max-w-[250px] sm:max-w-xs">{file.name}</p>
                        <p className="text-gray-400 text-sm mt-1">Ready for magic • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center text-center p-6"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/[0.1]">
                            <Icon icon="mdi:cloud-upload" className="text-indigo-400 w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium text-gray-200">Drag & drop your file here</p>
                        <p className="text-gray-400 text-sm mt-2">or click to browse from your computer</p>
                        <div className="mt-4 px-3 py-1 bg-white/[0.05] rounded-full text-xs text-gray-400 border border-white/[0.05]">
                            Accepts: {getAcceptedExtensions()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
