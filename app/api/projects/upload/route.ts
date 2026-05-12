import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { content, fileName, fileType } = await request.json()

    if (!content || !fileName) {
      return NextResponse.json({ error: 'Missing content or fileName' }, { status: 400 })
    }

    const timestamp = Date.now()
    const pathname = `projects/${timestamp}-${fileName}`

    const blob = await put(pathname, content, {
      access: 'private',
      contentType: getContentType(fileType),
    })

    return NextResponse.json({
      pathname: blob.pathname,
      fileName,
      fileType,
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
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
