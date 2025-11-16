import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Product } from '../types/Product';
import AdminNavbar from '../Component/AdminNavbar';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [formData, setFormData] = useState<{
    product_name: string;
    description: string;
    short_description?: string;
    price: number;
    is_sale?: boolean;
    sales_price?: number;
    stock_quantity: number;
    is_in_stock: boolean;
    low_stock_threshold?: number;
    Size: string;
    images: string[];
    colors: { color_code: string; color_name: string }[];
  }>({
    product_name: '',
    description: '',
    short_description: '',
    price: 0,
    is_sale: false,
    sales_price: 0,
    stock_quantity: 0,
    is_in_stock: true,
    low_stock_threshold: 5,
    Size: '',
    images: [],
    colors: [],
  });

  const getFirstImageUrl = (images: string[]): string => {
    for (const url of images) {
      const extension = url.split('.').pop()?.toLowerCase();
      if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
        return url;
      }
    }
    return '';
  };

  const parseColorsString = (colorsString: string): {color_code: string, color_name: string}[] => {
    if (!colorsString) return [];
    return colorsString.split('},{color_data{').map((color, i) => {
      if (i === 0) return color.replace('{color_data{', '');
      if (i === colorsString.split('},{color_data{').length - 1) return color.replace('}}', '');
      return color;
    }).map(color => {
      const [color_code, color_name] = color.split(',');
      return {
        color_code: color_code.split(':')[1],
        color_name: color_name.split(':')[1],
      };
    });
  };

  const serializeColorsArray = (colorsArray: {color_code: string, color_name: string}[]): string => {
    return colorsArray.map(color => `{color_data{color_code:${color.color_code},color_name:${color.color_name}}}`).join(',');
  };

  // Load products from Supabase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('Products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          alert('Error loading products: ' + error.message);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Unexpected error fetching products:', error);
        alert('An unexpected error occurred while loading products');
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const input = e.target as HTMLInputElement;
    
    // Handle checkbox
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: input.checked,
      }));
      return;
    }
    
    // Convert number inputs to actual numbers
    if (type === 'number') {
      const numValue = input.value === '' ? 0 : parseFloat(input.value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayInputChange = (field: 'size' | 'color', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item),
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    // Validate required fields
    if (!formData.product_name.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (formData.price <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }
    if (formData.stock_quantity < 0) {
      alert('Stock cannot be negative');
      return;
    }
    if (!formData.Size.trim()) {
      alert('Please enter at least one size');
      return;
    }
    if (formData.images.length === 0) {
      alert('Please provide at least one image');
      return;
    }

    try {
      const { error } = await supabase
        .from('Products')
        .update({
          product_name: formData.product_name,
          description: formData.description,
          short_description: formData.short_description,
          price: formData.price,
          is_sale: formData.is_sale,
          sales_price: formData.sales_price,
          stock_quantity: formData.stock_quantity,
          is_in_stock: formData.is_in_stock,
          low_stock_threshold: formData.low_stock_threshold,
          Size: formData.Size,
          images: formData.images,
          colors: formData.colors,
        })
        .eq('product_id', editingProduct.product_id);

      if (error) {
        console.error('Error updating product:', error);
        alert('Error updating product: ' + error.message);
        return;
      }

      // Refresh products list
      const { data, error: fetchError } = await supabase
        .from('Products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error refreshing products:', fetchError);
      } else {
        setProducts(data || []);
      }

      // Reset form
      setFormData({
        product_name: '',
        description: '',
        short_description: '',
        price: 0,
        is_sale: false,
        sales_price: 0,
        stock_quantity: 0,
        is_in_stock: true,
        low_stock_threshold: 5,
        Size: '',
        images: [],
        colors: [],
      });
      setEditingProduct(null);
      setIsEditFormOpen(false);

      alert('Product updated successfully!');
    } catch (error) {
      console.error('Unexpected error updating product:', error);
      alert('An unexpected error occurred while updating the product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name || product.name || '',
      description: product.description,
      short_description: product.short_description || '',
      price: product.price,
      is_sale: product.is_sale || false,
      sales_price: product.sales_price || 0,
      stock_quantity: product.stock_quantity || product.stock || 0,
      is_in_stock: product.is_in_stock || product.available || true,
      low_stock_threshold: product.low_stock_threshold || 5,
      Size: product.Size || product.size?.join(', ') || '',
      images: product.images || (product.imageUrl ? [product.imageUrl] : []) || [],
      colors: typeof product.colors === 'string' ? parseColorsString(product.colors) : (product.colors || []),
    });
    setIsEditFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('Products')
          .delete()
          .eq('product_id', parseInt(id));

        if (error) {
          console.error('Error deleting product:', error);
          alert('Error deleting product: ' + error.message);
          return;
        }

        // Refresh products list
        const { data, error: fetchError } = await supabase
          .from('Products')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error refreshing products:', fetchError);
        } else {
          setProducts(data || []);
        }

        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Unexpected error deleting product:', error);
        alert('An unexpected error occurred while deleting the product');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      product_name: '',
      description: '',
      short_description: '',
      price: 0,
      is_sale: false,
      sales_price: 0,
      stock_quantity: 0,
      is_in_stock: true,
      low_stock_threshold: 5,
      Size: '',
      images: [],
      colors: [],
    });
    setEditingProduct(null);
    setIsEditFormOpen(false);
  };

  return (
    <>
      <AdminNavbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`max-w-7xl mx-auto p-8 min-h-screen bg-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex justify-between items-center mb-6 p-6 bg-white rounded-lg shadow-md">
          <h1 className="m-0 text-3xl text-gray-800">Admin Dashboard</h1>
          <Link to="/admin/add-product" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg">
            + Add New Product
          </Link>
        </div>

      {isEditFormOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-8 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="mt-0 mb-6 text-gray-800 text-2xl">Edit Product</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-5">
                <label htmlFor="product_name" className="block mb-2 font-semibold text-gray-700 text-sm">Product Name *</label>
                <input
                  type="text"
                  id="product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="mb-5">
                <label htmlFor="description" className="block mb-2 font-semibold text-gray-700 text-sm">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="mb-5">
                <label htmlFor="short_description" className="block mb-2 font-semibold text-gray-700 text-sm">Short Description</label>
                <textarea
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="price" className="block mb-2 font-semibold text-gray-700 text-sm">Price ($) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="block mb-2 font-semibold text-gray-700 text-sm">Stock Quantity *</label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="is_sale" className="block mb-2 font-semibold text-gray-700 text-sm">On Sale</label>
                  <input
                    type="checkbox"
                    id="is_sale"
                    name="is_sale"
                    checked={formData.is_sale}
                    onChange={handleInputChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="sales_price" className="block mb-2 font-semibold text-gray-700 text-sm">Sale Price ($)</label>
                  <input
                    type="number"
                    id="sales_price"
                    name="sales_price"
                    value={formData.sales_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label htmlFor="is_in_stock" className="block mb-2 font-semibold text-gray-700 text-sm">In Stock</label>
                  <input
                    type="checkbox"
                    id="is_in_stock"
                    name="is_in_stock"
                    checked={formData.is_in_stock}
                    onChange={handleInputChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="low_stock_threshold" className="block mb-2 font-semibold text-gray-700 text-sm">Low Stock Threshold</label>
                  <input
                    type="number"
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="Size" className="block mb-2 font-semibold text-gray-700 text-sm">Size *</label>
                <input
                  type="text"
                  id="Size"
                  name="Size"
                  value={formData.Size}
                  onChange={handleInputChange}
                  placeholder="e.g., S, M, L, XL"
                  className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Images *</label>
                {formData.images.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index] = e.target.value;
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      placeholder="https://example.com/image1.jpg"
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                    {url && (
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover border border-gray-300 rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="px-3 py-3 bg-red-600 text-white rounded-lg font-semibold transition-all hover:bg-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all hover:bg-blue-500"
                >
                  Add Image
                </button>
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Colors</label>
                {formData.colors.map((color, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={color.color_name}
                      onChange={(e) => {
                        const newColors = [...formData.colors];
                        newColors[index].color_name = e.target.value;
                        setFormData(prev => ({ ...prev, colors: newColors }));
                      }}
                      placeholder="Color Name"
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      type="color"
                      value={color.color_code}
                      onChange={(e) => {
                        const newColors = [...formData.colors];
                        newColors[index].color_code = e.target.value;
                        setFormData(prev => ({ ...prev, colors: newColors }));
                      }}
                      className="w-12 h-10 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newColors = formData.colors.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, colors: newColors }));
                      }}
                      className="px-3 py-3 bg-red-600 text-white rounded-lg font-semibold transition-all hover:bg-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, colors: [...prev.colors, { color_code: '#000000', color_name: '' }] }));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold transition-all hover:bg-blue-500"
                >
                  Add Color
                </button>
              </div>

              <div className="flex gap-4 mt-8 justify-end">
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg">
                  Update Product
                </button>
                <button type="button" className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-500" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-xl text-gray-600">No products yet. Click "Add New Product" to get started!</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.product_id.toString()} className={`bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 ${!product.is_in_stock ? 'border-2 border-red-500 opacity-75' : ''}`}>
              <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <img src={getFirstImageUrl(product.images || []) || product.imageUrl || ''} alt={product.product_name || product.name || ''} className="w-full h-full object-cover" />
                {!product.is_in_stock && <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg font-semibold text-sm">Unavailable</div>}
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{product.product_name || product.name || ''}</h3>
                <p className="text-blue-600 font-semibold text-sm uppercase mb-3">{product.category || ''}</p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl font-bold text-green-600">${(Number(product.price) || 0).toFixed(2)}</span>
                  <span className="text-sm text-gray-600 font-semibold">Stock: {Number(product.stock_quantity) || Number(product.stock) || 0}</span>
                </div>
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${product.is_in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.is_in_stock ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-gray-200 rounded-md text-sm text-gray-700">Sizes: {Array.isArray(product.size) ? product.size.join(', ') : (product.size || product.Size || '')}</span>
                  <span className="inline-block px-3 py-1 bg-gray-200 rounded-md text-sm text-gray-700">Colors: {typeof product.colors === 'string' ? parseColorsString(product.colors).map(c => c.color_name).join(', ') : (Array.isArray(product.color) ? product.color.join(', ') : (product.color || ''))}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold transition-all hover:bg-green-500 hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold transition-all hover:bg-red-500"
                    onClick={() => handleDelete(product.product_id.toString())}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

      </div>

    </div>

  </>

);

};

export default AdminDashboard;

