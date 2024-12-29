import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { db, doc, getDoc, collection, query, orderBy, limit, startAfter, getDocs, updateDoc, where } from '../../../lib/firebase';
import Header from '../../../components/Header';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import H_site from '../../../components/h_site';

interface Order {
  id: string;
  date: Date;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: { productId: string; quantity: number; price: number }[];
}

export default function OrdersPage() {
  const [site, setSite] = useState(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { siteId } = router.query;
  const [sites, setSites] = useState([]);

  useEffect(() => {
    if (!authLoading && user) {
      if (siteId) {
        fetchSite();
        fetchOrders();
      }
    } else if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, siteId, filter, sort]);

  const fetchSite = async () => {
    if (!user || !siteId) return;
    try {
      const siteRef = doc(db, 'users', user.uid, 'sites', siteId as string);
      const siteSnap = await getDoc(siteRef);
      if (siteSnap.exists()) {
        setSite({ id: siteSnap.id, ...siteSnap.data() });
      } else {
        console.log('Site not found, redirecting...');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching site:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user || !siteId) return;
    setLoading(true);
    try {
      const ordersRef = collection(db, 'users', user.uid, 'sites', siteId as string, 'orders');
      let q = query(ordersRef, orderBy(sort, 'desc'), limit(10));

      if (filter !== 'all') {
        q = query(q, where('status', '==', filter));
      }

      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreOrders = async () => {
    if (!user || !siteId || !lastVisible) return;
    setLoading(true);
    try {
      const ordersRef = collection(db, 'users', user.uid, 'sites', siteId as string, 'orders');
      let q = query(ordersRef, orderBy(sort, 'desc'), startAfter(lastVisible), limit(10));

      if (filter !== 'all') {
        q = query(q, where('status', '==', filter));
      }

      const querySnapshot = await getDocs(q);
      const newOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders([...orders, ...newOrders]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error('Error loading more orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!user || !siteId) return;
    try {
      const orderRef = doc(db, 'users', user.uid, 'sites', siteId as string, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || !user) {
    return <div>Loading...</div>;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} siteName={site?.name || 'Orders'} />
        <H_site sites={sites} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Orders {site?.name}</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filter">Filter by Status</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="filter">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="sort">Sort by</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Select a sort option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by customer name or order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus as Order['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {lastVisible && (
          <div className="mt-4 text-center">
            <Button onClick={loadMoreOrders} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
