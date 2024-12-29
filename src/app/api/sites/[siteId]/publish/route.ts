import { NextResponse } from 'next/server'
import { db, auth } from '@/lib/firebase'

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const idToken = authHeader.split('Bearer ')[1]
    try {
      const decodedToken = await auth.verifyIdToken(idToken)
      const userId = decodedToken.uid

      const siteId = params.siteId
      const siteRef = db.collection('users').doc(userId).collection('sites').doc(siteId)
      const site = await siteRef.get()

      if (!site.exists) {
        return new NextResponse('Site not found', { status: 404 })
      }

      // Deploy to Vercel
      const response = await fetch('https://api.vercel.com/v1/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: site.data().name,
          target: 'production',
          project: process.env.VERCEL_PROJECT_ID,
          files: [
            {
              file: 'site.json',
              data: JSON.stringify(site.data())
            }
          ]
        })
      })

      const deployment = await response.json()

      // Update site with deployment URL
      await siteRef.update({
        publishedUrl: `https://${deployment.url}`,
        lastPublishedAt: new Date().toISOString()
      })

      return NextResponse.json({ url: deployment.url })
    } catch (error) {
      console.error('Error verifying auth token:', error)
      return new NextResponse('Unauthorized', { status: 401 })
    }
  } catch (error) {
    console.error('[SITE_PUBLISH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

