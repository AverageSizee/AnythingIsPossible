import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import AdminNavbar from '../Component/AdminNavbar';
import { supabase } from '../supabaseClient';
import { uploadToCloudinary } from '../services/CloudinaryService';

interface Slide {
  id: number;
  image: string;
  label: string;
}

const HPSettings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState({ image: '', label: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase.from('Slides').select('*');
      if (error) {
        console.error('Error fetching slides:', error);
      } else {
        setSlides(data || []);
      }
    };
    fetchSlides();
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
    </>
  );
};

export default HPSettings;
