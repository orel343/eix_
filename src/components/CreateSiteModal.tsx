import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { db, collection, addDoc, serverTimestamp } from '../lib/firebase'
import { Dialog, Transition } from '@headlessui/react'

interface CreateSiteModalProps {
  isOpen: boolean
  onClose: () => void
  onSiteCreated: () => void
}

export default function CreateSiteModal({ isOpen, onClose, onSiteCreated }: CreateSiteModalProps) {
  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [siteType, setSiteType] = useState('personal')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const newSite = {
        name: siteName,
        description: siteDescription,
        type: siteType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: user.uid,
        collaborators: [],
        settings: {
          theme: 'light',
          isPublic: false,
        },
      }

      const docRef = await addDoc(collection(db, 'users', user.uid, 'sites'), newSite)
      console.log('Site created successfully!')
      onSiteCreated()
      onClose()
    } catch (error) {
      console.error('Error creating site:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
  
        <div className="min-h-screen px-4 text-center">
        
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
       
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
           
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                X
              </button>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="My Awesome Site"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                    Site Description
                  </label>
                  <textarea
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="A brief description of your site"
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="siteType" className="block text-sm font-medium text-gray-700">
                    Site Type
                  </label>
                  <select
                    id="siteType"
                    value={siteType}
                    onChange={(e) => setSiteType(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="blog">Blog</option>
                  </select>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Create Site'
                    )}
                  </button>
                </div>
              </form>
            </div>
        </div>
  )
}

