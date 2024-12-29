'use client'
import CreateSiteModal from '../../components/CreateSiteModal'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { db, collection, getDocs } from '@/lib/firebase'
import Header from '@/components/Header'
import SiteList from '@/components/SiteList'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Grid, List, Plus, FolderPlus } from 'lucide-react'

export default function Dashboard() {
  const [sites, setSites] = useState([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    } else if (user) {
      fetchSites()
    }
  }, [user, loading, router])

  const fetchSites = async () => {
    if (!user) return
    const sitesRef = collection(db, 'users', user.uid, 'sites')
    const sitesSnapshot = await getDocs(sitesRef)
    const sitesData = sitesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setSites(sitesData)
  }

  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSite = () => {
    router.push('/dashboard/create')
  }


  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    } else if (user) {
      fetchSites()
    }
  }, [user, loading, router])



  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Sites</h1>
              <p className="text-muted-foreground">
                View and manage all your websites in one place.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="default" onClick={() => setIsCreateModalOpen(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create New Site
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === 'grid' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setView('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isCreateModalOpen && (
          <CreateSiteModal
            onClose={() => setIsCreateModalOpen(false)}
            onSiteCreated={fetchSites}
          />
        )}
          <SiteList sites={filteredSites} view={view} />
        </div>
      </main>
    </div>
  )
}