import { migrateFileToRedis, getStorageBackend } from 'memeos-sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * One-shot migration endpoint: seeds Upstash Redis from the local .data/deploys.json
 * Protected by ADMIN_SECRET env var — set it in Vercel, then call:
 *   curl https://your-app.vercel.app/api/admin/migrate -H "Authorization: Bearer <ADMIN_SECRET>"
 */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const expected = `Bearer ${process.env.ADMIN_SECRET || ''}`

  if (!process.env.ADMIN_SECRET || auth !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (getStorageBackend() !== 'redis') {
    return Response.json(
      { error: 'Redis not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.' },
      { status: 400 }
    )
  }

  try {
    const result = await migrateFileToRedis()
    return Response.json({ ok: true, ...result })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Migration failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return Response.json({
    backend: getStorageBackend(),
    message:
      getStorageBackend() === 'redis'
        ? 'Using Upstash Redis — persistent across deployments.'
        : 'Using file-based store — works locally, not persistent on Vercel.',
  })
}
