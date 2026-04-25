import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import { useCountdown } from "../hooks/useCountdown";
import { formatIDR, formatDate } from "../lib/formatters";
import { type TransactionStatus } from "../services/api";

const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    currentTransaction, 
    fetchTransactionById, 
    uploadPaymentProof,
    cancelTransaction,
    acceptTransaction,
    rejectTransaction,
    loading,
    error,
    clearCurrentTransaction 
  } = useTransactionStore();
  
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  // State untuk modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
   const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [hasOpenedUploadModal, setHasOpenedUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate countdown
  const getTimeRemaining = () => {
    if (!currentTransaction?.expiresAt) return null;
    const diff = new Date(currentTransaction.expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTransactionById(id);
    }
    return () => {
      clearCurrentTransaction();
    };
  }, [id]);

  // Auto-open upload modal for WAITING_PAYMENT transactions without payment proof
  useEffect(() => {
    if (
      currentTransaction?.status === "WAITING_PAYMENT" &&
      !currentTransaction.paymentProof &&
      !hasOpenedUploadModal
    ) {
      setHasOpenedUploadModal(true);
      setIsUploadModalOpen(true);
    }
  }, [currentTransaction, hasOpenedUploadModal]);

  useEffect(() => {
    if (currentTransaction?.status === "WAITING_PAYMENT") {
      const timer = setInterval(() => {
        setCountdown(getTimeRemaining());
      }, 1000);
      setCountdown(getTimeRemaining());
      return () => clearInterval(timer);
    }
  }, [currentTransaction?.status, currentTransaction?.expiresAt]);

  const getStatusConfig = (status: TransactionStatus) => {
    const configs = {
      WAITING_PAYMENT: {
        label: "Waiting Payment",
        color: "bg-warning-light text-warning-dark",
        icon: "schedule",
      },
      WAITING_CONFIRMATION: {
        label: "Waiting Confirmation",
        color: "bg-warning-light/20 text-warning",
        icon: "hourglass_top",
      },
      DONE: {
        label: "Confirmed",
        color: "bg-primary/10 text-primary",
        icon: "check_circle",
      },
      REJECTED: {
        label: "Rejected",
        color: "bg-error-light/10 text-error-light",
        icon: "cancel",
      },
      EXPIRED: {
        label: "Expired",
        color: "bg-text-secondary/10 text-text-secondary",
        icon: "timer_off",
      },
      CANCELED: {
        label: "Canceled",
        color: "bg-text-secondary/10 text-text-secondary",
        icon: "not_interested",
      },
    };
    return configs[status] || configs.WAITING_PAYMENT;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("error", "File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        addToast("error", "Please select an image file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !id) return;
    setIsSubmitting(true);
    
    const success = await uploadPaymentProof(id, selectedFile);
    setIsSubmitting(false);
    
    if (success) {
      addToast("success", "Payment proof uploaded successfully!");
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } else {
      addToast("error", "Failed to upload payment proof");
    }
  };

  const handleCancelTransaction = async () => {
    if (!id) return;
    setIsSubmitting(true);
    
    const success = await cancelTransaction(id);
    setIsSubmitting(false);
    
    if (success) {
      addToast("success", "Transaction canceled");
      setIsCancelModalOpen(false);
    } else {
      addToast("error", "Failed to cancel transaction");
    }
  };

  const handleAcceptTransaction = async () => {
    if (!id) return;
    setIsSubmitting(true);
    
    const success = await acceptTransaction(id);
    setIsSubmitting(false);
    
    if (success) {
      addToast("success", "Transaction approved!");
    } else {
      addToast("error", "Failed to approve transaction");
    }
  };

   const handleRejectTransaction = async () => {
     if (!id) return;
     setIsSubmitting(true);
     
     const success = await rejectTransaction(id);
     setIsSubmitting(false);
     
     if (success) {
       addToast("success", "Transaction rejected");
       setIsRejectModalOpen(false);
     } else {
       addToast("error", "Failed to reject transaction");
     }
   };

  if (loading && !currentTransaction) {
    return (
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error || !currentTransaction) {
    return (
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-error">
            receipt_long
          </span>
          <h2 className="text-2xl font-bold">Transaction not found</h2>
          <p className="text-text-muted">{error || "Unable to load transaction"}</p>
          <Link to="/transactions" className="text-primary hover:underline">
            View all transactions
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentTransaction.status);

  return (
    <div className="bg-dark text-text-light min-h-screen font-sans selection:bg-primary/30">
      <main className="pt-24 pb-32 px-6 max-w-screen-lg mx-auto">
        {/* Breadcrumb / Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
            <Link to="/my-transactions" className="hover:text-primary">Transactions</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">Transaction Details</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-extrabold tracking-tighter text-text-light">
              Transaction Details
            </h1>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.color}`}>
              <span className="material-symbols-outlined">{statusConfig.icon}</span>
              {statusConfig.label}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Event Info Card */}
          <div className="bg-dark-surface rounded-xl p-8 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-dark-elevated flex-shrink-0">
                {currentTransaction.event?.imageUrl ? (
                  <img 
                    src={currentTransaction.event.imageUrl} 
                    alt={currentTransaction.event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-text-secondary">
                      event
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <Link 
                  to={`/events/${currentTransaction.event?.id}`}
                  className="text-2xl font-bold text-text-light mb-2 hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  {currentTransaction.event?.name}
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                </Link>
                <div className="flex flex-wrap gap-6 text-text-muted">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <span>{currentTransaction.event?.location || "TBA"}</span>
                  </div>
                  {currentTransaction.event?.startDate && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">calendar_today</span>
                      <span>{formatDate(currentTransaction.event.startDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
           </div>

          {/* Organizer Info Card */}
          {currentTransaction.event?.organizer && (
            <div className="bg-dark-surface rounded-xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-text-light mb-6">Organizer</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-elevated flex-shrink-0">
                  {currentTransaction.event.organizer.profilePicture ? (
                    <img
                      src={currentTransaction.event.organizer.profilePicture}
                      alt={currentTransaction.event.organizer.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-text-secondary">
                        person
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    to={`/organizer/${currentTransaction.event.organizer.id}`}
                    className="text-xl font-bold text-text-light hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    {currentTransaction.event.organizer.fullName}
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                  </Link>
                  <p className="text-text-muted text-sm mt-1">Event Organizer</p>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="bg-dark-surface rounded-xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-text-light mb-6">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-text-muted text-sm mb-1">Transaction ID</p>
                <p className="font-mono text-primary">{currentTransaction.id}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Quantity</p>
                <p className="text-text-light">{currentTransaction.quantity} ticket(s)</p>
              </div>
              <div>
                <p className="text-text-muted text-sm mb-1">Created At</p>
                <p className="text-text-light">{formatDate(currentTransaction.createdAt)}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-text-light">{formatIDR(currentTransaction.totalPrice)}</span>
                </div>
                {currentTransaction.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Discount</span>
                    <span className="text-error-light">-{formatIDR(currentTransaction.discount)}</span>
                  </div>
                )}
                 {currentTransaction.pointsUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Points Used ({currentTransaction.pointsUsed})</span>
                    <span className="text-primary">-{formatIDR(currentTransaction.pointsUsed)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="font-bold text-text-light">Total Paid</span>
                  <span className="font-bold text-xl text-text-light">{formatIDR(currentTransaction.finalPrice)}</span>
                </div>
              </div>
            </div>
           </div>

           {/* Actions */}
          <div className="bg-dark-surface rounded-xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-text-light mb-6">Actions</h3>
            
            {/* User Actions */}
            <div className="space-y-4">
                {currentTransaction.status === "WAITING_PAYMENT" && (
                  <>
                    {countdown && countdown !== "Expired" && (
                      <div className="flex items-center gap-3 bg-warning-light/10 border border-warning/30 p-4 rounded-lg">
                        <span className="material-symbols-outlined text-warning">timer</span>
                        <span className="text-warning">Payment expires in {countdown}</span>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-primary-dark font-bold rounded-lg hover:opacity-90"
                      >
                        Upload Payment Proof
                      </button>
                      <button
                        onClick={() => setIsCancelModalOpen(true)}
                        className="px-6 py-3 bg-dark-card text-text-light font-bold rounded-lg hover:bg-[#4a4a4a]"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
                {currentTransaction.status === "WAITING_CONFIRMATION" && (
                  <div className="flex items-center gap-3 bg-warning-light/10 border border-warning/30 p-4 rounded-lg">
                    <span className="material-symbols-outlined text-warning">hourglass_top</span>
                    <span className="text-warning">Waiting for organizer confirmation</span>
                  </div>
                )}
                {currentTransaction.status === "DONE" && (
                  <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 p-4 rounded-lg">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <span className="text-primary">Your ticket has been confirmed!</span>
                  </div>
                )}
                {(currentTransaction.status === "CANCELED" || currentTransaction.status === "REJECTED" || currentTransaction.status === "EXPIRED") && (
                  <div className="flex items-center gap-3 bg-text-secondary/10 border border-text-secondary/30 p-4 rounded-lg">
                    <span className="material-symbols-outlined text-text-secondary">{statusConfig.icon}</span>
                    <span className="text-text-secondary">This transaction is no longer active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

      {/* Upload Payment Proof Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)} />
          <div className="relative bg-dark-surface p-6 rounded-xl border border-white/10 w-full max-w-md">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-light"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-text-light mb-6">Upload Payment Proof</h3>
            
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {selectedFile ? (
                  <div>
                    <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
                    <p className="text-text-light mt-2">{selectedFile.name}</p>
                    <p className="text-text-muted text-sm">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined text-4xl text-text-muted">upload_file</span>
                    <p className="text-text-light mt-2">Click to upload payment proof</p>
                    <p className="text-text-muted text-sm">Max 5MB (JPEG, PNG)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleUploadProof}
              disabled={!selectedFile || isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-dark font-bold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Cancel Transaction Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsCancelModalOpen(false)} />
          <div className="relative bg-dark-surface p-6 rounded-xl border border-white/10 w-full max-w-md">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-light"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-text-light mb-4">Cancel Transaction?</h3>
            <p className="text-text-muted mb-6">
              Are you sure you want to cancel this transaction? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 bg-dark-card text-text-light font-bold rounded-lg hover:bg-[#4a4a4a]"
              >
                Back
              </button>
              <button
                onClick={handleCancelTransaction}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-error text-text-light font-bold rounded-lg hover:bg-error-hover disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : "Cancel Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Transaction Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)} />
          <div className="relative bg-dark-surface p-6 rounded-xl border border-white/10 w-full max-w-md">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-light"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-text-light mb-4">Reject Transaction?</h3>
            <p className="text-text-muted mb-6">
              Are you sure you want to reject this transaction? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-3 bg-dark-card text-text-light font-bold rounded-lg hover:bg-[#4a4a4a]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectTransaction}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-error text-text-light font-bold rounded-lg hover:bg-error-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailPage;