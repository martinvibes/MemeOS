import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('image') as File | null

  if (!file) {
    return Response.json({ error: 'No image provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'png'
  const localPath = join(tmpdir(), `memeos-upload-${randomUUID()}.${ext}`)
  await writeFile(localPath, buffer)

  return Response.json({ localPath, url: `/api/upload/${localPath.split('/').pop()}` })
}
