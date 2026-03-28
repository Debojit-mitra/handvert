import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export type ConversionType = 'office-to-pdf' | 'pdf-to-docx' | 'image';

interface TabNavigationProps {
    conversionType: ConversionType;
    onTabChange: (type: ConversionType) => void;
}

export function TabNavigation({ conversionType, onTabChange }: TabNavigationProps) {
    const tabs: { id: ConversionType; label: string; icon: string }[] = [
        { id: 'office-to-pdf', label: 'Office to PDF', icon: 'mdi:file-pdf-box' },
        { id: 'pdf-to-docx', label: 'PDF to Word', icon: 'mdi:file-word-box' },
        { id: 'image', label: 'Convert Image', icon: 'mdi:image-multiple' }
    ];

    return (
        <div className="flex justify-between items-center p-2 mb-4 bg-black/20 rounded-[24px]">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex items-center justify-center flex-1 gap-2 py-3 px-4 rounded-[18px] text-sm font-medium transition-colors z-10 ${
                        conversionType === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {conversionType === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-white/[0.08] shadow-sm border border-white/[0.05] rounded-[18px]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    <Icon icon={tab.icon} className="w-5 h-5 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
