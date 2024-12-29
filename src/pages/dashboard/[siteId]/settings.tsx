'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../../hooks/useAuth'
import { db, doc, getDoc, updateDoc, collection, getDocs, serverTimestamp, deleteDoc } from '../../../lib/firebase'
import Header from '../../../components/Header'
import H_site from '../../../components/h_site'
import SiteEditor from '../../../components/SiteEditor'
import SetupSteps from '../../../components/SetupSteps'

import { Tab } from '@headlessui/react'

export default function Settings() {
  const [site, setSite] = useState(null)
  const [sites, setSites] = useState([])
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { siteId } = router.query

  useEffect(() => {
    if (!authLoading && user) {
      fetchSites()
      if (siteId) {
        fetchSite()
      }
    } else if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, siteId])

  const fetchSite = async () => {
    if (!user || !siteId) return
    try {
      const siteRef = doc(db, 'users', user.uid, 'sites', siteId as string)
      const siteSnap = await getDoc(siteRef)
      if (siteSnap.exists()) {
        setSite({ id: siteSnap.id, ...siteSnap.data() })
        setIsSetupComplete(true)
      } else {
        console.log('Site not found, redirecting...')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching site:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSites = async () => {
    if (!user) return
    try {
      const sitesRef = collection(db, 'users', user.uid, 'sites')
      const sitesSnap = await getDocs(sitesRef)

      if (!sitesSnap.empty) {
        const sitesList = sitesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setSites(sitesList)
      } else {
        setSites([])
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
      setSites([])
    }
  }

  const handleSetupComplete = async (setupData) => {
    if (!user) return
    try {
      const siteRef = doc(db, 'users', user.uid, 'sites', siteId as string)
      await updateDoc(siteRef, {
        ...setupData.siteInfo,
        products: setupData.products,
        updatedAt: serverTimestamp(),
        isSetupComplete: true,
      })
      setSite((prevSite) => ({ ...prevSite, ...setupData.siteInfo, products: setupData.products }))
      setIsSetupComplete(true)
    } catch (error) {
      console.error('Error saving site:', error)
    }
  }

  const handleUpdateSite = async (updatedData) => {
    if (!user || !siteId) return
    try {
      const siteRef = doc(db, 'users', user.uid, 'sites', siteId as string)
      await updateDoc(siteRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      })
      setSite((prevSite) => ({ ...prevSite, ...updatedData }))
    } catch (error) {
      console.error('Error updating site:', error)
    }
  }

  const handleDeleteSite = async () => {
    if (!user || !siteId) return
    if (window.confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sites', siteId as string))
        router.push('/dashboard')
      } catch (error) {
        console.error('Error deleting site:', error)
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} siteName={site?.name || 'Sites'} />
      <H_site sites={sites} />

      <main className="container mx-auto px-4 py-8">
        {!isSetupComplete ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6">Set Up Your Website</h1>
            <SetupSteps onComplete={handleSetupComplete} />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
            <Tab.Group>
              <Tab.List className="flex p-1 space-x-1 bg-indigo-900/20 rounded-xl mb-6">
                <Tab
                  className={({ selected }) =>
                    `w-full py-2.5 text-sm leading-5 font-medium text-indigo-700 rounded-lg
                    focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60
                    ${
                      selected
                        ? 'bg-white shadow'
                        : 'text-indigo-100 hover:bg-white/[0.12] hover:text-white'
                    }`
                  }
                >
                  General
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `w-full py-2.5 text-sm leading-5 font-medium text-indigo-700 rounded-lg
                    focus:outline-none focus:ring-2 ring-offset-2 ring-offset-indigo-400 ring-white ring-opacity-60
                    ${
                      selected
                        ? 'bg-white shadow'
                        : 'text-indigo-100 hover:bg-white/[0.12] hover:text-white'
                    }`
                  }
                >
                  Collaborators
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <SiteEditor site={site} onUpdate={handleUpdateSite} />
                </Tab.Panel>
                <Tab.Panel>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Manage Collaborators</h2>
                    {/* Add collaborator management UI here */}
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
              <p className="mt-1 text-sm text-gray-500">
                Once you delete a site, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteSite}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Site
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

