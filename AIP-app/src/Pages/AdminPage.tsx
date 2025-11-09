import { useState, useEffect } from 'react';
import type { Product } from '../types/Product';
import './AdminPage.css';

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    size: [],
    color: [],
    imageUrl: '',
    stock: 0,
  });

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        // Normalize data: ensure price and stock are numbers
        const normalized = parsed.map((product: Product) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : Number(product.price) || 0,
          stock: typeof product.stock === 'string' ? parseInt(product.stock, 10) || 0 : Number(product.stock) || 0,
        }));
        setProducts(normalized);
      } catch (error) {
        console.error('Error loading products from localStorage:', error);
      }
    }
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const input = e.target as HTMLInputElement;
    
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
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
    if (formData.stock < 0) {
      alert('Stock cannot be negative');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    if (formData.size.length === 0) {
      alert('Please enter at least one size');
      return;
    }
    if (formData.color.length === 0) {
      alert('Please enter at least one color');
      return;
    }
    if (!formData.imageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }
    
    // Ensure price and stock are numbers
    const normalizedFormData = {
      ...formData,
      price: typeof formData.price === 'string' ? parseFloat(formData.price) || 0 : Number(formData.price) || 0,
      stock: typeof formData.stock === 'string' ? parseInt(String(formData.stock), 10) || 0 : Number(formData.stock) || 0,
    };
    
    if (editingProduct) {
      // Update existing product
      setProducts(prev =>
        prev.map(product =>
          product.id === editingProduct.id
            ? {
                ...product,
                ...normalizedFormData,
                updatedAt: new Date().toISOString(),
              }
            : product
        )
      );
    } else {
      // Create new product
      const newProduct: Product = {
        ...normalizedFormData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts(prev => [...prev, newProduct]);
    }

    // Reset form
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      size: [],
      color: [],
      imageUrl: '',
      stock: 0,
    });
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      size: product.size,
      color: product.color,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(product => product.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      size: [],
      color: [],
      imageUrl: '',
      stock: 0,
    });
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel - Product Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
        >
          + Add New Product
        </button>
      </div>

      {isFormOpen && (
        <div className="form-overlay">
          <div className="form-container">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Stock *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Pants">Pants</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="size">Sizes (comma-separated) *</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size.join(', ')}
                  onChange={(e) => handleArrayInputChange('size', e.target.value)}
                  placeholder="e.g., S, M, L, XL"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Colors (comma-separated) *</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color.join(', ')}
                  onChange={(e) => handleArrayInputChange('color', e.target.value)}
                  placeholder="e.g., Red, Blue, Black"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL *</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Click "Add New Product" to get started!</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.imageUrl} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-description">{product.description}</p>
                <div className="product-details">
                  <span className="product-price">${(Number(product.price) || 0).toFixed(2)}</span>
                  <span className="product-stock">Stock: {Number(product.stock) || 0}</span>
                </div>
                <div className="product-tags">
                  <span className="tag">Sizes: {product.size.join(', ')}</span>
                  <span className="tag">Colors: {product.color.join(', ')}</span>
                </div>
                <div className="product-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(product.id)}
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
  );
};

export default AdminPage;

