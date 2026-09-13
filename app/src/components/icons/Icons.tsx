import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

/** Base wrapper: 24x24 viewBox, stroke-based, matches the design mockup's icon style. */
function Icon({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const ExchangeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 7h12m0 0-3.5-3.5M19 7l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 17H5m0 0 3.5-3.5M5 17l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const TargetIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </Icon>
)

export const ScaleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M12 3v18M5 7h14M5 7 2.5 12.5a2.8 2.8 0 0 0 5 0zM19 7l-2.5 5.5a2.8 2.8 0 0 0 5 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
)

export const BarChartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20V11M12 20V4M20 20v-7" strokeLinecap="round" />
    <path d="M3 20h18" strokeLinecap="round" />
  </Icon>
)

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </Icon>
)

export const FilterIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6h16M7.5 12h9M11 18h2" strokeLinecap="round" />
  </Icon>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const SendIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 11 21 3l-8 18-3-7-7-3z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
  </Icon>
)

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </Icon>
)

export const GearIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path
      d="M12 3v2.5M12 18.5V21M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M3 12h2.5M18.5 12H21M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
      strokeLinecap="round"
    />
  </Icon>
)

export const UsersIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
    <circle cx="17" cy="9" r="2.3" />
    <path d="M15.3 13.8A4.5 4.5 0 0 1 20.5 18" strokeLinecap="round" />
  </Icon>
)

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4.5 1.8 5.5 1.8 5.5H4.7S6.5 14.5 6.5 10z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10.3 19a1.8 1.8 0 0 0 3.4 0" strokeLinecap="round" />
  </Icon>
)

export const LogoutIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17l5-5-5-5M21 12H10" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const EditIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3.5v4M16 3.5v4" strokeLinecap="round" />
  </Icon>
)

export const FoodIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 3c-1.4 0-2.5 1.6-2.5 4.5S15.6 12 17 12v9" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const BuildingIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6" y="3.5" width="12" height="17" rx="1" />
    <path
      d="M9.2 7.5h1.4M13.4 7.5h1.4M9.2 11.5h1.4M13.4 11.5h1.4M9.2 15.5h1.4M13.4 15.5h1.4"
      strokeLinecap="round"
    />
  </Icon>
)

export const CarIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M4.5 16 6 11.3A2 2 0 0 1 7.9 10h8.2a2 2 0 0 1 1.9 1.3L19.5 16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 16h17v2.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V18H6.5v.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="16" r="1.4" />
    <circle cx="16.5" cy="16" r="1.4" />
  </Icon>
)

export const BagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 8h11l-1 11.5a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
  </Icon>
)

export const FilmIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" strokeLinecap="round" />
  </Icon>
)

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M12 19.5s-6.8-4.1-8.6-8.2A4.6 4.6 0 0 1 12 8a4.6 4.6 0 0 1 8.6 3.3c-1.8 4.1-8.6 8.2-8.6 8.2z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
)

export const GiftIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="9" width="16" height="11" rx="1" />
    <path d="M4 9V6.5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1V9" strokeLinecap="round" />
    <path d="M12 5.5v14.5" />
    <path
      d="M12 5.5c-1.2-2.3-5-2.6-5 0s3.8 2.3 5 0zM12 5.5c1.2-2.3 5-2.6 5 0s-3.8 2.3-5 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
)

export const CoffeeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 9h11a3 3 0 0 1 0 6h-1" strokeLinecap="round" />
    <path d="M5 9v6a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 4c-.7.8-.7 1.5 0 2.3M11 4c-.7.8-.7 1.5 0 2.3" strokeLinecap="round" />
  </Icon>
)

export const PawIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="7" cy="9" r="1.6" />
    <circle cx="11" cy="6.5" r="1.6" />
    <circle cx="15" cy="6.5" r="1.6" />
    <circle cx="18" cy="9.5" r="1.6" />
    <path d="M12.5 12c3 0 5 2 5 4.3 0 2-1.6 3.2-3.6 2.7-.9-.2-1.9-.2-2.8 0-2 .5-3.6-.7-3.6-2.7 0-2.3 2-4.3 5-4.3z" />
  </Icon>
)

export const BookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22.5v-17z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5a2.5 2.5 0 0 1 2.5 2.5v-17z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const TrendingUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const PlaneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 3 3 10.5l7 2.5 2 7L21 3z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const RingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="13" r="5" />
    <circle cx="15" cy="13" r="5" />
  </Icon>
)

export const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M4 16V6a2 2 0 0 1 2-2h10" strokeLinecap="round" />
  </Icon>
)

export const CreditCardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" strokeLinecap="round" />
    <path d="M7 15h4" strokeLinecap="round" />
  </Icon>
)

export const PhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="M11 18h2" strokeLinecap="round" />
  </Icon>
)

export const DumbbellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.5 8v8M4 9.5v5M17.5 8v8M20 9.5v5" strokeLinecap="round" />
    <path d="M6.5 12h11" strokeLinecap="round" />
  </Icon>
)

export const AlertTriangleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 2 20h20L12 3z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 10v4M12 17h.01" strokeLinecap="round" />
  </Icon>
)

export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7h.01" strokeLinecap="round" />
  </Icon>
)

export const RepeatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 7h13a3 3 0 0 1 3 3v1" strokeLinecap="round" />
    <path d="M21 17H8a3 3 0 0 1-3-3v-1" strokeLinecap="round" />
    <path d="M6 4 3 7l3 3M18 20l3-3-3-3" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const LightbulbIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 18h6M10 21h4" strokeLinecap="round" />
    <path
      d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
)

export const WalletIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="7" width="17" height="12" rx="2" />
    <path d="M3.5 10.5h17" strokeLinecap="round" />
    <circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
)
