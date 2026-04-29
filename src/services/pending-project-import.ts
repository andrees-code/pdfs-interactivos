type PendingImportSource = 'projects'

interface PendingProjectImportPayload {
  file: File
  source: PendingImportSource
}

let pendingProjectImport: PendingProjectImportPayload | null = null

export const setPendingProjectImport = (payload: PendingProjectImportPayload) => {
  pendingProjectImport = payload
}

export const consumePendingProjectImport = () => {
  const current = pendingProjectImport
  pendingProjectImport = null
  return current
}
