import React, { useState, useRef } from 'react';
import { uploadCSVHoldingsApi, CSVRowError } from '../services/api';
import { motion } from 'framer-motion';

interface UploadCSVProps {
  onUploadSuccess: () => void;
}

export const UploadCSV: React.FC<UploadCSVProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<CSVRowError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccessMessage(null);
      setErrorMessage(null);
      setRowErrors([]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setSuccessMessage(null);
      setErrorMessage(null);
      setRowErrors([]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setRowErrors([]);

    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);

    try {
      const res = await uploadCSVHoldingsApi(file);
      setSuccessMessage(
        `✓ ${res.rowsImported} ROWS COMMITTED / ATOMIC REPLACE / ${timestamp} UTC`
      );
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; errors?: CSVRowError[] };
      setErrorMessage(
        errorObj.message?.toUpperCase() ||
          'VALIDATION FAILED // DATASET ATOMIC REJECTED'
      );
      if (errorObj.errors) {
        setRowErrors(errorObj.errors);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#0a0b0e] border border-[#1a1c23] p-5 font-mono space-y-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1c23] pb-3 text-xs uppercase tracking-widest">
        <span className="font-bold text-[#F5F5F7]">DATASET INGEST PORT</span>
        <span className="text-[10px] text-[#D4FF3F]">ATOMIC OVERWRITE</span>
      </div>

      {/* Technical Drop Zone with Corner Ticks */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-[#D4FF3F] bg-[#111318]'
            : file
            ? 'border-[#D4FF3F]/60 bg-[#050505]'
            : 'border-[#1a1c23] hover:border-[#4A4E5D] bg-[#050505]'
        }`}
      >
        {/* Technical Corner Ticks `┌ ┐ └ ┘` */}
        <span
          className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 transition-colors ${
            isDragOver || file ? 'border-[#D4FF3F] w-3 h-3' : 'border-[#4A4E5D]'
          }`}
        />
        <span
          className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 transition-colors ${
            isDragOver || file ? 'border-[#D4FF3F] w-3 h-3' : 'border-[#4A4E5D]'
          }`}
        />
        <span
          className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 transition-colors ${
            isDragOver || file ? 'border-[#D4FF3F] w-3 h-3' : 'border-[#4A4E5D]'
          }`}
        />
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 transition-colors ${
            isDragOver || file ? 'border-[#D4FF3F] w-3 h-3' : 'border-[#4A4E5D]'
          }`}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="truncate">
              <div className="text-xs font-bold text-[#F5F5F7] truncate uppercase tracking-wider">
                {file.name}
              </div>
              <div className="text-[10px] text-[#8E929F] mt-0.5">
                {(file.size / 1024).toFixed(1)} KB // READY TO COMMIT
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-[10px] text-[#8E929F] hover:text-[#FF3B30] border border-[#1a1c23] hover:border-[#FF3B30] px-2 py-1 uppercase tracking-wider cursor-pointer"
            >
              CLEAR
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#F5F5F7] uppercase tracking-widest">
              DROP CSV // OR CLICK TO BROWSE
            </div>
            <div className="text-[10px] text-[#8E929F] tracking-wider uppercase">
              REQUIRED: DATE · TICKER · ASSET_CLASS · QUANTITY · PRICE
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-2.5 bg-[#D4FF3F] hover:bg-[#c2ef30] active:bg-[#b0dc28] text-[#050505] font-bold text-xs uppercase tracking-widest transition-all relative overflow-hidden disabled:opacity-50 cursor-pointer rounded-[2px]"
        >
          {uploading ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <span>VALIDATING & COMMITTING DATASET...</span>
              <div className="absolute inset-0 bg-[#050505]/20 animate-scanline" />
            </div>
          ) : (
            'EXECUTE ATOMIC COMMIT'
          )}
        </button>
      )}

      {/* Success Readout */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#050505] border border-[#D4FF3F] text-[#D4FF3F] text-[10px] uppercase tracking-widest"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Error Readout with Square Row Tags */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-hatched-negative border border-[#FF3B30] text-[#FF3B30] text-[11px] space-y-2 font-mono"
        >
          <div className="font-bold uppercase tracking-wider">
            {errorMessage}
          </div>

          {rowErrors.length > 0 && (
            <div className="pt-2 border-t border-[#FF3B30]/40 space-y-1.5 max-h-40 overflow-y-auto">
              {rowErrors.map((err, idx) => (
                <div key={idx} className="text-[10px] text-[#F5F5F7] flex items-start gap-2 tracking-wide">
                  <span className="bg-[#FF3B30] text-[#050505] font-bold px-1 py-0.5 shrink-0">
                    [ROW {err.row < 10 ? `0${err.row}` : err.row}]
                  </span>
                  <span>{err.message}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
