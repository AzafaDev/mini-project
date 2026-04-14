import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useToastStore } from "../stores/useToastStore";

const CATEGORIES = [
  "Conference",
  "Concert",
  "Workshop",
  "Seminar",
  "Festival",
  "Sports",
  "Exhibition",
  "Networking",
  "Other",
];

export default function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateEvent, loadingEventAction, error, clearError } = useEventStore();
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    category: "",
    startDate: "",
    endDate: "",
    totalSeats: 100,
    price: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      const { fetchEventById } = useEventStore.getState();
      const event = await fetchEventById(id);
      
      if (event) {
        setFormData({
          name: event.name,
          description: event.description,
          location: event.location,
          category: event.category,
          startDate: event.startDate.slice(0, 16), // Remove timezone for datetime-local
          endDate: event.endDate.slice(0, 16),
          totalSeats: event.totalSeats,
          price: event.price,
        });
        if (event.imageUrl) {
          setImagePreview(event.imageUrl);
        }
      }
      setLoadingEvent(false);
    };

    fetchEvent();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalSeats" || name === "price" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validation
    if (!formData.name.trim()) {
      setLocalError("Event name is required");
      return;
    }
    if (!formData.description.trim()) {
      setLocalError("Description is required");
      return;
    }
    if (!formData.location.trim()) {
      setLocalError("Location is required");
      return;
    }
    if (!formData.category) {
      setLocalError("Category is required");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setLocalError("Start and end dates are required");
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setLocalError("End date must be after start date");
      return;
    }
    if (formData.totalSeats < 1) {
      setLocalError("Total seats must be at least 1");
      return;
    }
    if (formData.price < 0) {
      setLocalError("Price cannot be negative");
      return;
    }

    if (!id) {
      setLocalError("Event ID is missing");
      return;
    }

    try {
      const result = await updateEvent(id, {
        ...formData,
        imageFile: imageFile || undefined,
      });

      if (result) {
        addToast("success", "Event updated successfully!");
        navigate(`/events/${id}`);
      } else {
        setLocalError(error || "Failed to update event");
      }
    } catch (err: any) {
      setLocalError(err.response?.data?.message || "Failed to update event");
    }
  };

  if (loadingEvent) {
    return (
      <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter']">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1C1B1B] rounded w-48 mb-8"></div>
            <div className="space-y-4">
              <div className="h-40 bg-[#1C1B1B] rounded-lg"></div>
              <div className="h-40 bg-[#1C1B1B] rounded-lg"></div>
              <div className="h-40 bg-[#1C1B1B] rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter'] selection:bg-[#4B4DD8] selection:text-[#D9D8FF]">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-[#1C1B1B] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <p className="text-sm text-[#C7C4D8]">Update your event details</p>
          </div>
        </div>

        {/* Error Display */}
        {(localError || error) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <p className="text-red-400">{localError || error}</p>
            <button onClick={() => setLocalError(null)} className="text-red-400 hover:text-red-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
            <h3 className="text-lg font-bold mb-4">Event Image</h3>
            <div className="flex items-start gap-6">
              <div className="w-48 h-32 rounded-lg bg-[#2A2A2A] flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-[#353534]">
                    image
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="event-image"
                />
                <label
                  htmlFor="event-image"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#353534] hover:bg-[#393939] rounded-lg cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {imageFile ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-xs text-[#666] mt-2">
                  Recommended: 1200x800px or similar ratio. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
            <h3 className="text-lg font-bold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
            <h3 className="text-lg font-bold mb-4">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tickets & Pricing */}
          <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
            <h3 className="text-lg font-bold mb-4">Tickets & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  min={1}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Price per Ticket ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-[#353534] hover:bg-[#393939] rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loadingEventAction}
              className="px-6 py-3 bg-[#4B4DD8] hover:bg-[#3a3cb3] disabled:bg-[#4B4DD8]/50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {loadingEventAction ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
