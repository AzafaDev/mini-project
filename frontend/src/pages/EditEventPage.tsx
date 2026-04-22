import { EVENT_CATEGORIES, FALLBACK_IMAGES } from "../lib/constants";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { useEventStore } from "../stores/useEventStore";
import { useToastStore } from "../stores/useToastStore";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { updateEventSchema } from "../validation/eventSchemas";

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

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      location: "",
      category: "",
      startDate: "",
      endDate: "",
      totalSeats: 100,
      price: 0,
    },
    validationSchema: updateEventSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      setLocalError(null);
      setIsConfirmDialogOpen(true);
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      const { fetchEventById } = useEventStore.getState();
      const event = await fetchEventById(id);
      
      if (event) {
        formik.setValues({
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
  }, [id, formik.setValues]);



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

  // Validate before submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validate date range
    if (formik.values.startDate && formik.values.endDate) {
      if (new Date(formik.values.startDate) >= new Date(formik.values.endDate)) {
        setLocalError("End date must be after start date");
        return;
      }
    }

    formik.handleSubmit();
  };

  const handleConfirmSave = async () => {
    if (!id) return;
    
    try {
      const result = await updateEvent(id, {
        ...formik.values,
        imageFile: imageFile || undefined,
      });

      if (result) {
        addToast("success", "Event updated successfully!");
        setIsConfirmDialogOpen(false);
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
      <div className="bg-dark text-text-light antialiased min-h-screen font-['Inter']">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-surface rounded w-48 mb-8"></div>
            <div className="space-y-4">
              <div className="h-40 bg-dark-surface rounded-lg"></div>
              <div className="h-40 bg-dark-surface rounded-lg"></div>
              <div className="h-40 bg-dark-surface rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-text-light antialiased min-h-screen font-['Inter'] selection:bg-accent selection:text-[#D9D8FF]">
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-lg bg-dark-surface flex items-center justify-center hover:bg-dark-elevated transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <p className="text-sm text-text-muted">Update your event details</p>
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
        <form onSubmit={handleFormSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="bg-dark-surface rounded-lg p-6 border border-border-muted/10">
            <h3 className="text-lg font-bold mb-4">Event Image</h3>
            <div className="flex items-start gap-6">
              <div className="w-48 h-32 rounded-lg bg-dark-elevated flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-dark-card">
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-dark-card hover:bg-dark-card-hover rounded-lg cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {imageFile ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-xs text-text-secondary mt-2">
                  Recommended: 1200x800px or similar ratio. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-dark-surface rounded-lg p-6 border border-border-muted/10">
            <h3 className="text-lg font-bold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  placeholder="Enter event name"
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  placeholder="Describe your event..."
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
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
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  placeholder="Enter location"
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-dark-surface rounded-lg p-6 border border-border-muted/10">
            <h3 className="text-lg font-bold mb-4">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formik.values.startDate}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formik.values.endDate}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tickets & Pricing */}
          <div className="bg-dark-surface rounded-lg p-6 border border-border-muted/10">
            <h3 className="text-lg font-bold mb-4">Tickets & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formik.values.totalSeats}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  min={1}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Price per Ticket ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formik.values.price}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-dark-card hover:bg-dark-card-hover rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loadingEventAction}
              className="px-6 py-3 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
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

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleConfirmSave}
          title="Save Changes"
          message={`Are you sure you want to save changes to "${formik.values.name}"? This action cannot be undone.`}
          confirmText="Save"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}
