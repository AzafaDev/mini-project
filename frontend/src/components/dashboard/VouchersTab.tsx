import { useEffect, useState } from "react";
import { useEventStore } from "../../stores/useEventStore";
import { useToastStore } from "../../stores/useToastStore";
import { formatDate } from "../../lib/formatters";
import type { VoucherWithEvent } from "../../services/api";

export function VouchersTab() {
  // FIX: Use Zustand selectors to prevent unnecessary re-renders
  const myEvents = useEventStore((s) => s.myEvents);
  const myVouchers = useEventStore((s) => s.myVouchers);
  const loadingMyEvents = useEventStore((s) => s.loadingMyEvents);
  const loadingMyVouchers = useEventStore((s) => s.loadingMyVouchers);
  const loadingEventAction = useEventStore((s) => s.loadingEventAction);
  const fetchMyVouchers = useEventStore((s) => s.fetchMyVouchers);
  const createVoucher = useEventStore((s) => s.createVoucher);
  const updateVoucher = useEventStore((s) => s.updateVoucher);
  const deleteVoucher = useEventStore((s) => s.deleteVoucher);
  const error = useEventStore((s) => s.error);
  const clearError = useEventStore((s) => s.clearError);

  const { addToast } = useToastStore();

  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherWithEvent | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    eventId: "",
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: 10,
    startDate: "",
    endDate: "",
  });

// Fetch data if not already loaded
  useEffect(() => {
    fetchMyVouchers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "discountValue" ? Number(value) : value,
    }));
  };

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      eventId: myEvents[0]?.id || "",
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      startDate: "",
      endDate: "",
    });
    setLocalError(null);
    setShowModal(true);
  };

  const openEditModal = (voucher: VoucherWithEvent) => {
    setEditingVoucher(voucher);
    setFormData({
      eventId: voucher.event.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      startDate: voucher.startDate.slice(0, 16),
      endDate: voucher.endDate.slice(0, 16),
    });
    setLocalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.eventId) {
      setLocalError("Please select an event");
      return;
    }
    if (!formData.code.trim()) {
      setLocalError("Voucher code is required");
      return;
    }
    if (formData.discountValue <= 0) {
      setLocalError("Discount value must be greater than 0");
      return;
    }
    if (formData.discountType === "PERCENTAGE" && formData.discountValue > 100) {
      setLocalError("Percentage discount cannot exceed 100%");
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

    try {
      let success = false;
      if (editingVoucher) {
        const updateData = {
          code: formData.code,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        success = await updateVoucher(editingVoucher.id, updateData);
        if (success) {
          addToast("success", "Voucher updated successfully!");
        }
      } else {
        success = await createVoucher(formData);
        if (success) {
          addToast("success", "Voucher created successfully!");
        }
      }

      if (success) {
        setShowModal(false);
      } else {
        setLocalError(error || "Failed to save voucher");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save voucher";
      setLocalError(errorMessage);
    }
  };

  const handleDelete = async (voucher: VoucherWithEvent) => {
    if (!confirm(`Are you sure you want to delete voucher "${voucher.code}"?`)) {
      return;
    }

    const success = await deleteVoucher(voucher.id);
    if (success) {
      addToast("success", "Voucher deleted successfully!");
    } else {
      addToast("error", error || "Failed to delete voucher");
    }
  };

  const handleToggleActive = async (voucher: VoucherWithEvent) => {
    const success = await updateVoucher(voucher.id, { isActive: !voucher.isActive });
    if (success) {
      addToast("success", `Voucher ${voucher.isActive ? "deactivated" : "activated"}!`);
    } else {
      addToast("error", error || "Failed to update voucher status");
    }
  };

  const formatDiscount = (voucher: VoucherWithEvent) => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    }
    return `$${voucher.discountValue}`;
  };

  if (loadingMyEvents || loadingMyVouchers) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-dark-surface rounded w-48 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-dark-surface rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Vouchers</h2>
        <button
          onClick={openCreateModal}
          disabled={myEvents.length === 0}
          className="bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Create Voucher
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
          <p className="text-red-400">{error}</p>
          <button onClick={clearError} className="text-red-400 hover:text-red-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Vouchers List */}
      {myVouchers.length > 0 ? (
        <div className="bg-dark-surface rounded-lg border border-border-muted/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border-muted/10">
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                  Code
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                  Event
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                  Discount
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                  Valid Period
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-text-muted uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {myVouchers.map((voucher) => (
                <tr
                  key={voucher.id}
                  className="border-b border-border-muted/10 hover:bg-dark-elevated transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-primary">
                      {voucher.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{voucher.event.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold">{formatDiscount(voucher)}</span>
                    {voucher.discountType === "PERCENTAGE" && (
                      <span className="text-xs text-text-secondary ml-1">off</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-muted">
                      {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(voucher)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${
                        voucher.isActive
                          ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20"
                      }`}
                    >
                      {voucher.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(voucher)}
                        className="p-2 text-text-muted hover:text-white hover:bg-dark-card rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(voucher)}
                        className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-dark-surface rounded-lg p-12 text-center border border-border-muted/10">
          <span className="material-symbols-outlined text-8xl text-dark-card mb-4">
            local_offer
          </span>
          <p className="text-xl text-text-muted mb-2">No vouchers yet</p>
          <p className="text-text-secondary mb-6">
            {myEvents.length === 0
              ? "Create an event first, then add vouchers"
              : "Create vouchers to offer discounts to your customers"}
          </p>
          {myEvents.length > 0 && (
            <button
              onClick={openCreateModal}
              className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create Voucher
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface rounded-lg w-full max-w-md border border-border-muted/10">
            <div className="flex items-center justify-between p-6 border-b border-border-muted/10">
              <h2 className="text-lg font-bold">
                {editingVoucher ? "Edit Voucher" : "Create Voucher"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {localError && (
              <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{localError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingVoucher && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Event *
                  </label>
                  <select
                    name="eventId"
                    value={formData.eventId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Select event</option>
                    {myEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., SUMMER20"
                  className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    min={1}
                    max={formData.discountType === "PERCENTAGE" ? 100 : undefined}
                    className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-elevated border border-border-muted/10 rounded-lg focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-dark-card hover:bg-dark-card-hover rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingEventAction}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  {loadingEventAction ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        sync
                      </span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {editingVoucher ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}