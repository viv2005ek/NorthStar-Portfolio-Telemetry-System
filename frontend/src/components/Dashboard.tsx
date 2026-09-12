import React, { useEffect, useState, useCallback } from 'react';
import { resetHoldingsApi, fetchDashboardApi, DashboardResponse, clearAuth, User } from '../services/api';
import { UploadCSV } from './UploadCSV';
import { PortfolioChart } from './PortfolioChart';
import { OdometerNumber } from './OdometerNumber';
import { ConfirmModal } from './ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'holdings' | 'analytics'>('overview');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Live microsecond ticker clock
  const [timeString, setTimeString] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const iso = now.toISOString().split('T')[1].slice(0, 12);
      setTimeString(`${iso} UTC`);
    };
    updateClock();
    const interval = setInterval(updateClock, 41);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDashboardApi();
      setData(res);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number };
      if (errorObj.status === 401) {
        clearAuth();
        onLogout();
        return;
      }
      setError(
        errorObj.message?.toUpperCase() ||
          'TELEMETRY FETCH ERROR // FAILED TO RETRIEVE PORTFOLIO METRICS'
      );
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  const executeResetHoldings = async () => {
    setResetting(true);
    setError(null);
    try {
      await resetHoldingsApi();
      await loadDashboard();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message?.toUpperCase() || 'FAILED TO RESET DATASET // BACKEND CONNECTION ERROR');
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatPercent = (val: number) => {
    const pct = val * 100;
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  // Helper for rendering ASCII block character bar
  const renderBlockBar = (percentage: number) => {
    const totalBlocks = 16;
    const filledBlocks = Math.round((percentage / 100) * totalBlocks);
    const emptyBlocks = Math.max(0, totalBlocks - filledBlocks);
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] flex flex-col font-mono selection:bg-[#D4FF3F] selection:text-[#050505] relative overflow-x-hidden">
      {/* Top Telemetry Header (36px high, razor hairline bottom) */}
      <header className="h-[36px] border-b border-[#1a1c23] bg-[#0a0b0e] px-4 flex items-center justify-between shrink-0 text-xs tracking-widest uppercase">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="Flam AI Logo" className="h-4 w-auto object-contain opacity-90" />
          <span className="w-1.5 h-1.5 bg-[#D4FF3F] inline-block animate-pulse" />
          <span className="font-bold text-[#F5F5F7] tracking-wider">NORTHSTAR</span>
          <span className="text-[#4A4E5D]">//</span>
          <span className="text-[#8E929F]">TENANT:</span>
          <span className="text-[#D4FF3F] font-bold">
            [{data?.tenantName || user.tenantName}]
          </span>
          <span className="hidden sm:inline text-[#D4FF3F] text-[10px] font-bold tracking-wider">
            ● ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#4A4E5D]">
          <span className="hidden md:inline text-[#8E929F]">{timeString}</span>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="hover:text-[#D4FF3F] border border-[#1a1c23] hover:border-[#D4FF3F] px-2 py-0.5 transition-colors cursor-pointer disabled:opacity-50 text-[10px]"
          >
            {loading ? 'REFRESHING...' : 'RE-SYNC [R]'}
          </button>
          {data?.hasData && (
            <button
              onClick={() => setShowResetModal(true)}
              disabled={resetting}
              className="hover:text-[#FF3B30] border border-[#1a1c23] hover:border-[#FF3B30] px-2 py-0.5 transition-colors cursor-pointer disabled:opacity-50 text-[10px] text-[#8E929F]"
              title="Clear tenant holdings dataset"
            >
              {resetting ? 'CLEARING...' : 'RESET DATASET [CLR]'}
            </button>
          )}
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Main Content View */}
        <main className="flex-1 flex flex-col p-6 md:p-10 space-y-10 max-w-7xl w-full mx-auto">
          {/* Global Error Banner */}
          {error && (
            <div className="p-3 bg-hatched-negative border border-[#FF3B30] text-[#FF3B30] text-xs uppercase tracking-widest">
              {error}
            </div>
          )}

          {/* 1. HERO PORTFOLIO VALUE DISPLAY */}
          <section className="space-y-4 relative border-b border-[#1a1c23] pb-8">
            <div className="flex justify-between items-end text-[10px] text-[#8E929F] uppercase tracking-widest">
              <span>01 // NET AGGREGATED PORTFOLIO VALUATION</span>
              <span>
                PERIOD: {data ? `${formatDateDisplay(data.startDate)} → ${formatDateDisplay(data.endDate)}` : '—'}
              </span>
            </div>

            {/* Asymmetric Hero Value */}
            <div className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-6">
              <div className="space-y-1">
                {loading && !data ? (
                  /* Booting Caret State (No Shimmer Skeleton!) */
                  <div className="font-serif-display text-7xl sm:text-8xl md:text-9xl text-[#4A4E5D] tracking-tight flex items-center">
                    <span>$0.00</span>
                    <span className="w-4 h-16 bg-[#D4FF3F] ml-2 animate-caret inline-block" />
                  </div>
                ) : !data?.hasData ? (
                  /* Empty Portfolio Value State */
                  <div className="font-serif-display text-7xl sm:text-8xl md:text-9xl text-[#4A4E5D] tracking-tight">
                    $0.00
                  </div>
                ) : (
                  /* Live Mechanical Rolling Odometer Hero Value */
                  <div className="font-serif-display text-7xl sm:text-8xl md:text-[130px] lg:text-[150px] leading-none text-[#F5F5F7] tracking-tight">
                    <OdometerNumber value={formatCurrency(data.endMarketValue)} />
                  </div>
                )}
              </div>

              {/* Period Return Terminal String */}
              {data && data.hasData && (
                <div className="flex items-center gap-3 font-mono text-sm tracking-wider uppercase">
                  <div
                    className={`px-3 py-1.5 border font-bold ${
                      data.periodReturn >= 0
                        ? 'border-[#D4FF3F] bg-hatched-positive text-[#D4FF3F]'
                        : 'border-[#FF3B30] bg-hatched-negative text-[#FF3B30]'
                    }`}
                  >
                    {data.periodReturn >= 0 ? '▲' : '▼'}{' '}
                    <OdometerNumber value={formatPercent(data.periodReturn)} />
                  </div>
                  <span className="text-[11px] text-[#8E929F]">
                    / PERIOD RETURN
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 2. SUB-TELEMETRY GRID (4 High-Density Spec Blocks) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 bg-[#0a0b0e] border border-[#1a1c23] space-y-1">
              <div className="text-[10px] text-[#8E929F] uppercase tracking-widest">
                INITIAL MARKET VALUE
              </div>
              <div className="text-base font-bold text-[#F5F5F7] pt-1">
                {loading && !data ? (
                  <span className="text-[#4A4E5D]">
                    —<span className="animate-caret">█</span>
                  </span>
                ) : data ? (
                  formatCurrency(data.startMarketValue)
                ) : (
                  '—'
                )}
              </div>
              <div className="text-[9px] text-[#4A4E5D]">
                AS OF {formatDateDisplay(data?.startDate || null)}
              </div>
            </div>

            <div className="p-4 bg-[#0a0b0e] border border-[#1a1c23] space-y-1">
              <div className="text-[10px] text-[#8E929F] uppercase tracking-widest">
                TERMINAL MARKET VALUE
              </div>
              <div className="text-base font-bold text-[#D4FF3F] pt-1">
                {loading && !data ? (
                  <span className="text-[#4A4E5D]">
                    —<span className="animate-caret">█</span>
                  </span>
                ) : data ? (
                  formatCurrency(data.endMarketValue)
                ) : (
                  '—'
                )}
              </div>
              <div className="text-[9px] text-[#4A4E5D]">
                AS OF {formatDateDisplay(data?.endDate || null)}
              </div>
            </div>

            <div className="p-4 bg-[#0a0b0e] border border-[#1a1c23] space-y-1">
              <div className="text-[10px] text-[#8E929F] uppercase tracking-widest">
                ALLOCATED ASSET CLASSES
              </div>
              <div className="text-base font-bold text-[#F5F5F7] pt-1">
                {loading && !data ? (
                  <span className="text-[#4A4E5D]">
                    —<span className="animate-caret">█</span>
                  </span>
                ) : data ? (
                  `${data.assetClasses.length} CLASSES`
                ) : (
                  '—'
                )}
              </div>
              <div className="text-[9px] text-[#4A4E5D]">ACTIVE ALLOCATIONS</div>
            </div>

            <div className="p-4 bg-[#0a0b0e] border border-[#1a1c23] space-y-1">
              <div className="text-[10px] text-[#8E929F] uppercase tracking-widest">
                AUDIT VERIFICATION
              </div>
              <div className="text-base font-bold text-[#D4FF3F] pt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#D4FF3F] inline-block" />
                {data?.hasData ? 'VERIFIED' : 'EMPTY RECORD'}
              </div>
              <div className="text-[9px] text-[#4A4E5D]">ISOLATION VERIFIED</div>
            </div>
          </section>

          {/* 3. EMPTY STATE OVERLAY OR OPERATIONAL MODULES */}
          {data && !data.hasData ? (
            /* Mandatory Terminal Empty State */
            <div className="border border-[#1a1c23] bg-[#0a0b0e] p-12 text-center space-y-6 font-mono">
              <div className="text-[#D4FF3F] text-2xl font-bold tracking-widest">
                [ SYSTEM STATUS :: NO DATASET ]
              </div>
              <div className="text-xs text-[#8E929F] tracking-widest uppercase max-w-md mx-auto">
                NO HOLDINGS ON RECORD — UPLOAD CSV TO BEGIN
              </div>
              <div className="pt-4 max-w-md mx-auto">
                <UploadCSV onUploadSuccess={loadDashboard} />
              </div>
            </div>
          ) : (
            /* Operational Content Tabs */
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
                >
                  {/* Left 2 Cols: Signal Breakdown & Table */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Allocation Signal Telemetry */}
                    <div className="bg-[#0a0b0e] border border-[#1a1c23] p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1a1c23] pb-3 text-xs uppercase tracking-widest">
                        <span className="font-bold text-[#F5F5F7]">
                          02 // ASSET ALLOCATION BREAKDOWN
                        </span>
                        <span className="text-[10px] text-[#8E929F]">
                          VALUATION TELEMETRY
                        </span>
                      </div>
                      {data && (
                        <PortfolioChart
                          data={data.assetClasses}
                          totalMarketValue={data.endMarketValue}
                        />
                      )}
                    </div>

                    {/* Holdings Terminal Readout */}
                    <div className="bg-[#0a0b0e] border border-[#1a1c23] p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a1c23] pb-3 text-xs uppercase tracking-widest">
                        <span className="font-bold text-[#F5F5F7]">
                          03 // HOLDINGS SUMMARY READOUT
                        </span>
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          placeholder="FILTER ASSET CLASS..."
                          className="px-2.5 py-1 bg-[#050505] border border-[#1a1c23] focus:border-[#D4FF3F] text-[10px] text-[#F5F5F7] focus:outline-none uppercase tracking-wider rounded-none"
                        />
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-[#050505] uppercase text-[#8E929F] text-[10px] border-b border-[#1a1c23] tracking-widest">
                            <tr>
                              <th className="py-2.5 px-3">INDEX / ASSET</th>
                              <th className="py-2.5 px-3">SPECTRUM BLOCK</th>
                              <th className="py-2.5 px-3 text-right">MARKET VALUE</th>
                              <th className="py-2.5 px-3 text-right">WEIGHT</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1a1c23]">
                            {data?.assetClasses
                              .filter((item) =>
                                item.assetClass
                                  .toLowerCase()
                                  .includes(searchFilter.toLowerCase())
                              )
                              .map((item, idx) => {
                                const percentage =
                                  data.endMarketValue > 0
                                    ? (item.marketValue / data.endMarketValue) * 100
                                    : 0;
                                return (
                                  <tr
                                    key={idx}
                                    className="hover:bg-[#111318] transition-colors"
                                  >
                                    <td className="py-3 px-3 font-bold text-[#F5F5F7] tracking-wider uppercase">
                                      <span className="text-[#4A4E5D] mr-2">
                                        {idx < 9 ? `0${idx + 1}` : idx + 1}
                                      </span>
                                      {item.assetClass}
                                    </td>
                                    <td className="py-3 px-3 text-[11px] text-[#D4FF3F] tracking-widest select-none">
                                      {renderBlockBar(percentage)}
                                    </td>
                                    <td className="py-3 px-3 text-right font-bold text-[#F5F5F7]">
                                      <OdometerNumber
                                        value={formatCurrency(item.marketValue)}
                                      />
                                    </td>
                                    <td className="py-3 px-3 text-right text-[#8E929F]">
                                      {percentage.toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Dataset Importer Port */}
                  <div className="lg:col-span-1">
                    <UploadCSV onUploadSuccess={loadDashboard} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'holdings' && (
                <motion.div
                  key="holdings"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0a0b0e] border border-[#1a1c23] p-6 space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-[#1a1c23] pb-4 text-xs uppercase tracking-widest">
                    <span className="font-bold text-[#F5F5F7]">
                      FULL HOLDINGS TELEMETRY READOUT
                    </span>
                    <span className="text-[#D4FF3F]">
                      TOTAL RECORDS: {data?.assetClasses.length || 0}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#050505] uppercase text-[#8E929F] text-[10px] border-b border-[#1a1c23] tracking-widest">
                        <tr>
                          <th className="py-3 px-4">SEQ #</th>
                          <th className="py-3 px-4">ASSET CLASS IDENTITY</th>
                          <th className="py-3 px-4">BLOCK WEIGHT VISUALIZER</th>
                          <th className="py-3 px-4 text-right">MARKET VALUE</th>
                          <th className="py-3 px-4 text-right">ALLOCATION RATIO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1c23]">
                        {data?.assetClasses.map((item, idx) => {
                          const percentage =
                            data.endMarketValue > 0
                              ? (item.marketValue / data.endMarketValue) * 100
                              : 0;
                          return (
                            <tr key={idx} className="hover:bg-[#111318] transition-colors">
                              <td className="py-3.5 px-4 text-[#4A4E5D]">
                                {idx < 9 ? `0${idx + 1}` : idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-[#F5F5F7] uppercase tracking-wider">
                                {item.assetClass}
                              </td>
                              <td className="py-3.5 px-4 text-xs text-[#D4FF3F] tracking-widest">
                                {renderBlockBar(percentage)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-[#F5F5F7]">
                                <OdometerNumber value={formatCurrency(item.marketValue)} />
                              </td>
                              <td className="py-3.5 px-4 text-right text-[#8E929F]">
                                {percentage.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0a0b0e] border border-[#1a1c23] p-8 space-y-6 text-xs font-mono"
                >
                  <div className="border-b border-[#1a1c23] pb-4 uppercase tracking-widest font-bold text-[#F5F5F7]">
                    DEEP TELEMETRY & AUDIT MATRIX
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-[#050505] border border-[#1a1c23] space-y-2">
                      <div className="text-[10px] text-[#8E929F] uppercase">
                        VALUATION DELTA
                      </div>
                      <div className="text-xl font-bold text-[#D4FF3F]">
                        {data
                          ? formatCurrency(data.endMarketValue - data.startMarketValue)
                          : '—'}
                      </div>
                      <div className="text-[9px] text-[#4A4E5D]">
                        ABSOLUTE NET CAPITAL CHANGE OVER PERIOD
                      </div>
                    </div>

                    <div className="p-4 bg-[#050505] border border-[#1a1c23] space-y-2">
                      <div className="text-[10px] text-[#8E929F] uppercase">
                        TENANT ISOLATION SPEC
                      </div>
                      <div className="text-sm font-bold text-[#F5F5F7]">
                        TENANT_ID: {user.tenantId} // {user.tenantName}
                      </div>
                      <div className="text-[9px] text-[#4A4E5D]">
                        ISOLATION SCOPE GUARANTEED BY POSTGRES RLS PIPELINE
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>

        {/* Right-Hand 48px Telemetry Control Rail */}
        <aside className="w-full md:w-[56px] bg-[#0a0b0e] border-t md:border-t-0 md:border-l border-[#1a1c23] flex md:flex-col justify-between items-center p-3 shrink-0 text-[10px] tracking-widest uppercase">
          {/* Navigation Controls */}
          <div className="flex md:flex-col gap-2 w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`p-2 border transition-all text-center cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#D4FF3F] bg-[#111318] text-[#D4FF3F] font-bold'
                  : 'border-[#1a1c23] hover:border-[#4A4E5D] text-[#8E929F]'
              }`}
              title="Overview"
            >
              [01]
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={`p-2 border transition-all text-center cursor-pointer ${
                activeTab === 'holdings'
                  ? 'border-[#D4FF3F] bg-[#111318] text-[#D4FF3F] font-bold'
                  : 'border-[#1a1c23] hover:border-[#4A4E5D] text-[#8E929F]'
              }`}
              title="Holdings"
            >
              [02]
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`p-2 border transition-all text-center cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-[#D4FF3F] bg-[#111318] text-[#D4FF3F] font-bold'
                  : 'border-[#1a1c23] hover:border-[#4A4E5D] text-[#8E929F]'
              }`}
              title="Analytics"
            >
              [03]
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex md:flex-col gap-2">
            <button
              onClick={() => {
                clearAuth();
                onLogout();
              }}
              className="p-2 border border-[#1a1c23] hover:border-[#FF3B30] text-[#8E929F] hover:text-[#FF3B30] transition-colors cursor-pointer text-center"
              title="Sign Out"
            >
              [EXIT]
            </button>
          </div>
        </aside>
      </div>

      {/* Sleek Custom Terminal Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="RESET TENANT PORTFOLIO DATASET"
        message={`ARE YOU SURE YOU WANT TO CLEAR ALL HOLDINGS RECORDS FOR TENANT [${data?.tenantName || user.tenantName}]? THIS ACTION IS ATOMIC AND WILL RETURN PORTFOLIO TELEMETRY TO THE ZERO STATE.`}
        confirmText="EXECUTE ATOMIC RESET"
        cancelText="ABORT [ESC]"
        isDanger={true}
        loading={resetting}
        onConfirm={executeResetHoldings}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
