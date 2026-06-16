"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, AlertTriangle, ArrowRight, CheckCircle2, Clock, XCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function ReservationsPage() {
  const { dbUser, reservations, cancelReservation, appLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (dbUser && !appLoading) {
      if (dbUser.role === "seller") {
        router.push("/seller");
      } else if (dbUser.role === "admin") {
        router.push("/admin");
      }
    }
  }, [dbUser, appLoading, router]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-250">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-250">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Booking Confirmed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-250">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-250">
            <UserCheck className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const handleCancel = (resId) => {
    if (confirm("Are you sure you want to cancel this reservation request?")) {
      cancelReservation(resId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Your Reservations</h1>
        <p className="text-muted-foreground text-sm">Manage and check status updates for your booking requests.</p>
      </div>

      {reservations.length > 0 ? (
        <div className="space-y-6">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-stretch transition-shadow hover:shadow-md"
            >
              {/* Car thumbnail and quick summary */}
              <div className="flex gap-4 items-center">
                <div className="relative w-28 h-20 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex-shrink-0 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2">
                  <Image
                    src={res.carImage}
                    alt={res.carName}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{res.carName}</h3>
                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {new Date(res.startDate).toLocaleDateString()} to {new Date(res.endDate).toLocaleDateString()}
                      </span>
                    </p>
                    <p>Booking ID: <span className="font-mono">{res.id}</span></p>
                  </div>
                </div>
              </div>

              {/* Status and Cancellation controls */}
              <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between items-center md:items-end gap-4 min-w-[200px]">
                <div className="text-left md:text-right">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                  {getStatusBadge(res.status)}
                </div>
                
                <div className="text-right">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Paid</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">${res.totalPrice}</span>
                  <span className="text-xxs text-muted-foreground block">for {res.totalDays} days</span>
                </div>

                {res.status === "Pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(res.id)}
                    className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-muted-foreground rounded-full flex items-center justify-center mx-auto">
            <CalendarDays className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">No reservations found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">You have not requested or booked any cars yet. Navigate to our browse catalog to begin.</p>
          </div>
          <Link href="/cars" className="inline-block">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2">
              Explore Fleet
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
