import {
  BagIcon,
  BookIcon,
  BuildingIcon,
  CarIcon,
  CoffeeIcon,
  FilmIcon,
  FoodIcon,
  GiftIcon,
  HeartIcon,
  PawIcon,
  PlaneIcon,
  TrendingUpIcon,
  WalletIcon,
} from '../icons/Icons'
import type { Category } from '../../types'

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  food: FoodIcon,
  building: BuildingIcon,
  car: CarIcon,
  bag: BagIcon,
  film: FilmIcon,
  heart: HeartIcon,
  wallet: WalletIcon,
  gift: GiftIcon,
  coffee: CoffeeIcon,
  paw: PawIcon,
  book: BookIcon,
  trending: TrendingUpIcon,
  plane: PlaneIcon,
}

const COLOR_CLASSES: Record<Category['color'], { bg: string; fg: string }> = {
  coral: { bg: 'bg-coral-soft', fg: 'text-coral' },
  teal: { bg: 'bg-teal-soft', fg: 'text-teal' },
  gold: { bg: 'bg-gold-soft', fg: 'text-gold' },
  success: { bg: 'bg-success-soft', fg: 'text-success' },
  indigo: { bg: 'bg-indigo-soft', fg: 'text-indigo' },
  berry: { bg: 'bg-berry-soft', fg: 'text-berry' },
  amber: { bg: 'bg-amber-soft', fg: 'text-amber' },
  violet: { bg: 'bg-violet-soft', fg: 'text-violet' },
}

export function CategoryIcon({ category, size = 'md' }: { category: Category; size?: 'sm' | 'md' }) {
  const Icon = ICONS[category.icon] ?? FoodIcon
  const { bg, fg } = COLOR_CLASSES[category.color]
  const box = size === 'sm' ? 'w-[34px] h-[34px] rounded-[10px]' : 'w-10 h-10 rounded-xl'
  const iconSize = size === 'sm' ? 17 : 19
  return (
    <div className={`${box} ${bg} ${fg} flex items-center justify-center shrink-0`}>
      <Icon size={iconSize} />
    </div>
  )
}
