export const containerVariant = (
  stagger: number = 0.04,
  delay: number = 0,
) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});
export const itemTransitionVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const itemTransitionVariantFadeInFromLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0 },
};

export const itemTransitionVariantFadeInFromTop = {
  hidden: { opacity: 0, y: -40 },
  show: { opacity: 1, y: 0 },
};

export const itemTransitionVariantFadeInFromTopSmall = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0 },
};

export const transitionStop = 40;
