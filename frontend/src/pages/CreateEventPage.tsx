import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useEventStore } from "../stores/useEventStore";
import { useToastStore } from "../stores/useToastStore";
import { createEventSchema } from "../validation/eventSchemas";

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

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { createEvent, loadingEventAction, error } = useEventStore();
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
    validationSchema: createEventSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      setLocalError(null);
      try {
        const result = await createEvent({
          ...values,
          imageFile: imageFile || undefined,
          tickets: useCustomTickets && tickets.length > 0 ? tickets : undefined,
        });

        if (result) {
          addToast("success", "Event created successfully!");
          navigate("/dashboard?tab=events");
        } else {
          setLocalError(error || "Failed to create event");
        }
      } catch (err: any) {
        setLocalError(err.response?.data?.message || "Failed to create event");
      }
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [useCustomTickets, setUseCustomTickets] = useState(false);
  const [tickets, setTickets] = useState<
    {
      type: "GENERAL" | "VIP";
      price: number;
      quantity: number;
    }[]
  >([]);



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

  // Validate custom tickets before submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    // Validate custom tickets if enabled
    if (useCustomTickets) {
      if (tickets.length === 0) {
        setLocalError("Please add at least one ticket type");
        return;
      }
      for (const ticket of tickets) {
        if (ticket.price < 0) {
          setLocalError("Ticket price cannot be negative");
          return;
        }
        if (ticket.quantity < 1) {
          setLocalError("Ticket quantity must be at least 1");
          return;
        }
      }
    }

    // Validate date range
    if (formik.values.startDate && formik.values.endDate) {
      if (new Date(formik.values.startDate) >= new Date(formik.values.endDate)) {
        setLocalError("End date must be after start date");
        return;
      }
    }

    formik.handleSubmit();
  };

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
            <h1 className="text-2xl font-bold">Create New Event</h1>
            <p className="text-sm text-[#C7C4D8]">
              Fill in the details to create your event
            </p>
          </div>
        </div>

        {/* Error Display */}
        {(localError || error) && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <p className="text-red-400">{localError || error}</p>
            <button
              onClick={() => setLocalError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
            <h3 className="text-lg font-bold mb-4">Event Image</h3>
            <div className="flex items-start gap-6">
              <div className="w-48 h-32 rounded-lg bg-[#2A2A2A] flex items-center justify-center overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
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
                  <span className="material-symbols-outlined text-[18px]">
                    upload
                  </span>
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
                   value={formik.values.name}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   placeholder="Enter event name"
                   className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors ${
                     formik.touched.name && formik.errors.name
                       ? "border-red-500/50 focus:border-red-500/50"
                       : "border-[#464555]/10 focus:border-[#4B4DD8]"
                   }`}
                 />
                 {formik.touched.name && formik.errors.name && (
                   <p className="text-red-400 text-xs mt-1">{formik.errors.name}</p>
                 )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Description *
                </label>
                <textarea
                   name="description"
                   value={formik.values.description}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   placeholder="Describe your event..."
                   rows={4}
                   className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors resize-none ${
                     formik.touched.description && formik.errors.description
                       ? "border-red-500/50 focus:border-red-500/50"
                       : "border-[#464555]/10 focus:border-[#4B4DD8]"
                   }`}
                 />
                 {formik.touched.description && formik.errors.description && (
                   <p className="text-red-400 text-xs mt-1">{formik.errors.description}</p>
                 )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Category *
                </label>
                <select
                   name="category"
                   value={formik.values.category}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors ${
                     formik.touched.category && formik.errors.category
                       ? "border-red-500/50 focus:border-red-500/50"
                       : "border-[#464555]/10 focus:border-[#4B4DD8]"
                   }`}
                >
                  <option value="">Select category</option>
                   {CATEGORIES.map((cat) => (
                     <option key={cat} value={cat}>
                       {cat}
                     </option>
                   ))}
                 </select>
                 {formik.touched.category && formik.errors.category && (
                   <p className="text-red-400 text-xs mt-1">{formik.errors.category}</p>
                 )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                  Location *
                </label>
                <input
                  type="text"
                   name="location"
                   value={formik.values.location}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   placeholder="Enter location"
                   className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors ${
                     formik.touched.location && formik.errors.location
                       ? "border-red-500/50 focus:border-red-500/50"
                       : "border-[#464555]/10 focus:border-[#4B4DD8]"
                   }`}
                 />
                 {formik.touched.location && formik.errors.location && (
                   <p className="text-red-400 text-xs mt-1">{formik.errors.location}</p>
                 )}
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
                   value={formik.values.startDate}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors ${
                     formik.touched.startDate && formik.errors.startDate
                       ? "border-red-500/50 focus:border-red-500/50"
                       : "border-[#464555]/10 focus:border-[#4B4DD8]"
                   }`}
                 />
                 {formik.touched.startDate && formik.errors.startDate && (
                   <p className="text-red-400 text-xs mt-1">{formik.errors.startDate}</p>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                   End Date & Time *
                 </label>
                 <input
                   type="datetime-local"
                   name="endDate"
                   value={formik.values.endDate}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors ${
                     formik.touched.endDate && formik.errors.endDate
                       ? "border-red-500/50 focus:border-red-500/50"
                       : "border-[#464555]/10 focus:border-[#4B4DD8]"
                   }`}
                 />
                 {formik.touched.endDate && formik.errors.endDate && (
                   <p className="text-red-400 text-xs mt-1">{formik.errors.endDate}</p>
                 )}
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
                   value={formik.values.totalSeats}
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   min={1}
                   placeholder="100"
                   disabled={useCustomTickets}
                   className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
                     formik.touched.totalSeats && formik.errors.totalSeats
                       ? "border-red-500/50 focus:border-red-500/50"
                       : "border-[#464555]/10 focus:border-[#4B4DD8]"
                   }`}
                 />
                 {formik.touched.totalSeats && formik.errors.totalSeats && (
                   <p className="text-red-400 text-xs mt-1">{formik.errors.totalSeats}</p>
                 )}
               </div>

               {!useCustomTickets && (
                 <div>
                   <label className="block text-sm font-medium text-[#C7C4D8] mb-2">
                     Price per Ticket ($) *
                   </label>
                   <input
                     type="number"
                     name="price"
                     value={formik.values.price}
                     onChange={formik.handleChange}
                     onBlur={formik.handleBlur}
                     min={0}
                     step={0.01}
                     placeholder="0.00"
                     className={`w-full px-4 py-3 bg-[#2A2A2A] border rounded-lg focus:outline-none transition-colors ${
                       formik.touched.price && formik.errors.price
                         ? "border-red-500/50 focus:border-red-500/50"
                         : "border-[#464555]/10 focus:border-[#4B4DD8]"
                     }`}
                   />
                   {formik.touched.price && formik.errors.price && (
                     <p className="text-red-400 text-xs mt-1">{formik.errors.price}</p>
                   )}
                 </div>
               )}
            </div>

            {/* Custom Ticket Types Toggle */}
            <div className="mt-6 pt-6 border-t border-[#464555]/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomTickets}
                  onChange={(e) => {
                    setUseCustomTickets(e.target.checked);
                    if (!e.target.checked) {
                      setTickets([]);
                    }
                  }}
                  className="w-5 h-5 rounded border-[#464555] bg-[#2A2A2A] text-[#4B4DD8] focus:ring-[#4B4DD8] focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-[#C7C4D8]">
                  Create custom ticket types (e.g., VIP, General)
                </span>
              </label>
            </div>

            {/* Custom Ticket Types Form */}
            {useCustomTickets && (
              <div className="mt-4 space-y-4">
                {tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-end gap-3 p-4 bg-[#2A2A2A] rounded-lg"
                  >
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs text-[#C7C4D8] mb-1">
                        Type
                      </label>
                      <select
                        value={ticket.type}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].type = e.target.value as
                            | "GENERAL"
                            | "VIP";
                          setTickets(newTickets);
                        }}
                        className="w-full px-3 py-2 bg-[#353534] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8]"
                      >
                        <option value="GENERAL">GENERAL</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs text-[#C7C4D8] mb-1">
                        Price (IDR)
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].price = Number(e.target.value);
                          setTickets(newTickets);
                        }}
                        min={0}
                        placeholder="50000"
                        className="w-full px-3 py-2 bg-[#353534] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8]"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs text-[#C7C4D8] mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => {
                          const newTickets = [...tickets];
                          newTickets[index].quantity = Number(e.target.value);
                          setTickets(newTickets);
                        }}
                        min={1}
                        placeholder="100"
                        className="w-full px-3 py-2 bg-[#353534] border border-[#464555]/10 rounded-lg focus:outline-none focus:border-[#4B4DD8]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTickets(tickets.filter((_, i) => i !== index))
                      }
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setTickets([
                      ...tickets,
                      { type: "GENERAL", price: 0, quantity: 100 },
                    ])
                  }
                  disabled={tickets.length >= 2}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#4B4DD8] hover:bg-[#4B4DD8]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Ticket Type
                </button>
              </div>
            )}
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
                  <span className="material-symbols-outlined animate-spin">
                    sync
                  </span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">add</span>
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
