import React from 'react';
import { motion } from 'framer-motion';

interface OdometerDigitProps {
  digit: string;
  className?: string;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const OdometerDigit: React.FC<OdometerDigitProps> = ({ digit, className = '' }) => {
  const isNumber = !isNaN(parseInt(digit, 10));

  if (!isNumber) {
    return <span className={`inline-block ${className}`}>{digit}</span>;
  }

  const numericValue = parseInt(digit, 10);

  return (
    <span className={`inline-block overflow-hidden relative align-baseline ${className}`} style={{ height: '1em', lineHeight: '1em' }}>
      <motion.span
        initial={false}
        animate={{ y: `-${numericValue * 10}%` }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        className="flex flex-col items-center absolute left-0 right-0 top-0"
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-full flex items-center justify-center leading-none" style={{ height: '1em' }}>
            {d}
          </span>
        ))}
      </motion.span>
      {/* Invisible placeholder character to maintain exact width and height inline box */}
      <span className="opacity-0 invisible select-none" aria-hidden="true">
        {digit}
      </span>
    </span>
  );
};

interface OdometerNumberProps {
  value: string | number;
  className?: string;
}

export const OdometerNumber: React.FC<OdometerNumberProps> = ({ value, className = '' }) => {
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const characters = stringValue.split('');

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums ${className}`}>
      {characters.map((char, index) => (
        <OdometerDigit key={`${index}-${char}`} digit={char} className={className} />
      ))}
    </span>
  );
};
