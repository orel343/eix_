import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../hooks/useAuth';
import { db, doc, getDoc, updateDoc, collection, addDoc, deleteDoc, query, orderBy, limit, getDocs } from '../../../lib/firebase';
import Header from '../../../components/Header';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import H_site from '../../../components/h_site';


interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export default function ProductsPage() {
    const [site, setSite] = useState(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<Product>({
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      images: [],
    });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { user, loading } = useAuth();
    const router = useRouter();
    const { siteId } = router.query;

    useEffect(() => {
      if (!loading && user) {
        if (siteId) {
          fetchSite();
          fetchProducts();
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

    const fetchProducts = async () => {
      if (!user || !siteId) return;
      try {
        const productsRef = collection(db, 'users', user.uid, 'sites', siteId as string, 'products');
        const q = query(productsRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, [name]: value });
      } else {
        setNewProduct({ ...newProduct, [name]: value });
      }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
      // In a real application, you would upload the image to a storage service
      // and get back the URL. For now, we'll just use a placeholder URL.
      const placeholderUrl = "https://via.placeholder.com/150";
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, images: [...editingProduct.images, placeholderUrl] });
      } else {
        setNewProduct({ ...newProduct, images: [...newProduct.images, placeholderUrl] });
      }
    };

    const handleAddProduct = async () => {
      if (!user || !siteId) return;
      try {
        const productsRef = collection(db, 'users', user.uid, 'sites', siteId as string, 'products');
        await addDoc(productsRef, newProduct);
        setProducts([...products, { ...newProduct, id: Date.now().toString() }]);
        setNewProduct({ name: '', description: '', price: 0, category: '', stock: 0, images: [] });
      } catch (error) {
        console.error('Error adding product:', error);
      }
    };

    const handleUpdateProduct = async () => {
      if (!user || !siteId || !editingProduct) return;
      try {
        const productRef = doc(db, 'users', user.uid, 'sites', siteId as string, 'products', editingProduct.id!);
        await updateDoc(productRef, editingProduct);
        setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
        setEditingProduct(null);
      } catch (error) {
        console.error('Error updating product:', error);
      }
    };

    const handleDeleteProduct = async (productId: string) => {
      if (!user || !siteId) return;
      try {
        const productRef = doc(db, 'users', user.uid, 'sites', siteId as string, 'products', productId);
        await deleteDoc(productRef);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    };


    const [sites, setSites] = useState([]);
  
    const fetchSites = async () => {
      const response = await fetch('/api/sites');
      const data = await response.json();
      setSites(data);
    };
  

  
    useEffect(() => {
      if (!loading && user) {
        fetchSites()
        if (siteId) {
          fetchSite()
          fetchProducts()
        }
      } else if (!loading && !user) {
        router.push('/')
      }
    }, [user, loading, siteId])
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    
    if (loading || !user) {
      return <div>Loading...</div>;
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <Header user={user} siteName={site?.name || 'Products'} />
        <H_site sites={sites} />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Manage Products {site?.name}</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mb-6">Add New Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update the product details below.' : 'Fill in the product details below.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editingProduct ? editingProduct.description : newProduct.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={editingProduct ? editingProduct.category : newProduct.category}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={editingProduct ? editingProduct.stock : newProduct.stock}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="images" className="text-right">
                    Images
                  </Label>
                  <Input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    onChange={(e) => handleImageUpload(e, editingProduct ? editingProduct.id! : 'new')}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{product.description}</p>
                  <p className="font-bold mt-2">Price: ${product.price}</p>
                  <p>Category: {product.category}</p>
                  <p>Stock: {product.stock}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {product.images && product.images.map((image, index) => (
                      <img key={index} src={image} alt={`${product.name} ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setEditingProduct(product)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteProduct(product.id!)}>Delete</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
}