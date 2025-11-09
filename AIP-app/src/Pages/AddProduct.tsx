import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types/Product';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    size: [],
    color: [],
    imageUrl: '',
    stock: 0,
    available: true,
  });

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
    
    // Get existing products from sessionStorage
    const savedProducts = sessionStorage.getItem('products');
    const existingProducts: Product[] = savedProducts ? JSON.parse(savedProducts) : [];
    
    // Create new product
    const newProduct: Product = {
      ...normalizedFormData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to products array and save
    const updatedProducts = [...existingProducts, newProduct];
    sessionStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Reset form and navigate to dashboard
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      size: [],
      color: [],
      imageUrl: '',
      stock: 0,
      available: true,
    });
    
    alert('Product added successfully!');
    navigate('/admin/dashboard');
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>Add New Product</h1>
        <Link to="/admin/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="product-form">
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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="available"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
              />
              <span>Product is available</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Create Product
            </button>
            <Link to="/admin/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

