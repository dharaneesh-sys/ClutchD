"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useServiceStore } from "../../../store/serviceStore";
import { useAuthStore } from "../../../store/authStore";
import { useTrackingStore } from "../../../store/trackingStore";
import { ServiceRequestPanel } from "../../../components/dashboard/ServiceRequestPanel";
import { ServiceStatusTracker } from "../../../components/dashboard/ServiceStatusTracker";
import { PaymentModal } from "../../../components/dashboard/PaymentModal";
import { ReviewModal } from "../../../components/dashboard/ReviewModal";
import { LogOut, User } from "lucide-react";
import { SERVICE_STATUS } from "../../../lib/constants";

// Dynamically import MapView to disable SSR since Leaflet requires window
const MapView = dynamic(
  () => import("../../../components/dashboard/MapView"),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#0a2a1a] rounded-2xl animate-pulse" />
  }
);

export default function CustomerDashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { activeRequest, createRequest, cancelRequest } = useServiceStore();
  // Get stable references via getState to avoid useEffect re-runs
  const updateRequestStatus = useCallback(
    (...args) => useServiceStore.getState().updateRequestStatus(...args),
    []
  );
  const completeRequest = useCallback(
    (...args) => useServiceStore.getState().completeRequest(...args),
    []
  );
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  // Capture mechanic info before request is cleared
  const completedMechanicRef = useRef(null);

  // Auth guard — redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
    }
  }, [isAuthenticated]);
  
  // Simulation of real-time status updates
  useEffect(() => {
    if (!activeRequest) return;
    // #region agent log
    fetch('http://127.0.0.1:7742/ingest/6df102a3-018b-4c90-a04c-3daa6827d6d1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab7357'},body:JSON.stringify({sessionId:'ab7357',runId:'pre-fix',hypothesisId:'H1',location:'src/app/dashboard/customer/page.js:52',message:'Status effect entered',data:{requestId:activeRequest?.id,status:activeRequest?.status,hasMechanic:!!activeRequest?.mechanic},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    let timer;
    if (activeRequest.status === SERVICE_STATUS.SEARCHING) {
      timer = setTimeout(() => {
        updateRequestStatus(SERVICE_STATUS.ASSIGNED, {
          id: "m1",
          name: "Vijay Kumar",
          rating: 4.8,
          distance: "2.4 km"
        });
      }, 1500);
    } 
    else if (activeRequest.status === SERVICE_STATUS.ASSIGNED) {
      timer = setTimeout(() => {
        updateRequestStatus(SERVICE_STATUS.EN_ROUTE);
      }, 1500);
    }
    else if (activeRequest.status === SERVICE_STATUS.EN_ROUTE) {
      timer = setTimeout(() => {
        updateRequestStatus(SERVICE_STATUS.IN_PROGRESS);
      }, 2000);
    }
    else if (activeRequest.status === SERVICE_STATUS.IN_PROGRESS) {
      timer = setTimeout(() => {
        updateRequestStatus(SERVICE_STATUS.COMPLETED);
      }, 2000);
    }
    
    return () => clearTimeout(timer);
  }, [activeRequest?.status, updateRequestStatus]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#09090b]"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const handleRequestSubmit = async (data) => {
    const location = useTrackingStore.getState().userLocation;
    // #region agent log
    fetch('http://127.0.0.1:7742/ingest/6df102a3-018b-4c90-a04c-3daa6827d6d1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab7357'},body:JSON.stringify({sessionId:'ab7357',runId:'pre-fix',hypothesisId:'H2',location:'src/app/dashboard/customer/page.js:90',message:'Submitting request from customer dashboard',data:{hasLocation:Array.isArray(location),locationLength:Array.isArray(location)?location.length:null,issueTag:data?.issueTag,requestType:data?.requestType},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    await createRequest({
      ...data,
      customerLat: location[0],
      customerLng: location[1],
    });
  };

  const handlePaymentInitiate = () => {
    // Capture mechanic info before payment completes and clears the request
    completedMechanicRef.current = activeRequest?.mechanic?.name || "the professional";
    // #region agent log
    fetch('http://127.0.0.1:7742/ingest/6df102a3-018b-4c90-a04c-3daa6827d6d1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab7357'},body:JSON.stringify({sessionId:'ab7357',runId:'pre-fix',hypothesisId:'H3',location:'src/app/dashboard/customer/page.js:101',message:'Payment initiated for completed request',data:{requestId:activeRequest?.id,status:activeRequest?.status,mechanicName:activeRequest?.mechanic?.name??null,refValue:completedMechanicRef.current},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (paymentDetails) => {
    // #region agent log
    fetch('http://127.0.0.1:7742/ingest/6df102a3-018b-4c90-a04c-3daa6827d6d1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab7357'},body:JSON.stringify({sessionId:'ab7357',runId:'pre-fix',hypothesisId:'H4',location:'src/app/dashboard/customer/page.js:107',message:'Payment success handler invoked',data:{requestId:activeRequest?.id,statusBeforeComplete:activeRequest?.status,paymentMethod:paymentDetails?.method,amount:paymentDetails?.amount},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setIsPaymentOpen(false);
    completeRequest(paymentDetails);
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = (reviewData) => {
    // #region agent log
    fetch('http://127.0.0.1:7742/ingest/6df102a3-018b-4c90-a04c-3daa6827d6d1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab7357'},body:JSON.stringify({sessionId:'ab7357',runId:'pre-fix',hypothesisId:'H5',location:'src/app/dashboard/customer/page.js:114',message:'Review submit handler invoked',data:{rating:reviewData?.rating??null,commentLength:reviewData?.comment?.length??0,providerRefBeforeClear:completedMechanicRef.current},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.log("Review submitted", reviewData);
    setIsReviewOpen(false);
    completedMechanicRef.current = null;
  };

  const handleCancelRequest = () => {
    cancelRequest();
  };

  return (
    <div className="h-screen w-full flex flex-col p-4 sm:p-6 pb-0 overflow-hidden relative z-10 gap-6">
      
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tighter">M</div>
           <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">ClutchD</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-white">{user?.name || "Customer"}</span>
            <span className="text-[10px] text-emerald-100/60 uppercase tracking-wider">Customer Mode</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
            <User size={18} />
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 flex items-center justify-center text-white/70 hover:text-red-400 transition-colors ml-2"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-6">
        
        {/* Left Side: Map */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-2xl overflow-hidden relative shadow-2xl h-full min-h-[400px]">
           <MapView />
           
           {/* Floating Map Label */}
           <div className="absolute top-4 left-4 z-[400] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             Live Area Map
           </div>
        </div>
        
        {/* Right Side: Action Panel */}
        <div className="lg:col-span-5 xl:col-span-4 h-full flex flex-col min-h-[500px] lg:min-h-0 overflow-y-auto custom-scrollbar pr-1 lg:pr-0">
          {!activeRequest ? (
            <ServiceRequestPanel onSubmit={handleRequestSubmit} />
          ) : (
            <ServiceStatusTracker 
              request={activeRequest} 
              onComplete={handlePaymentInitiate}
              onCancel={handleCancelRequest}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        amount={activeRequest?.priceEstimate?.min || 1200}
        onSuccess={handlePaymentSuccess}
      />
      
      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        providerName={completedMechanicRef.current}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
