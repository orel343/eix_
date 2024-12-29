'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Product {
  name: string
  description: string
  price: number
  category: string
  stock: number
  images: string[]
}

interface SetupStepsProps {
  onComplete: (setupData: any) => void
}

export default function SetupSteps({ onComplete }: SetupStepsProps) {
  const [step, setStep] = useState(1)
  const [siteInfo, setSiteInfo] = useState({
    theme: 'light',
    features: {
      blog: false,
      newsletter: false,
      reviews: false,
      ecommerce: false,
      customDomain: false,
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
    },
    analytics: {
      googleAnalytics: '',
      facebookPixel: '',
    },
    seo: {
      metaDescription: '',
      keywords: '',
    },
  })
  const [product, setProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
  })

  const handleSiteInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSiteInfo({ ...siteInfo, [e.target.name]: e.target.value })
  }

  const handleFeatureToggle = (feature: string) => {
    setSiteInfo({
      ...siteInfo,
      features: { ...siteInfo.features, [feature]: !siteInfo.features[feature] },
    })
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSiteInfo({
      ...siteInfo,
      socialMedia: { ...siteInfo.socialMedia, [platform]: value },
    })
  }

  const handleAnalyticsChange = (platform: string, value: string) => {
    setSiteInfo({
      ...siteInfo,
      analytics: { ...siteInfo.analytics, [platform]: value },
    })
  }

  const handleSeoChange = (field: string, value: string) => {
    setSiteInfo({
      ...siteInfo,
      seo: { ...siteInfo.seo, [field]: value },
    })
  }

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageUrls = files.map(file => URL.createObjectURL(file))
    setProduct({ ...product, images: [...product.images, ...imageUrls] })
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      onComplete({ siteInfo, products: [product] })
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Progress value={(step / 4) * 100} className="w-full mb-6" />
        <Tabs value={`step${step}`} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step1">Features</TabsTrigger>
            <TabsTrigger value="step2">Social & Analytics</TabsTrigger>
            <TabsTrigger value="step3">SEO</TabsTrigger>
            <TabsTrigger value="step4">First Product</TabsTrigger>
          </TabsList>
          <TabsContent value="step1" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Step 1: Choose Your Features</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(siteInfo.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Switch
                    id={feature}
                    checked={enabled}
                    onCheckedChange={() => handleFeatureToggle(feature)}
                  />
                  <Label htmlFor={feature} className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</Label>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="step2" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Step 2: Social Media & Analytics</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(siteInfo.socialMedia).map(([platform, url]) => (
                  <div key={platform} className="space-y-2">
                    <Label htmlFor={platform} className="capitalize">{platform}</Label>
                    <Input
                      id={platform}
                      value={url}
                      onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                      placeholder={`${platform} URL`}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(siteInfo.analytics).map(([platform, id]) => (
                  <div key={platform} className="space-y-2">
                    <Label htmlFor={platform} className="capitalize">{platform.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <Input
                      id={platform}
                      value={id}
                      onChange={(e) => handleAnalyticsChange(platform, e.target.value)}
                      placeholder={`${platform.replace(/([A-Z])/g, ' $1').trim()} ID`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="step3" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Step 3: SEO Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={siteInfo.seo.metaDescription}
                  onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                  placeholder="Enter meta description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={siteInfo.seo.keywords}
                  onChange={(e) => handleSeoChange('keywords', e.target.value)}
                  placeholder="Enter keywords, separated by commas"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="step4" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Step 4: Add Your First Product</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  name="name"
                  value={product.name}
                  onChange={handleProductChange}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productDescription">Product Description</Label>
                <Textarea
                  id="productDescription"
                  name="description"
                  value={product.description}
                  onChange={handleProductChange}
                  placeholder="Enter product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productPrice">Product Price</Label>
                  <Input
                    id="productPrice"
                    name="price"
                    type="number"
                    value={product.price}
                    onChange={handleProductChange}
                    placeholder="Enter product price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Product Category</Label>
                  <Input
                    id="productCategory"
                    name="category"
                    value={product.category}
                    onChange={handleProductChange}
                    placeholder="Enter product category"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productStock">Initial Stock</Label>
                <Input
                  id="productStock"
                  name="stock"
                  type="number"
                  value={product.stock}
                  onChange={handleProductChange}
                  placeholder="Enter initial stock"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productImages">Upload Product Images</Label>
                <Input
                  id="productImages"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <img key={index} src={image} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between mt-6">
          <Button onClick={handlePrevious} disabled={step === 1}>
            Previous
          </Button>
          <Button onClick={handleNext}>
            {step < 4 ? 'Next' : 'Complete Setup'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
