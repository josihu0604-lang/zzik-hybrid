'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface PriceDisplayProps {
  /** Price in USD (base currency) */
  amount: number;
  /** Show currency symbol (default: true) */
  showSymbol?: boolean;
  /** Number of decimal places (default: 0) */
  decimals?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show original USD price as well */
  showOriginal?: boolean;
}

export default function PriceDisplay({
  amount,
  showSymbol = true,
  decimals = 0,
  className = '',
  showOriginal = false,
}: PriceDisplayProps) {
  const { formatPrice, currency } = useCurrency();

  const formattedPrice = formatPrice(amount, { showSymbol, decimals });

  return (
    <div className={className}>
      <span className="font-semibold">{formattedPrice}</span>
      {showOriginal && currency !== 'USD' && (
        <span className="text-sm text-gray-500 ml-2">(${amount})</span>
      )}
    </div>
  );
}

/**
 * Compact price display for lists/cards
 */
export function CompactPrice({ amount, className = '' }: { amount: number; className?: string }) {
  const { formatPrice } = useCurrency();

  return <span className={`font-medium ${className}`}>{formatPrice(amount)}</span>;
}

/**
 * Large price display for checkout/payment
 */
export function LargePrice({ amount, className = '' }: { amount: number; className?: string }) {
  const { formatPrice, currency } = useCurrency();

  return (
    <div className={`text-3xl font-bold ${className}`}>
      {formatPrice(amount)}
      {currency !== 'USD' && (
        <div className="text-sm font-normal text-gray-500 mt-1">${amount} USD</div>
      )}
    </div>
  );
}

/**
 * Price with "from" prefix
 */
export function FromPrice({ amount, className = '' }: { amount: number; className?: string }) {
  const { formatPrice } = useCurrency();

  return (
    <span className={className}>
      <span className="text-gray-600">from </span>
      <span className="font-semibold">{formatPrice(amount)}</span>
    </span>
  );
}

/**
 * Price range display
 */
export function PriceRange({
  min,
  max,
  className = '',
}: {
  min: number;
  max: number;
  className?: string;
}) {
  const { formatPrice } = useCurrency();

  return (
    <span className={className}>
      {formatPrice(min)} - {formatPrice(max)}
    </span>
  );
}
