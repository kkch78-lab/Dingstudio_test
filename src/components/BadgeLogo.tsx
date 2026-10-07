import React from 'react';

interface BadgeLogoProps {
  className?: string;
}

export const BadgeLogo: React.FC<BadgeLogoProps> = ({ className = 'w-20 h-20' }) => {
  return (
    <svg
      id="wongok-sports-badge-logo"
      viewBox="0 0 400 400"
      className={`${className} select-none drop-shadow-md transition-transform duration-500 hover:rotate-6`}
    >
      <circle
        cx="200"
        cy="200"
        r="192"
        fill="#e5e7eb"
        stroke="#9ca3af"
        strokeWidth="4"
      />
      <circle
        cx="200"
        cy="200"
        r="182"
        fill="#ffffff"
        stroke="#d1d5db"
        strokeWidth="1.5"
      />
      <circle
        cx="200"
        cy="200"
        r="170"
        fill="#2d6a4f"
        stroke="#1b4332"
        strokeWidth="3.5"
      />
      <circle
        cx="200"
        cy="200"
        r="130"
        fill="#f8fafc"
        stroke="#2d6a4f"
        strokeWidth="2"
      />

      <path
        id="top-text-arc"
        d="M 58,200 A 142,142 0 1,1 342,200"
        fill="none"
        stroke="none"
      />
      <path
        id="bottom-text-arc"
        d="M 342,200 A 142,142 0 0,1 58,200"
        fill="none"
        stroke="none"
      />

      <text className="font-sans font-black tracking-widest fill-white text-[17px]">
        <textPath href="#top-text-arc" startOffset="50%" textAnchor="middle">
          WONGOK MIDDLE SCHOOL
        </textPath>
      </text>

      <text className="font-sans font-black tracking-widest fill-white text-[15px]">
        <textPath href="#bottom-text-arc" startOffset="50%" textAnchor="middle">
          SPORTS SUPPORT TEAM
        </textPath>
      </text>

      {/* Left Laurel */}
      <g transform="translate(45, 185) scale(0.6)">
        <path
          d="M15,0 C25,-5 35,-5 40,5 C40,25 20,40 15,45 C10,40 -10,25 15,0 Z"
          fill="#52b788"
        />
      </g>

      {/* Right Laurel */}
      <g transform="translate(332, 185) scale(0.6)">
        <path
          d="M15,0 C25,-5 35,-5 40,5 C40,25 20,40 15,45 C10,40 -10,25 15,0 Z"
          fill="#52b788"
        />
      </g>

      {/* Sunburst Center Icon */}
      <g transform="translate(200, 195) scale(0.85)">
        <path
          d="M-35,10 C-35,-25 35,-25 35,10 Z"
          fill="#ffb703"
          stroke="#e08500"
          strokeWidth="1"
        />
        <circle cx="0" cy="10" r="26" fill="#fb8500" />
        <line
          x1="0"
          y1="-20"
          x2="0"
          y2="-36"
          stroke="#fb8500"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="-18"
          y1="-15"
          x2="-28"
          y2="-27"
          stroke="#fb8500"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="-15"
          x2="28"
          y2="-27"
          stroke="#fb8500"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="-25"
          y1="5"
          x2="-37"
          y2="2"
          stroke="#fb8500"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="25"
          y1="5"
          x2="37"
          y2="2"
          stroke="#fb8500"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Sports Elements Decoration */}
      <g transform="translate(272, 205) rotate(18) scale(0.6)">
        <ellipse
          cx="0"
          cy="0"
          rx="22"
          ry="29"
          fill="#f8fafc"
          stroke="#2d6a4f"
          strokeWidth="4.5"
        />
      </g>

      <g transform="translate(125, 205) rotate(-18) scale(0.6)">
        <circle cx="10" cy="10" r="5" fill="#e63946" />
        <circle cx="10" cy="2" r="3.5" fill="#ffb703" />
        <circle cx="10" cy="18" r="3.5" fill="#ffb703" />
        <circle cx="2" cy="10" r="3.5" fill="#ffb703" />
        <circle cx="18" cy="10" r="3.5" fill="#ffb703" />
      </g>

      <g transform="translate(182, 102) scale(0.85)">
        <path
          d="M10,25 C-6,8 5,-8 20,4 C35,-8 46,8 30,25"
          fill="#e63946"
          stroke="#b7094c"
          strokeWidth="1"
        />
        <path d="M20,6 L20,25" stroke="#f6bd60" strokeWidth="2" />
        <circle cx="20" cy="4" r="3.5" fill="#f6bd60" />
      </g>

      {/* Main Korean Brand Text */}
      <text
        x="200"
        y="162"
        textAnchor="middle"
        className="font-sans font-black text-[44px] tracking-tight fill-emerald-800 filter drop-shadow"
      >
        원더풀
      </text>

      <text
        x="200"
        y="188"
        textAnchor="middle"
        className="font-serif italic font-extrabold text-[19px] fill-amber-700 tracking-wide"
      >
        WON THE
      </text>

      {/* FULL Banner */}
      <rect
        x="110"
        y="198"
        width="180"
        height="52"
        rx="14"
        fill="#e63946"
        stroke="#b7094c"
        strokeWidth="1.5"
      />

      <text
        x="200"
        y="237"
        textAnchor="middle"
        className="font-sans font-black tracking-widest text-[38px] fill-white drop-shadow"
      >
        FULL
      </text>

      {/* Bottom accent smile */}
      <g transform="translate(155, 258) scale(0.8)">
        <path
          d="M10,12 C40,-5 80,5 100,12 C90,20 50,22 10,12 Z"
          fill="#ffb703"
          stroke="#f26419"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
};
