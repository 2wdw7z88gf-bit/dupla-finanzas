import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { CloseIcon, EditIcon, PlusIcon } from '../components/icons/Icons'
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
} from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import type { Category } from '../types'

const ICON_OPTIONS: { key: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'food', Icon: FoodIcon },
  { key: 'building', Icon: BuildingIcon },
  { key: 'car', Icon: CarIcon },
  { key: 'bag', Icon: BagIcon },
  { key: 'film', Icon: FilmIcon },
  { key: 'heart', Icon: HeartIcon },
  { key: 'gift', Icon: GiftIcon },
  { key: 'coffee', Icon: CoffeeIcon },
  { key: 'paw', Icon: PawIcon },
  { key: 'book', Icon: BookIcon },
  { key: 'trending', Icon: TrendingUpIcon },
  { key: 'plane', Icon: PlaneIcon },
]

const COLOR_OPTIONS: Category['color'][] = ['coral', 'gold', 'success', 'teal', 'indigo', 'violet', 'berry', 'amber']
const COLOR_SWATCH: Record<Category['color'], string> = {
  coral: 'bg-coral-soft border-coral',
  gold: 'bg-gold-soft border-transparent',
  success: 'bg-success-soft border-transparent',
  teal: 'bg-teal-soft border-transparent',
  indigo: 'bg-indigo-soft border-transparent',
  violet: 'bg-violet-soft border-transparent',
  berry: 'bg-berry-soft border-transparent',
  amber: 'bg-amber-soft border-transparent',
}

export function Categorias() {
  const { categories, addCategory } = useData()
  const [adding, setAdding] = useState(false)

  return (
    <div>
      <PageHeader
        title="Categorías"
        backTo="/ajustes"
        action={
          <button onClick={() => setAdding(true)} className="w-9 h-9 rounded-[10px] bg-coral flex items-center justify-center">
            <PlusIcon size={17} className="text-surface" strokeWidth={2.2} />
          </button>
        }
      />

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-3.5 py-3.5 border-b border-border last:border-b-0">
            <CategoryIcon category={c} size="sm" />
            <span className="flex-1 text-sm font-semibold">{c.name}</span>
            <span className="text-[11.5px] text-text-muted capitalize">{c.type}</span>
            <EditIcon size={15} className="text-text-muted" />
          </div>
        ))}
      </div>

      {adding && <NewCategorySheet onClose={() => setAdding(false)} onSave={addCategory} />}
    </div>
  )
}

function NewCategorySheet({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (cat: Omit<Category, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'gasto' | 'ingreso'>('gasto')
  const [color, setColor] = useState<Category['color']>('coral')
  const [icon, setIcon] = useState('food')

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), type, color, icon })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">Nueva categoría</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Mascotas"
          className="w-full border border-border rounded-xl px-3.5 py-3 text-sm mt-1.5 mb-4 bg-bg outline-none"
        />

        <div className="flex bg-surface-2 rounded-xl p-1 mb-4.5">
          {(['gasto', 'ingreso'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 text-center text-[13.5px] font-bold py-2.5 rounded-[9px] capitalize ${
                type === t ? 'bg-coral text-surface' : 'text-text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Color</label>
        <div className="flex flex-wrap gap-2.5 mt-2 mb-4.5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-[30px] h-[30px] rounded-full border-2 ${COLOR_SWATCH[c]} ${color === c ? 'ring-2 ring-offset-2 ring-text/20' : ''}`}
            />
          ))}
        </div>

        <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Ícono</label>
        <div className="grid grid-cols-6 gap-2.5 mt-2 mb-6">
          {ICON_OPTIONS.map(({ key, Icon }) => (
            <button
              key={key}
              onClick={() => setIcon(key)}
              className={`aspect-square rounded-xl flex items-center justify-center ${
                icon === key ? 'bg-coral-soft border-2 border-coral text-coral' : 'bg-surface-2 text-text-muted'
              }`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
        >
          Guardar categoría
        </button>
      </div>
    </div>
  )
}
