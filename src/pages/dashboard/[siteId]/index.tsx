import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { db, doc, getDoc, collection, getDocs, query, orderBy, limit } from '../../../lib/firebase';
import Header from '../../../components/Header';
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import H_site from '../../../components/h_site';


interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; sales: number }[];
  recentOrders: { id: string; date: string; total: number }[];
  monthlySales: { month: string; sales: number }[];
}

export default function SiteDashboard() {
    const [site, setSite] = useState(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const { user, loading } = useAuth();
    const router = useRouter();
    const { siteId } = router.query;
    const [sites, setSites] = useState([]);

    useEffect(() => {
      if (!loading && user) {
        if (siteId) {
          fetchSite();
          fetchDashboardData();
        }
      } else if (!loading && !user) {
        router.push('/');
      }
    }, [user, loading, siteId]);

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

    const fetchDashboardData = async () => {
      if (!user || !siteId) return;
      try {
        const ordersRef = collection(db, 'users', user.uid, 'sites', siteId as string, 'orders');
        const productsRef = collection(db, 'users', user.uid, 'sites', siteId as string, 'products');

        // Fetch orders
        const ordersQuery = query(ordersRef, orderBy('date', 'desc'));
        const ordersSnap = await getDocs(ordersQuery);
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate dashboard data
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Get top products
        const productsQuery = query(productsRef, orderBy('sales', 'desc'), limit(5));
        const productsSnap = await getDocs(productsQuery);
        const topProducts = productsSnap.docs.map(doc => ({ name: doc.data().name, sales: doc.data().sales }));

        // Get recent orders
        const recentOrders = orders.slice(0, 5).map(order => ({
          id: order.id,
          date: order.date.toDate().toLocaleDateString(),
          total: order.total
        }));

        // Calculate monthly sales
        const monthlySales = calculateMonthlySales(orders);

        setDashboardData({
          totalRevenue,
          totalOrders,
          averageOrderValue,
          topProducts,
          recentOrders,
          monthlySales
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      
      }
    };

    const calculateMonthlySales = (orders) => {
      const salesByMonth = {};
      orders.forEach(order => {
        const date = order.date.toDate();
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        if (!salesByMonth[monthYear]) {
          salesByMonth[monthYear] = 0;
        }
        salesByMonth[monthYear] += order.total;
      });

      return Object.entries(salesByMonth).map(([month, sales]) => ({ month, sales }));
    };

    if (loading || !user) {
      return <div>Loading...</div>;
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <Header user={user} siteName={site?.name || 'Site Dashboard'} />
        <H_site sites={sites} />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Welcome to your dashboard {site?.name}</h1>
          
          {site?.setupCompleted && dashboardData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${dashboardData.totalRevenue.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{dashboardData.totalOrders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Average Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${dashboardData.averageOrderValue.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul>
                      {dashboardData.topProducts.map((product, index) => (
                        <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span>{product.name}</span>
                          <span>{product.sales} sales</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul>
                      {dashboardData.recentOrders.map((order, index) => (
                        <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span>Order #{order.id}</span>
                          <span>{order.date}</span>
                          <span>${order.total}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between items-center">
                <Link href={`/dashboard/${siteId}/products`} passHref>
                  <Button>
                    Manage Products
                  </Button>
                </Link>
                <Link href={`/dashboard/${siteId}/orders`} passHref>
                  <Button>
                    View All Orders
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <p className="text-xl font-semibold mb-4">Complete the setup to view your dashboard</p>
                  <Button onClick={() => router.push(`/dashboard/${siteId}/setup`)}>
                    Go to Setup
                  </Button>
                </div>
              </div>
              <div className="space-y-6 filter blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">$---</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">---</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">$---</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gray-200 rounded-lg"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    );
}

