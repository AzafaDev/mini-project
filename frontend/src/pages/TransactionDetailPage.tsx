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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOpenedUploadModal, setHasOpenedUploadModal] = useState(false);
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
        color: "bg-[#ffdbcc] text-[#a44100]",
        icon: "schedule",
      },
      WAITING_CONFIRMATION: {
        label: "Waiting Confirmation",
        color: "bg-[#ffdbcc]/20 text-[#ffb695]",
        icon: "hourglass_top",
      },
      DONE: {
        label: "Confirmed",
        color: "bg-[#c0c1ff]/10 text-[#c0c1ff]",
        icon: "check_circle",
      },
      REJECTED: {
        label: "Rejected",
        color: "bg-[#ffb4ab]/10 text-[#ffb4ab]",
        icon: "cancel",
      },
      EXPIRED: {
        label: "Expired",
        color: "bg-[#666]/10 text-[#666]",
        icon: "timer_off",
      },
      CANCELED: {
        label: "Canceled",
        color: "bg-[#666]/10 text-[#666]",
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
    
    const success = await rejectTransaction(id, rejectReason);
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
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#c7c4d8]">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error || !currentTransaction) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-[#93000a]">
            receipt_long
          </span>
          <h2 className="text-2xl font-bold">Transaction not found</h2>
          <p className="text-[#c7c4d8]">{error || "Unable to load transaction"}</p>
          <Link to="/transactions" className="text-[#c0c1ff] hover:underline">
            View all transactions
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentTransaction.status);

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      <main className="pt-24 pb-32 px-6 max-w-screen-lg mx-auto">
        {/* Breadcrumb / Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[#c7c4d8] text-xs mb-4">
            <Link to="/transactions" className="hover:text-[#c0c1ff]">Transactions</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#c0c1ff]">Transaction Details</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-extrabold tracking-tighter text-[#e5e2e1]">
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
          <div className="bg-[#1c1b1b] rounded-xl p-8 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                {currentTransaction.event?.imageUrl ? (
                  <img 
                    src={currentTransaction.event.imageUrl} 
                    alt={currentTransaction.event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#666]">
                      event
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-[#e5e2e1] mb-2">
                  {currentTransaction.event?.name}
                </h2>
                <div className="flex flex-wrap gap-6 text-[#c7c4d8]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c0c1ff]">location_on</span>
                    <span>{currentTransaction.event?.location || "TBA"}</span>
                  </div>
                  {currentTransaction.event?.startDate && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#c0c1ff]">calendar_today</span>
                      <span>{formatDate(currentTransaction.event.startDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-[#1c1b1b] rounded-xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-[#e5e2e1] mb-6">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[#c7c4d8] text-sm mb-1">Transaction ID</p>
                <p className="font-mono text-[#c0c1ff]">{currentTransaction.id}</p>
              </div>
              <div>
                <p className="text-[#c7c4d8] text-sm mb-1">Ticket Type</p>
                <p className="text-[#e5e2e1]">{currentTransaction.ticket?.name}</p>
              </div>
              <div>
                <p className="text-[#c7c4d8] text-sm mb-1">Quantity</p>
                <p className="text-[#e5e2e1]">{currentTransaction.quantity} ticket(s)</p>
              </div>
              <div>
                <p className="text-[#c7c4d8] text-sm mb-1">Created At</p>
                <p className="text-[#e5e2e1]">{formatDate(currentTransaction.createdAt)}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#c7c4d8]">Subtotal</span>
                  <span className="text-[#e5e2e1]">{formatIDR(currentTransaction.totalPrice)}</span>
                </div>
                {currentTransaction.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#c7c4d8]">Discount</span>
                    <span className="text-[#ffb4ab]">-{formatIDR(currentTransaction.discount)}</span>
                  </div>
                )}
                {currentTransaction.pointsUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#c7c4d8]">Points Used ({currentTransaction.pointsUsed})</span>
                    <span className="text-[#c0c1ff]">-{formatIDR(currentTransaction.pointsUsed * 10)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="font-bold text-[#e5e2e1]">Total Paid</span>
                  <span className="font-bold text-xl text-[#e5e2e1]">{formatIDR(currentTransaction.finalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          {currentTransaction.paymentProof && (
            <div className="bg-[#1c1b1b] rounded-xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-[#e5e2e1] mb-6">Payment Proof</h3>
              <div className="bg-[#0e0e0e] rounded-lg p-4">
                <img 
                  src={currentTransaction.paymentProof} 
                  alt="Payment Proof"
                  className="max-w-md w-full rounded-lg"
                />
              </div>
              <p className="text-[#c7c4d8] text-sm mt-4">
                Uploaded at: {currentTransaction.paymentProofUploadedAt ? formatDate(currentTransaction.paymentProofUploadedAt) : "N/A"}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {currentTransaction.rejectionReason && (
            <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-xl p-8">
              <h3 className="text-lg font-bold text-[#ffb4ab] mb-4">Rejection Reason</h3>
              <p className="text-[#c7c4d8]">{currentTransaction.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-[#1c1b1b] rounded-xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-[#e5e2e1] mb-6">Actions</h3>
            
            {/* User Actions */}
            <div className="space-y-4">
                {currentTransaction.status === "WAITING_PAYMENT" && (
                  <>
                    {countdown && countdown !== "Expired" && (
                      <div className="flex items-center gap-3 bg-[#ffdbcc]/10 border border-[#ffb695]/30 p-4 rounded-lg">
                        <span className="material-symbols-outlined text-[#ffb695]">timer</span>
                        <span className="text-[#ffb695]">Payment expires in {countdown}</span>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex-1 py-3 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold rounded-lg hover:opacity-90"
                      >
                        Upload Payment Proof
                      </button>
                      <button
                        onClick={() => setIsCancelModalOpen(true)}
                        className="px-6 py-3 bg-[#353534] text-[#e5e2e1] font-bold rounded-lg hover:bg-[#4a4a4a]"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
                {currentTransaction.status === "WAITING_CONFIRMATION" && (
                  <div className="flex items-center gap-3 bg-[#ffdbcc]/10 border border-[#ffb695]/30 p-4 rounded-lg">
                    <span className="material-symbols-outlined text-[#ffb695]">hourglass_top</span>
                    <span className="text-[#ffb695]">Waiting for organizer confirmation</span>
                  </div>
                )}
                {currentTransaction.status === "DONE" && (
                  <div className="flex items-center gap-3 bg-[#c0c1ff]/10 border border-[#c0c1ff]/30 p-4 rounded-lg">
                    <span className="material-symbols-outlined text-[#c0c1ff]">check_circle</span>
                    <span className="text-[#c0c1ff]">Your ticket has been confirmed!</span>
                  </div>
                )}
                {(currentTransaction.status === "CANCELED" || currentTransaction.status === "REJECTED" || currentTransaction.status === "EXPIRED") && (
                  <div className="flex items-center gap-3 bg-[#666]/10 border border-[#666]/30 p-4 rounded-lg">
                    <span className="material-symbols-outlined text-[#666]">{statusConfig.icon}</span>
                    <span className="text-[#666]">This transaction is no longer active</span>
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
          <div className="relative bg-[#1c1b1b] p-6 rounded-xl border border-white/10 w-full max-w-md">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-[#c7c4d8] hover:text-[#e5e2e1]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-6">Upload Payment Proof</h3>
            
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
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-[#c0c1ff] transition-colors"
              >
                {selectedFile ? (
                  <div>
                    <span className="material-symbols-outlined text-4xl text-[#c0c1ff]">check_circle</span>
                    <p className="text-[#e5e2e1] mt-2">{selectedFile.name}</p>
                    <p className="text-[#c7c4d8] text-sm">Click to change</p>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined text-4xl text-[#c7c4d8]">upload_file</span>
                    <p className="text-[#e5e2e1] mt-2">Click to upload payment proof</p>
                    <p className="text-[#c7c4d8] text-sm">Max 5MB (JPEG, PNG)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleUploadProof}
              disabled={!selectedFile || isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="relative bg-[#1c1b1b] p-6 rounded-xl border border-white/10 w-full max-w-md">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 text-[#c7c4d8] hover:text-[#e5e2e1]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-4">Cancel Transaction?</h3>
            <p className="text-[#c7c4d8] mb-6">
              Are you sure you want to cancel this transaction? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 bg-[#353534] text-[#e5e2e1] font-bold rounded-lg hover:bg-[#4a4a4a]"
              >
                Back
              </button>
              <button
                onClick={handleCancelTransaction}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#93000a] text-[#e5e2e1] font-bold rounded-lg hover:bg-[#b30000] disabled:opacity-50"
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
          <div className="relative bg-[#1c1b1b] p-6 rounded-xl border border-white/10 w-full max-w-md">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="absolute top-4 right-4 text-[#c7c4d8] hover:text-[#e5e2e1]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-4">Reject Transaction</h3>
            <p className="text-[#c7c4d8] mb-4">
              Please provide a reason for rejecting this transaction:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 bg-[#0e0e0e] border border-white/10 rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#c7c4d8]/50 focus:outline-none focus:border-[#c0c1ff] resize-none"
            />
            <button
              onClick={handleRejectTransaction}
              disabled={isSubmitting || !rejectReason.trim()}
              className="w-full mt-4 py-3 bg-[#93000a] text-[#e5e2e1] font-bold rounded-lg hover:bg-[#b30000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : "Reject Transaction"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailPage;