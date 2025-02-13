type Storage = {
  token: string | null
  user: JWTTokenData | null
  session: { start_at: Date, id: number } | null
}

function getItem<Key extends keyof Storage>(key: Key): Storage[Key] {
  const item = window.localStorage.getItem(key)
  if (!item) return null
  return JSON.parse(item)
}

function setItem<Key extends keyof Storage>(key: Key, value: Storage[Key]) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function removeItem(key: keyof Storage) {
  window.localStorage.removeItem(key)
}

export function LocalStorage() {
  return {
    getItem,
    setItem,
    removeItem
  }
}
