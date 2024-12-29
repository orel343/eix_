'use client'

import Link from 'next/link'
import { MoreHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Site {
  id: string
  name: string
  domain?: string
  lastUpdated?: string
  editorType?: string
  thumbnail?: string
}

interface SiteListProps {
  sites: Site[]
  view: 'grid' | 'list'
}

export default function SiteList({ sites, view }: SiteListProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (view === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((site) => (
          <div key={site.id} className="group relative bg-white rounded-lg border overflow-hidden">
            <Link href={`/dashboard/${site.id}`}>
              <div className="aspect-video bg-gray-100">
                {site.thumbnail ? (
                  <img
                    src={site.thumbnail}
                    alt={site.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Preview
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold truncate">{site.name}</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Not published</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Last updated</TableHead>
            <TableHead>Editor type</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.id}>
              <TableCell>
                <input type="checkbox" className="rounded border-gray-300" />
              </TableCell>
              <TableCell>
                <div className="font-medium">{site.name}</div>
                <div className="text-sm text-muted-foreground">Not published</div>
              </TableCell>
              <TableCell>—</TableCell>
              <TableCell>{site.lastUpdated ? formatDate(site.lastUpdated) : '—'}</TableCell>
              <TableCell>{site.editorType || 'Default Editor'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

