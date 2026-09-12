import React, { useState } from 'react';
import { AssetClassSummary } from '../services/api';
import { OdometerNumber } from './OdometerNumber';

interface PortfolioChartProps {
  data: AssetClassSummary[];
  totalMarketValue: number;
}

const COLOR_MAP: Record<string, string> = {
  Equity: '#D4FF3F', // Acid Chartreuse
  Bond: '#00E5FF',   // Electric Cyan
  Cash: '#8E929F',   // Telemetry Gray
  RealEstate: '#FF9500',
  Crypto: '#FF2D55',
};

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data, totalMarketValue }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 font-mono">
      {/* 1. Pro Audio Signal Bar (100% width strip divided by hairline gaps) */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-[#8E929F] uppercase tracking-widest">
          <span>ALLOCATION SIGNAL SPECTRUM</span>
          <span>100.0% TOTAL</span>
        </div>

        <div className="h-3 w-full bg-[#050505] border border-[#1a1c23] flex p-[1px] gap-[2px]">
          {data.map((item, idx) => {
            const percentage = totalMarketValue > 0 ? (item.marketValue / totalMarketValue) * 100 : 0;
            if (percentage <= 0) return null;
            const barColor = COLOR_MAP[item.assetClass] || '#D4FF3F';
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ width: `${percentage}%`, backgroundColor: barColor }}
                className={`h-full transition-opacity cursor-pointer ${
                  hoveredIdx !== null && !isHovered ? 'opacity-30' : 'opacity-100'
                }`}
                title={`${item.assetClass}: ${formatCurrency(item.marketValue)} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Vertical Stack "Tape" Rows */}
      <div className="space-y-3 pt-2">
        {data.map((item, idx) => {
          const percentage = totalMarketValue > 0 ? (item.marketValue / totalMarketValue) * 100 : 0;
          const barColor = COLOR_MAP[item.assetClass] || '#D4FF3F';
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2.5 border transition-all cursor-pointer ${
                isHovered
                  ? 'border-[#D4FF3F] bg-[#111318]'
                  : 'border-[#1a1c23] hover:border-[#4A4E5D] bg-[#050505]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#4A4E5D]">
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span
                    className="w-1.5 h-1.5 inline-block"
                    style={{ backgroundColor: barColor }}
                  />
                  <span className="font-bold text-[#F5F5F7] uppercase tracking-wider">
                    {item.assetClass}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <OdometerNumber
                    value={formatCurrency(item.marketValue)}
                    className="text-[#F5F5F7] font-bold text-xs"
                  />
                  <span className="text-[11px] text-[#8E929F] w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Hairline Indicator Strip */}
              <div className="h-[2px] w-full bg-[#1a1c23] overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.max(percentage, 0.5)}%`,
                    backgroundColor: isHovered ? '#D4FF3F' : barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
