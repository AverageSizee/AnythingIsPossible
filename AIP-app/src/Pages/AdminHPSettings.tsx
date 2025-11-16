import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import AdminNavbar from '../Component/AdminNavbar';
import { supabase } from '../supabaseClient';
import { uploadToCloudinary } from '../services/CloudinaryService';
import type { Product } from '../types/Product';

interface Slide {
  id: number;
  image: string;
  label: string;
}

interface Widget {
  id: number;
  widget_name: string;
  products: Product[];
}

const HPSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({ image: '', label: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [widgetFormData, setWidgetFormData] = useState({ widget_name: '' });
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const getFirstImageUrl = (images: string[]): string => {
    for (const url of images) {
      const extension = url.split('.').pop()?.toLowerCase();
      if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
        return url;
      }
    }
    return '';
  };

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase.from('Slides').select('*');
      if (error) {
        console.error('Error fetching slides:', error);
        alert('Error fetching slides: ' + error.message);
      } else {
        setSlides(data || []);
      }
    };

    const fetchWidgets = async () => {
      const { data, error } = await supabase
        .from('Widgets')
        .select(`
          id,
          widget_name,
          Products_Widgets!left(
            Products!inner(*)
          )
        `);
      if (error) {
        console.error('Error fetching widgets:', error);
        alert('Error fetching widgets: ' + error.message);
      } else {
        const widgetsWithProducts = data?.map(widget => ({
          id: widget.id,
          widget_name: widget.widget_name,
          products: widget.Products_Widgets ? widget.Products_Widgets.map((pw: any) => pw.Products).flat() : []
        })) || [];
        setWidgets(widgetsWithProducts);
      }
    };

    const fetchAllProducts = async () => {
      const { data, error } = await supabase.from('Products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setAllProducts(data || []);
      }
    };

    fetchSlides();
    fetchWidgets();
    fetchAllProducts();
  }, []);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleAddSlide = () => {
    setEditingSlide(null);
    setFormData({ image: '', label: '' });
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({ image: slide.image, label: slide.label });
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteSlide = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      const { error } = await supabase.from('Slides').delete().eq('id', id);
      if (error) {
        console.error('Error deleting slide:', error);
        alert('Error deleting slide: ' + error.message);
      } else {
        setSlides(slides.filter(slide => slide.id !== id));
      }
    }
  };

  const handleSaveSlide = async () => {
    if (!formData.label.trim()) {
      alert('Please fill in the label');
      return;
    }

    if (!selectedFile && !formData.image.trim()) {
      alert('Please upload an image or provide an image URL');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      if (editingSlide) {
        // Update
        const { error } = await supabase
          .from('Slides')
          .update({ image: imageUrl, label: formData.label })
          .eq('id', editingSlide.id);
        if (error) {
          console.error('Error updating slide:', error);
          alert('Error updating slide: ' + error.message);
        } else {
          setSlides(slides.map(slide =>
            slide.id === editingSlide.id ? { ...slide, image: imageUrl, label: formData.label } : slide
          ));
        }
      } else {
        // Add
        const { data, error } = await supabase
          .from('Slides')
          .insert([{ image: imageUrl, label: formData.label }])
          .select();
        if (error) {
          console.error('Error adding slide:', error);
          alert('Error adding slide: ' + error.message);
        } else {
          setSlides([...slides, ...data]);
        }
      }

      setIsEditModalOpen(false);
      setEditingSlide(null);
      setFormData({ image: '', label: '' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleAddWidget = () => {
    setEditingWidget(null);
    setWidgetFormData({ widget_name: '' });
    setIsWidgetModalOpen(true);
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
    setWidgetFormData({ widget_name: widget.widget_name });
    setIsWidgetModalOpen(true);
  };

  const handleDeleteWidget = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      const { error } = await supabase.from('Widgets').delete().eq('id', id);
      if (error) {
        console.error('Error deleting widget:', error);
        alert('Error deleting widget: ' + error.message);
      } else {
        setWidgets(widgets.filter(widget => widget.id !== id));
      }
    }
  };

  const handleSaveWidget = async () => {
    if (!widgetFormData.widget_name.trim()) {
      alert('Please fill in the widget name');
      return;
    }

    if (editingWidget) {
      // Update
      const { error } = await supabase
        .from('Widgets')
        .update({ widget_name: widgetFormData.widget_name })
        .eq('id', editingWidget.id);
      if (error) {
        console.error('Error updating widget:', error);
        alert('Error updating widget: ' + error.message);
      } else {
        setWidgets(widgets.map(widget =>
          widget.id === editingWidget.id ? { ...widget, widget_name: widgetFormData.widget_name } : widget
        ));
      }
    } else {
      // Add
      const { data, error } = await supabase
        .from('Widgets')
        .insert([{ widget_name: widgetFormData.widget_name }])
        .select();
      if (error) {
        console.error('Error adding widget:', error);
        alert('Error adding widget: ' + error.message);
      } else {
        setWidgets([...widgets, { id: data[0].id, widget_name: data[0].widget_name, products: [] }]);
      }
    }

    setIsWidgetModalOpen(false);
    setEditingWidget(null);
    setWidgetFormData({ widget_name: '' });
  };

  const handleAddProductToWidget = (widgetId: number) => {
    setSelectedWidgetId(widgetId);
    setSelectedProducts([]);
    setIsAddProductModalOpen(true);
  };

  const handleSaveProductsToWidget = async () => {
    if (!selectedWidgetId || selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    const inserts = selectedProducts.map(product => ({
      widget_id: selectedWidgetId,
      product_id: product.product_id
    }));

    const { error } = await supabase.from('Products_Widgets').insert(inserts);
    if (error) {
      console.error('Error adding products to widget:', error);
      alert('Error adding products to widget: ' + error.message);
    } else {
      // Refresh widgets
      const { data, error: fetchError } = await supabase
        .from('Widgets')
        .select(`
          id,
          widget_name,
          Products_Widgets!left(
            Products!inner(*)
          )
        `);
      if (fetchError) {
        console.error('Error fetching widgets:', fetchError);
      } else {
        const widgetsWithProducts = data?.map(widget => ({
          id: widget.id,
          widget_name: widget.widget_name,
          products: widget.Products_Widgets ? widget.Products_Widgets.map((pw: any) => pw.Products).flat() : []
        })) || [];
        setWidgets(widgetsWithProducts);
      }
      setIsAddProductModalOpen(false);
      setSelectedWidgetId(null);
      setSelectedProducts([]);
    }
  };

  const handleRemoveProductFromWidget = async (widgetId: number, productId: number) => {
    const { error } = await supabase
      .from('Products_Widgets')
      .delete()
      .eq('widget_id', widgetId)
      .eq('product_id', productId);
    if (error) {
      console.error('Error removing product from widget:', error);
      alert('Error removing product from widget: ' + error.message);
    } else {
      setWidgets(widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, products: widget.products.filter(p => p.product_id !== productId) }
          : widget
      ));
    }
  };

  const getAvailableProducts = () => {
    const currentWidget = widgets.find(w => w.id === selectedWidgetId);
    return allProducts.filter(product =>
      !currentWidget?.products.some(p => p.product_id === product.product_id)
    );
  };

  return (
    <>
      <AdminNavbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`max-w-7xl mx-auto p-8 min-h-screen bg-gray-100 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex justify-between items-center mb-6 p-6 bg-white rounded-lg shadow-md">
          <h1 className="m-0 text-3xl text-gray-800">HP Settings</h1>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Home Page Preview</h2>

          {/* Mini Homepage Carousel */}
          <div className="relative h-64 overflow-hidden bg-neutral-900 rounded-lg mb-6 group cursor-pointer" onClick={handleEditClick}>
            <div className="relative w-full h-full">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute w-full h-full transition-opacity duration-500 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img src={slide.image || "/placeholder.svg"} alt={slide.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            >
              <ChevronLeft className="text-white" size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            >
              <ChevronRight className="text-white" size={20} />
            </button>

            {/* Edit Indicator */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <Edit size={48} className="mx-auto mb-2" />
                <p className="text-lg font-semibold">Edit Hero Section</p>
              </div>
            </div>
          </div>

          {/* Slides Management */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage Slides</h3>
            <button
              onClick={handleAddSlide}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition"
            >
              Add New Slide
            </button>
            <div className="mt-4 space-y-2">
              {slides.map((slide) => (
                <div key={slide.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{slide.label}</p>
                    <p className="text-sm text-gray-600">{slide.image}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSlide(slide)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widgets Management */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage Widgets</h3>
            <button
              onClick={handleAddWidget}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition mb-4"
            >
              Add New Widget
            </button>
            {widgets.map((widget) => (
              <div key={widget.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-700">{widget.widget_name}</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditWidget(widget)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleAddProductToWidget(widget.id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-500 transition"
                    >
                      Add Products
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {widget.products.map((product) => (
                    <div key={product.product_id} className="group relative">
                      <div className="bg-neutral-900 overflow-hidden mb-2 aspect-square rounded">
                        <img
                          src={getFirstImageUrl(product.images || []) || "/placeholder.svg"}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <h5 className="text-sm font-medium mb-1 truncate">
                        {product.product_name}
                      </h5>
                      <p className="text-neutral-400 text-sm">₱{product.price.toFixed(2)} PHP</p>
                      <button
                        onClick={() => handleRemoveProductFromWidget(widget.id, product.product_id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setFormData({ ...formData, image: '' });
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold">Or Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setSelectedFile(null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter image URL"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter slide label"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSlide}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Save'}
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Modal */}
      {isWidgetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{editingWidget ? 'Edit Widget' : 'Add New Widget'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Widget Name</label>
                <input
                  type="text"
                  value={widgetFormData.widget_name}
                  onChange={(e) => setWidgetFormData({ widget_name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter widget name"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveWidget}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              >
                Save
              </button>
              <button
                onClick={() => setIsWidgetModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add Products to Widget</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {getAvailableProducts().map((product) => (
                <div
                  key={product.product_id}
                  className={`group cursor-pointer border-2 rounded-lg p-2 ${
                    selectedProducts.some(p => p.product_id === product.product_id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                  onClick={() => {
                    if (selectedProducts.some(p => p.product_id === product.product_id)) {
                      setSelectedProducts(selectedProducts.filter(p => p.product_id !== product.product_id));
                    } else {
                      setSelectedProducts([...selectedProducts, product]);
                    }
                  }}
                >
                  <div className="bg-neutral-900 overflow-hidden mb-2 aspect-square rounded">
                    <img
                      src={getFirstImageUrl(product.images || []) || "/placeholder.svg"}
                      alt={product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h5 className="text-sm font-medium mb-1 truncate">
                    {product.product_name}
                  </h5>
                  <p className="text-neutral-400 text-sm">₱{product.price.toFixed(2)} PHP</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProductsToWidget}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              >
                Add Selected Products
              </button>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HPSettings;
