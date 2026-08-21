import React, { useState } from 'react';
import { OFFICIAL_SEAL_BASE64 } from '../assets/sealBase64';

interface OfficialSealProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabels?: boolean;
  className?: string;
}

export const OfficialSeal: React.FC<OfficialSealProps> = ({
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const dimensionClass = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-28 h-28 sm:w-32 sm:h-32',
    xl: 'w-36 h-36 sm:w-40 sm:h-40',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div
        className={`relative ${dimensionClass} rounded-full overflow-hidden shadow-md border-2 border-red-800/80 bg-white transition-transform hover:scale-105 duration-200`}
      >
        {!hasError ? (
          <img
            src={OFFICIAL_SEAL_BASE64}
            alt="AI Workshop Program Official Seal"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-contain select-none"
          />
        ) : (
          /* High-fidelity Vector SVG Fallback with exact layout */
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full"
            aria-label="Official Seal AI Workshop Program"
          >
            {/* Outer beaded red ring */}
            <circle cx="200" cy="200" r="195" fill="#991b1b" stroke="#7f1d1d" strokeWidth="4" />
            <circle cx="200" cy="200" r="185" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="6,4" />
            
            {/* Inner ring */}
            <circle cx="200" cy="200" r="150" fill="#ffffff" stroke="#991b1b" strokeWidth="6" />

            {/* Circular Curved Text Paths */}
            <defs>
              <path id="top-arc-seal" d="M 55,200 A 145,145 0 0,1 345,200" fill="none" />
              <path id="bottom-arc-seal" d="M 345,200 A 145,145 0 0,1 55,200" fill="none" />
            </defs>

            <text fill="#ffffff" fontSize="24" fontWeight="900" letterSpacing="3">
              <textPath href="#top-arc-seal" startOffset="50%" textAnchor="middle">
                AI WORKSHOP PROGRAM
              </textPath>
            </text>

            <text fill="#ffffff" fontSize="26" fontWeight="900" letterSpacing="4">
              <textPath href="#bottom-arc-seal" startOffset="50%" textAnchor="middle">
                OFFICIAL SEAL
              </textPath>
            </text>

            {/* Stars on sides */}
            <text x="35" y="208" fill="#ffffff" fontSize="28" textAnchor="middle">★</text>
            <text x="365" y="208" fill="#ffffff" fontSize="28" textAnchor="middle">★</text>

            {/* Center Graphic: Binary Streams */}
            <g fill="#991b1b" fontFamily="monospace" fontSize="13" fontWeight="bold" opacity="0.85">
              <text x="135" y="115">10101</text>
              <text x="120" y="135">10011</text>
              <text x="105" y="155">11011</text>
              <text x="100" y="175">010</text>
              <text x="95" y="195">1101</text>
              <text x="90" y="215">0111</text>
              <text x="90" y="235">000</text>
            </g>

            {/* Neural Net Nodes */}
            <g stroke="#991b1b" strokeWidth="2" fill="#991b1b">
              <line x1="260" y1="110" x2="310" y2="135" />
              <line x1="310" y1="135" x2="280" y2="180" />
              <line x1="280" y1="180" x2="320" y2="210" />
              <line x1="260" y1="110" x2="240" y2="150" />
              <line x1="240" y1="150" x2="280" y2="180" />
              <line x1="280" y1="180" x2="290" y2="250" />

              <circle cx="260" cy="110" r="5" />
              <circle cx="310" cy="135" r="6" />
              <circle cx="280" cy="180" r="5" />
              <circle cx="320" cy="210" r="5" />
              <circle cx="240" cy="150" r="4" />
              <circle cx="290" cy="250" r="5" />
            </g>

            {/* Cyborg Robotic Head Silhouette Profile */}
            <path
              d="M 180,120 Q 230,120 240,165 Q 245,190 230,225 L 210,240 L 220,290 L 160,290 L 170,250 L 155,235 L 140,230 L 140,215 L 155,210 L 150,190 L 165,185 L 155,160 Q 155,135 180,120 Z"
              fill="#991b1b"
            />
            {/* Robot Eye & Ear Circle details */}
            <circle cx="215" cy="185" r="16" fill="#ffffff" stroke="#991b1b" strokeWidth="4" />
            <circle cx="215" cy="185" r="8" fill="#991b1b" />
            <rect x="160" y="170" width="20" height="4" fill="#ffffff" />
            <rect x="185" y="240" width="30" height="4" fill="#ffffff" />
            <rect x="180" y="255" width="35" height="4" fill="#ffffff" />
          </svg>
        )}
      </div>

      {showLabels && (
        <div className="mt-1.5 flex flex-col items-center">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-red-900 font-extrabold">
            Official Seal
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold tracking-wide">
            Authenticated Record
          </span>
        </div>
      )}
    </div>
  );
};
