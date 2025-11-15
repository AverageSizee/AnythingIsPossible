import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Product } from '../types/Product';
import { uploadToCloudinary } from '../services/CloudinaryService';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    product_name: string;
    description: string;
    short_descrip?: string;
    price: number;
    is_sale?: boolean;
    sales_price?: number;
    stock_quantit: number;
    is_in_stock: boolean;
    low_stock_thr?: number;
    Size: string;
    images: string[];
  }>({
    product_name: '',
    description: '',
    short_descrip: '',
    price: 0,
    is_sale: false,
    sales_price: 0,
    stock_quantit: 0,
    is_in_stock: true,
    low_stock_thr: 5,
    Size: '',
    images: [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const input = e.target as HTMLInputElement;

    // Handle file input
    if (type === 'file') {
      const files = input.files;
      if (files) {
        setSelectedFiles(Array.from(files));
      }
      return;
    }

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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    if (formData.stock_quantit < 0) {
      alert('Stock cannot be negative');
      return;
    }
    if (!formData.Size.trim()) {
      alert('Please enter at least one size');
      return;
    }

    setUploading(true);

    try {
      // Upload images to Cloudinary
      const imageUrls: string[] = [];
      for (const file of selectedFiles) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }

      // Update formData with image URLs
      setFormData(prev => ({
        ...prev,
        images: imageUrls,
      }));

      const { data, error } = await supabase
        .from('Products')
        .insert([
          {
            product_name: formData.product_name,
            description: formData.description,
            short_description: formData.short_descrip,
            price: formData.price,
            is_sale: formData.is_sale,
            sales_price: formData.sales_price,
            stock_quantity: formData.stock_quantit,
            is_in_stock: formData.is_in_stock,
            low_stock_threshold: formData.low_stock_thr,
            Size: formData.Size,
            images: imageUrls,
          }
        ])
        .select();

      if (error) {
        console.error('Error adding product:', error);
        alert('Error adding product: ' + error.message);
        return;
      }

      // Reset form and navigate to dashboard
      setFormData({
        product_name: '',
        description: '',
        short_descrip: '',
        price: 0,
        is_sale: false,
        sales_price: 0,
        stock_quantit: 0,
        is_in_stock: true,
        low_stock_thr: 5,
        Size: '',
        images: [],
      });
      setSelectedFiles([]);

      alert('Product added successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred while adding the product');
    } finally {
      setUploading(false);
    }
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
            <label htmlFor="product_name">Product Name *</label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={formData.product_name}
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

          <div className="form-group">
            <label htmlFor="short_descrip">Short Description</label>
            <input
              type="text"
              id="short_descrip"
              name="short_descrip"
              value={formData.short_descrip}
              onChange={handleInputChange}
              placeholder="Brief description for listings"
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
              <label htmlFor="stock_quantit">Stock Quantity *</label>
              <input
                type="number"
                id="stock_quantit"
                name="stock_quantit"
                value={formData.stock_quantit}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sales_price">Sale Price ($)</label>
              <input
                type="number"
                id="sales_price"
                name="sales_price"
                value={formData.sales_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="low_stock_thr">Low Stock Threshold</label>
              <input
                type="number"
                id="low_stock_thr"
                name="low_stock_thr"
                value={formData.low_stock_thr}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="Size">Size *</label>
            <input
              type="text"
              id="Size"
              name="Size"
              value={formData.Size}
              onChange={handleInputChange}
              placeholder="e.g., S, M, L, XL"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Images/Videos</label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*,video/*"
              onChange={handleInputChange}
            />
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <p>Selected files: {selectedFiles.length}</p>
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="is_sale"
                  name="is_sale"
                  checked={formData.is_sale}
                  onChange={handleInputChange}
                />
                <span>On Sale</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="is_in_stock"
                  name="is_in_stock"
                  checked={formData.is_in_stock}
                  onChange={handleInputChange}
                />
                <span>In Stock</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Create Product'}
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

