import React, { useState } from 'react';
import { LogoSymbolOption } from '../../types';

interface BrandLogoProps {
  logoType?: 'preset_symbol' | 'custom_image';
  logoUrl?: string;
  symbolId?: LogoSymbolOption;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  primaryColor?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoType = 'preset_symbol',
  logoUrl,
  symbolId = 'double_leaf',
  size = 'md',
  primaryColor = '#10b981',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  // Dimension mapping
  const sizeMap = {
    xs: { container: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-xs' },
    sm: { container: 'w-7 h-7', icon: 'w-4.5 h-4.5', text: 'text-sm' },
    md: { container: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-base' },
    lg: { container: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-lg' },
    xl: { container: 'w-14 h-14', icon: 'w-9 h-9', text: 'text-2xl' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Custom Image rendering
  if (logoType === 'custom_image' && logoUrl && !imageError) {
    return (
      <div
        className={`${currentSize.container} relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden bg-white/10 shadow-sm border border-white/20 ${className}`}
      >
        <img
          src={logoUrl}
          alt="Company Logo"
          className="w-full h-full object-contain p-0.5"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Preset Vector Symbols
  const renderSymbol = () => {
    switch (symbolId) {
      case 'double_leaf':
        // Iconic AeuxGlobal styled double-leaf emblem
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <span
              className="w-[58%] h-[28%] rounded-full rotate-[-35deg] transform block absolute left-[12%] top-[22%] shadow-sm transition-all"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}99`
              }}
            />
            <span
              className="w-[58%] h-[28%] rounded-full rotate-[-35deg] transform block absolute right-[12%] bottom-[22%] opacity-85 transition-all"
              style={{
                backgroundColor: primaryColor,
                filter: 'brightness(1.25)',
                boxShadow: `0 0 6px ${primaryColor}66`
              }}
            />
          </div>
        );

      case 'tech_hexagon':
        return (
          <svg viewBox="0 0 32 32" className="w-[85%] h-[85%]" fill="none">
            <polygon
              points="16,3 28,10 28,22 16,29 4,22 4,10"
              stroke={primaryColor}
              strokeWidth="2.5"
              fill={`${primaryColor}22`}
            />
            <circle cx="16" cy="16" r="4.5" fill={primaryColor} />
            <path
              d="M16 3 L16 11.5 M28 22 L20 18 M4 22 L12 18"
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'quantum_prism':
        return (
          <svg viewBox="0 0 32 32" className="w-[85%] h-[85%]" fill="none">
            <path
              d="M16 2 L29 11 L16 30 L3 11 Z"
              stroke={primaryColor}
              strokeWidth="2"
              fill={`${primaryColor}25`}
            />
            <path
              d="M16 2 L16 30 M3 11 L29 11 M3 11 L16 19 L29 11"
              stroke={primaryColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'globe_core':
        return (
          <svg viewBox="0 0 32 32" className="w-[85%] h-[85%]" fill="none">
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke={primaryColor}
              strokeWidth="2.2"
              fill={`${primaryColor}18`}
            />
            <ellipse
              cx="16"
              cy="16"
              rx="6"
              ry="12"
              stroke={primaryColor}
              strokeWidth="1.8"
            />
            <line
              x1="4"
              y1="16"
              x2="28"
              y2="16"
              stroke={primaryColor}
              strokeWidth="1.8"
            />
            <line
              x1="6.5"
              y1="9"
              x2="25.5"
              y2="9"
              stroke={primaryColor}
              strokeWidth="1.2"
              strokeDasharray="1 1"
            />
            <line
              x1="6.5"
              y1="23"
              x2="25.5"
              y2="23"
              stroke={primaryColor}
              strokeWidth="1.2"
              strokeDasharray="1 1"
            />
          </svg>
        );

      case 'crown_executive':
        return (
          <svg viewBox="0 0 32 32" className="w-[85%] h-[85%]" fill="none">
            <path
              d="M4 23 L28 23 L25 10 L19 16 L16 7 L13 16 L7 10 Z"
              stroke={primaryColor}
              strokeWidth="2.2"
              strokeLinejoin="round"
              fill={`${primaryColor}30`}
            />
            <line
              x1="6"
              y1="26"
              x2="26"
              y2="26"
              stroke={primaryColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="6" r="1.5" fill={primaryColor} />
            <circle cx="7" cy="9" r="1.5" fill={primaryColor} />
            <circle cx="25" cy="9" r="1.5" fill={primaryColor} />
          </svg>
        );

      case 'shield_crest':
        return (
          <svg viewBox="0 0 32 32" className="w-[85%] h-[85%]" fill="none">
            <path
              d="M16 3 L27 7 C27 18 16 27 16 29 C16 27 5 18 5 7 Z"
              stroke={primaryColor}
              strokeWidth="2.2"
              fill={`${primaryColor}22`}
            />
            <path
              d="M16 7 L23 10 C23 17 16 23 16 24 C16 23 9 17 9 10 Z"
              fill={primaryColor}
              opacity="0.85"
            />
            <path
              d="M13 15 L15.5 17.5 L19.5 12.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      default:
        return (
          <div
            className="w-full h-full rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            A
          </div>
        );
    }
  };

  return (
    <div
      className={`${currentSize.container} relative flex items-center justify-center shrink-0 transition-transform ${className}`}
    >
      {renderSymbol()}
    </div>
  );
};
