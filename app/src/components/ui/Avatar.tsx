type AvatarPerson = { displayName: string; color: 'coral' | 'teal' }

const CLASSES: Record<AvatarPerson['color'], string> = {
  coral: 'bg-coral-soft text-coral',
  teal: 'bg-teal-soft text-teal',
}

export function Avatar({ person, size = 40 }: { person: AvatarPerson; size?: number }) {
  const initial = person.displayName.charAt(0).toUpperCase() || '?'
  return (
    <div
      className={`${CLASSES[person.color]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initial}
    </div>
  )
}
