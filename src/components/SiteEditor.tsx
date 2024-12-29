'use client'

import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { db, doc, updateDoc } from '../lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Site {
  id: string
  name: string
  domain?: string
  theme?: string
  features: {
    blog: boolean
    newsletter: boolean
    reviews: boolean
    ecommerce: boolean
    customDomain: boolean
  }
  socialMedia: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    youtube: string
  }
  analytics: {
    googleAnalytics: string
    facebookPixel: string
  }
  seo: {
    metaDescription: string
    keywords: string
  }
}

interface SiteEditorProps {
  site: Site
}

export default function SiteEditor({ site }: SiteEditorProps) {
  const [siteData, setSiteData] = useState<Site>(site)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSiteData({ ...siteData, [e.target.name]: e.target.value })
  }

  const handleFeatureToggle = (feature: keyof Site['features']) => {
    setSiteData({
      ...siteData,
      features: { ...siteData.features, [feature]: !siteData.features[feature] },
    })
  }

  const handleSocialMediaChange = (platform: keyof Site['socialMedia'], value: string) => {
    setSiteData({
      ...siteData,
      socialMedia: { ...siteData.socialMedia, [platform]: value },
    })
  }

  const handleAnalyticsChange = (platform: keyof Site['analytics'], value: string) => {
    setSiteData({
      ...siteData,
      analytics: { ...siteData.analytics, [platform]: value },
    })
  }

  const handleSeoChange = (field: keyof Site['seo'], value: string) => {
    setSiteData({
      ...siteData,
      seo: { ...siteData.seo, [field]: value },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid, 'sites', siteData.id), {
        ...siteData,
        updatedAt: new Date().toISOString(),
      })
      alert('Site updated successfully!')
    } catch (error) {
      console.error('Error updating site:', error)
      alert('Error updating site. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="social">Social & Analytics</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={siteData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  name="domain"
                  value={siteData.domain}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>
            <TabsContent value="features" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Features</h2>
              <div className="grid grid-cols-2 gap-4">
                {siteData.features && Object.entries(siteData.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Switch
                      id={feature}
                      checked={enabled}
                      onCheckedChange={() => handleFeatureToggle(feature as keyof Site['features'])}
                    />
                    <Label htmlFor={feature} className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="social" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Social Media & Analytics</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {siteData.socialMedia && Object.entries(siteData.socialMedia).map(([platform, url]) => (
                    <div key={platform} className="space-y-2">
                      <Label htmlFor={platform} className="capitalize">{platform}</Label>
                      <Input
                        id={platform}
                        value={url}
                        onChange={(e) => handleSocialMediaChange(platform as keyof Site['socialMedia'], e.target.value)}
                        placeholder={`${platform} URL`}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {siteData.analytics && Object.entries(siteData.analytics).map(([platform, id]) => (
                    <div key={platform} className="space-y-2">
                      <Label htmlFor={platform} className="capitalize">{platform.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Input
                        id={platform}
                        value={id}
                        onChange={(e) => handleAnalyticsChange(platform as keyof Site['analytics'], e.target.value)}
                        placeholder={`${platform.replace(/([A-Z])/g, ' $1').trim()} ID`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="seo" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={siteData.seo?.metaDescription || ''}
                    onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                    placeholder="Enter meta description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={siteData.seo?.keywords || ''}
                    onChange={(e) => handleSeoChange('keywords', e.target.value)}
                    placeholder="Enter keywords, separated by commas"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="theme" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Theme Settings</h2>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  name="theme" 
                  value={siteData.theme} 
                  onValueChange={(value) => setSiteData({ ...siteData, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="colorful">Colorful</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Site'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

