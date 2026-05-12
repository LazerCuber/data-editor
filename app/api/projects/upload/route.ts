import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content, fileName, fileType } = await request.json()

    if (!content || !fileName) {
      return NextResponse.json({ error: 'Missing content or fileName' }, { status: 400 })
    }

    console.log('[v0] Uploading file:', fileName, 'type:', fileType, 'size:', content.length)

    const timestamp = Date.now()
    const pathname = `projects/${timestamp}-${fileName}`

    // Convert string content to Blob
    const blob = new Blob([content], { type: getContentType(fileType) })

    const result = await put(pathname, blob, {
      access: 'private',
      contentType: getContentType(fileType),
    })

    console.log('[v0] Upload successful:', result.pathname)

    return NextResponse.json({
      pathname: result.pathname,
      fileName,
      fileType,
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 })
  }
}

function getContentType(fileType: string): string {
  switch (fileType) {
    case 'json':
      return 'application/json'
    case 'jsonl':
      return 'application/x-jsonlines'
    case 'csv':
      return 'text/csv'
    case 'parquet':
      return 'application/octet-stream'
    default:
      return 'text/plain'
  }
}
