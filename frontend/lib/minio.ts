import { promises as fs } from 'fs'
import path from 'path'

// Directorio de almacenamiento local
const STORAGE_DIR = path.join(process.cwd(), 'uploads')

// Asegurar que el directorio existe
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR)
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  }
}

// Subir archivo
export async function uploadFile(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await ensureStorageDir()

  const objectName = `${Date.now()}-${fileName}`
  const filePath = path.join(STORAGE_DIR, objectName)

  await fs.writeFile(filePath, buffer)

  return objectName
}

// Obtener URL de descarga (ruta local)
export async function getDownloadUrl(objectName: string): Promise<string> {
  return `/uploads/${objectName}`
}

// Descargar archivo
export async function downloadFile(objectName: string): Promise<Buffer> {
  const filePath = path.join(STORAGE_DIR, objectName)
  return await fs.readFile(filePath)
}

// Eliminar archivo
export async function deleteFile(objectName: string): Promise<void> {
  const filePath = path.join(STORAGE_DIR, objectName)
  await fs.unlink(filePath)
}

// Asegurar bucket (no-op para almacenamiento local)
export async function ensureBucket() {
  await ensureStorageDir()
}

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  getDownloadUrl,
  ensureBucket,
}
