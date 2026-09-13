import type { Person } from '../../types'

const CLASSES: Record<Person['color'], string> = {
  coral: 'bg-coral-soft text-coral',
  teal: 'bg-teal-soft text-teal',
}

export function Avatar({ person, size = 40 }: { person: Person; size?: number }) {
  return (
    <div
      className={`${CLASSES[person.color]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {person.initial}
    </div>
  )
}
