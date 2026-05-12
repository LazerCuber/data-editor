import { list, del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'projects/' })

    const projects = blobs.map((blob) => {
      const filename = blob.pathname.split('/').pop() || 'unknown'
      // Extract original filename from "timestamp-filename" format
      const parts = filename.split('-')
      const timestamp = parts[0]
      const originalName = parts.slice(1).join('-')
      
      return {
        pathname: blob.pathname,
        fileName: originalName,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        url: blob.url,
      }
    })

    // Sort by upload date, newest first
    projects.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error listing projects:', error)
    return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
