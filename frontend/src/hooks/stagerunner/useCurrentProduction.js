/**
 * Hook for managing current production state in StageRunner
 */
import { useState, useCallback, useEffect } from 'react';

/**
 * Manages the current production index and provides navigation
 */
export const useCurrentProduction = (productions = [], initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Ensure index is within bounds
  useEffect(() => {
    if (productions.length > 0 && currentIndex >= productions.length) {
      setCurrentIndex(productions.length - 1);
    }
  }, [productions.length, currentIndex]);

  const currentProduction = productions[currentIndex] || null;
  const totalCount = productions.length;
  const hasNext = currentIndex < totalCount - 1;
  const hasPrevious = currentIndex > 0;

  const goToNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex(i => i + 1);
    }
  }, [hasNext]);

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      setCurrentIndex(i => i - 1);
    }
  }, [hasPrevious]);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < totalCount) {
      setCurrentIndex(index);
    }
  }, [totalCount]);

  const goToFirst = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const goToLast = useCallback(() => {
    if (totalCount > 0) {
      setCurrentIndex(totalCount - 1);
    }
  }, [totalCount]);

  return {
    currentProduction,
    currentIndex,
    totalCount,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
    goToIndex,
    goToFirst,
    goToLast,
    // Display string like "3 / 12"
    displayString: totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : '',
  };
};

/**
 * Hook for auto-advancing through productions
 */
export const useProductionAutoAdvance = (
  productions = [],
  currentIndex,
  goToNext,
  enabled = false,
  interval = 10000
) => {
  useEffect(() => {
    if (!enabled || productions.length === 0 || interval <= 0) {
      return;
    }

    const timer = setInterval(() => {
      if (currentIndex < productions.length - 1) {
        goToNext();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, productions.length, currentIndex, goToNext, interval]);
};

export default useCurrentProduction;
