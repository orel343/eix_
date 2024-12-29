import { db, doc, getDoc, updateDoc } from './firebase'

export async function getSiteData(siteId: string) {
  try {
    const siteRef = doc(db, 'sites', siteId)
    const siteSnap = await getDoc(siteRef)

    if (siteSnap.exists()) {
      return { id: siteSnap.id, ...siteSnap.data() }
    } else {
      console.log('No such site!')
      return null
    }
  } catch (error) {
    console.error('Error fetching site data:', error)
    throw error
  }
}

export async function updateSiteData(siteId: string, data: any) {
  try {
    const siteRef = doc(db, 'sites', siteId)
    await updateDoc(siteRef, data)
    console.log('Site updated successfully')
  } catch (error) {
    console.error('Error updating site data:', error)
    throw error
  }
}
