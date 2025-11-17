import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { uploadToCloudinary } from '../services/CloudinaryService';
import AdminNavbar from '../Component/AdminNavbar';

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    colors: string;
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
    colors: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newColor, setNewColor] = useState({ color_code: '#000000', color_name: '' });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const input = e.target as HTMLInputElement;

    // Handle file input
    if (type === 'file') {
      const files = input.files;
      if (files) {
        setSelectedFiles(prev => [...prev, ...Array.from(files)]);
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

  const handleNewColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewColor(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addColor = () => {
    if (!newColor.color_name.trim()) {
      alert('Please enter a color name');
      return;
    }
    const colorString = `{color_data{color_code:${newColor.color_code},color_name:${newColor.color_name}}}`;
    setFormData(prev => ({
      ...prev,
      colors: prev.colors ? `${prev.colors},${colorString}` : colorString,
    }));
    setNewColor({ color_code: '#000000', color_name: '' });
  };

  const removeColor = (index: number) => {
    const colorsArray = formData.colors ? formData.colors.split('},{color_data{').map((color, i) => {
      if (i === 0) return color.replace('{color_data{', '');
      if (i === formData.colors.split('},{color_data{').length - 1) return color.replace('}}', '');
      return color;
    }).map(color => {
      const [color_code, color_name] = color.split(',');
      return {
        color_code: color_code.split(':')[1],
        color_name: color_name.split(':')[1],
      };
    }) : [];
    colorsArray.splice(index, 1);
    const newColorsString = colorsArray.map(color => `{color_data{color_code:${color.color_code},color_name:${color.color_name}}}`).join(',');
    setFormData(prev => ({
      ...prev,
      colors: newColorsString,
     }));
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
    if (formData.stock_quantity < 0) {
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

      console.log('Form data before insert:', formData);
      console.log('Image URLs:', imageUrls);

      const { error } = await supabase
        .from('Products')
        .insert([
          {
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
            images: imageUrls,
            colors: formData.colors,
          }
        ]);

      if (error) {
        console.error('Error adding product:', error);
        alert('Error adding product: ' + error.message);
        return;
      }

      // Reset form and navigate to dashboard
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
        colors: '',
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
    <>
      <AdminNavbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`max-w-7xl mx-auto p-8 min-h-screen bg-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
      <div className="flex justify-between items-center mb-6 p-6 bg-white rounded-lg shadow-md">
        <h1 className="m-0 text-3xl text-gray-800">Add New Product</h1>
        <Link to="/admin/dashboard" className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-500">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="short_description" className="block mb-2 font-semibold text-gray-700 text-sm">Short Description</label>
            <input
              type="text"
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              placeholder="Brief description for listings"
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
            <label htmlFor="images" className="block mb-2 font-semibold text-gray-700 text-sm">Images/Videos</label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*,video/*"
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">Selected files: {selectedFiles.length}</p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="text-gray-700">{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Colors</label>
            <div className="space-y-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label htmlFor="color_name" className="block mb-1 text-sm font-medium text-gray-600">Color Name</label>
                  <input
                    type="text"
                    id="color_name"
                    name="color_name"
                    value={newColor.color_name}
                    onChange={handleNewColorChange}
                    placeholder="e.g., Red, Blue"
                    className="w-full p-2 border border-gray-300 rounded-lg text-base font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="color_code" className="block mb-1 text-sm font-medium text-gray-600">Color</label>
                  <input
                    type="color"
                    id="color_code"
                    name="color_code"
                    value={newColor.color_code}
                    onChange={handleNewColorChange}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-green-500"
                >
                  Add Color
                </button>
              </div>
              {parseColorsString(formData.colors).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Added Colors:</p>
                  <div className="flex flex-wrap gap-2">
                    {parseColorsString(formData.colors).map((color, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.color_code }}
                        ></div>
                        <span className="text-sm text-gray-700">{color.color_name}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_sale"
                  name="is_sale"
                  checked={formData.is_sale}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-gray-700 font-semibold">On Sale</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_in_stock"
                  name="is_in_stock"
                  checked={formData.is_in_stock}
                  onChange={handleInputChange}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-gray-700 font-semibold">In Stock</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-8 justify-end">
            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Create Product'}
            </button>
            <Link to="/admin/dashboard" className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-500">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default AddProduct;

