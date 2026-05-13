interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
}

export function CategoryIcon({ category, className = '', size = 14 }: CategoryIconProps) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    className,
  };

  switch (category) {
    // Trending up chart with arrow — represents investing/growth
    case 'Investing':
      return (
        <svg {...iconProps}>
          <path d="M3 20L8 14L12 17L21 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 4H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 20H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        </svg>
      );

    // Credit card / bank card — represents saving/money
    case 'Saving':
      return (
        <svg {...iconProps}>
          <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
          <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // Sun with horizon — represents retirement/leisure
    case 'Retirement':
      return (
        <svg {...iconProps}>
          <path d="M4 18C4 18 6.5 14 12 14C17.5 14 20 18 20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5.64 4.93L7.05 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18.36 4.93L16.95 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // Bitcoin/dollar sign — represents crypto
    case 'Crypto':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
          <path d="M9.5 7.5H13C14.6569 7.5 16 8.84315 16 10.5C16 12.1569 14.6569 13.5 13 13.5H9.5V7.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9.5 13.5H14C15.6569 13.5 17 14.8431 17 16.5C17 18.1569 15.6569 19.5 14 19.5H9.5V13.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M12 5V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 19.5V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // House with chimney — represents real estate
    case 'Real Estate':
      return (
        <svg {...iconProps}>
          <path d="M3 11L12 3L21 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10.5V19.5C5 20.3284 5.67157 21 6.5 21H17.5C18.3284 21 19 20.3284 19 19.5V10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 4V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // Rocket — represents side hustles/launch
    case 'Side Hustles':
      return (
        <svg {...iconProps}>
          <path d="M12 2C12 2 8 6 8 12L6 14L10 14L12 22L14 14L18 14L16 12C16 6 12 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <path d="M16 12L19 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      );

    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
