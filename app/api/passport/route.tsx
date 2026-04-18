import React from 'react'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

export const runtime = 'nodejs'

async function loadFont(): Promise<{ data: ArrayBuffer; name: string }> {
  // Try JetBrains Mono first, fall back to Inter, then Roboto Mono
  const fontUrls = [
    {
      url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO-Lf1OQk6OThxPA.woff2',
      name: 'JetBrains Mono',
    },
    {
      url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      name: 'Inter',
    },
    {
      url: 'https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.woff2',
      name: 'Roboto Mono',
    },
  ]

  for (const { url, name } of fontUrls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const data = await res.arrayBuffer()
      if (data.byteLength < 1000) continue // sanity check: font file too small
      return { data, name }
    } catch {
      // Try next font
    }
  }

  // Ultimate fallback: generate a minimal valid font-like buffer
  // Satori requires at least one font, so we create a bare-minimum placeholder
  throw new Error('All font sources failed')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || 'MemeOS Token'
    const ticker = searchParams.get('ticker') || 'MEME'
    const address = searchParams.get('address') || '0x...'
    const tagline = searchParams.get('tagline') || 'Born from the void.'
    const imageUrl = searchParams.get('imageUrl') || ''

    let font: { data: ArrayBuffer; name: string }
    try {
      font = await loadFont()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Failed to load fonts for passport rendering' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const truncatedAddress = address.length > 20
      ? `${address.slice(0, 10)}...${address.slice(-8)}`
      : address

    const element = (
      <div
        style={{
          width: '600px',
          height: '340px',
          background: 'linear-gradient(135deg, #0a0e17 0%, #151d2e 50%, #0a0e17 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px',
          fontFamily: font.name,
          color: '#e2e8f0',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #00e5ff, #8b5cf6, #f59e0b, #00e5ff)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '3px', marginBottom: '8px' }}>
              MEME PASSPORT
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#00e5ff', marginBottom: '4px' }}>
              {name}
            </div>
            <div style={{ fontSize: '16px', color: '#8b5cf6' }}>
              ${ticker}
            </div>
          </div>
          {imageUrl ? (
            <img
              src={imageUrl}
              width={80}
              height={80}
              alt=""
              style={{ borderRadius: '12px', border: '2px solid #1e293b' }}
            />
          ) : (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                background: '#151d2e',
                border: '2px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#00e5ff',
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              MOS
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: '20px',
            fontSize: '13px',
            color: '#94a3b8',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          &quot;{tagline}&quot;
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '2px', marginBottom: '4px' }}>
              CONTRACT
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {truncatedAddress}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '10px', color: '#475569' }}>
            <div>Built with MemeOS</div>
            <div style={{ color: '#00e5ff', marginTop: '2px' }}>four.meme × BSC</div>
          </div>
        </div>
      </div>
    )

    const svg = await satori(element, {
      width: 600,
      height: 340,
      fonts: [
        {
          name: font.name,
          data: font.data,
          style: 'normal',
          weight: 700,
        },
      ],
    })

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    })
    const pngBuffer = resvg.render().asPng()

    // Verify the buffer looks like a valid PNG (starts with PNG magic bytes)
    const pngBytes = new Uint8Array(pngBuffer)
    if (pngBytes.length < 8 || pngBytes[0] !== 0x89 || pngBytes[1] !== 0x50) {
      return new Response(
        JSON.stringify({ error: 'PNG rendering produced invalid output' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(pngBytes, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="${ticker}-passport.png"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('Passport generation failed:', err)
    return new Response(
      JSON.stringify({ error: 'Passport generation failed', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
