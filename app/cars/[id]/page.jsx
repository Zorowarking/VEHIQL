"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Star, Heart, Fuel, Settings2, Users, ArrowLeft, ShieldCheck, Check, CalendarDays, Coins } from "lucide-react";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded: authLoaded } = useUser();
  const { cars, toggleSaveCar, isCarSaved, addReservation } = useApp();

  const carId = params.id;
  const car = cars.find((c) => String(c.id) === String(carId));

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Pre-fill user data when user session loads
  useEffect(() => {
    if (user) {
      setName(user.fullName || "");
      setEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  // Calculate rental duration and pricing
  useEffect(() => {
    if (startDate && endDate && car) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setTotalDays(diffDays);
        setTotalPrice(diffDays * car.price);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, car]);

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Vehicle Not Found</h2>
        <p className="text-muted-foreground">The car listing you are looking for does not exist or has been removed.</p>
        <Link href="/cars">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  const saved = isCarSaved(car.id);

  const handleBooking = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to make a reservation");
      return;
    }

    if (!startDate || !endDate || !name || !email || !phone) {
      toast.error("Please fill in all booking fields");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return;
    }

    if (end <= start) {
      toast.error("End date must be at least 1 day after the start date");
      return;
    }

    const reservationDetails = {
      carId: car.id,
      carName: car.name,
      carImage: car.image,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
    };

    const success = addReservation(reservationDetails);
    if (success) {
      router.push("/reservations");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back navigation */}
      <Link href="/cars" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Car Media & Information */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Visual showcase */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex items-center justify-center h-[320px] md:h-[450px] overflow-hidden shadow-xs">
            <div className="absolute top-6 left-6 z-10 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              {car.make} Fleet
            </div>
            
            <button
              onClick={() => toggleSaveCar(car.id)}
              className="absolute top-6 right-6 z-10 p-3 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 dark:text-slate-400 border border-slate-200 dark:border-slate-755 shadow-xs transition-colors"
              aria-label="Toggle save car"
            >
              <Heart className={`w-5 h-5 ${saved ? "fill-red-500 text-red-500" : ""}`} />
            </button>

            <div className="relative w-full h-[80%]">
              <Image
                src={car.image}
                alt={car.name}
                fill
                className="object-contain hover:scale-102 transition-transform duration-500"
                priority
              />
            </div>
          </div>

          {/* Title and Ratings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{car.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">• Verified Rental</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{car.name}</h1>
            <p className="text-muted-foreground text-sm max-w-2xl capitalize">
              Enjoy premium performance and luxury ride styling with the {car.make} {car.body}. Designed with top ergonomics and clean drive dynamics.
            </p>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Fuel Type", value: car.fuel, icon: <Fuel className="w-5 h-5 text-indigo-500" /> },
              { label: "Transmission", value: car.transmission, icon: <Settings2 className="w-5 h-5 text-indigo-500" /> },
              { label: "Seats", value: `${car.seats} Passengers`, icon: <Users className="w-5 h-5 text-indigo-500" /> },
              { label: "Body Style", value: car.body, icon: <Star className="w-5 h-5 text-indigo-500" /> },
            ].map((spec, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3.5 shadow-xs">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                  {spec.icon}
                </div>
                <div>
                  <span className="text-xxs font-semibold uppercase tracking-wider text-slate-400 block">{spec.label}</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{spec.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Features check list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-lg font-bold">Key Specifications & Features</h3>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {car.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-slate-650 dark:text-slate-350">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Reservation Widget */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-muted-foreground text-sm font-semibold">Rental Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${car.price}</span>
                <span className="text-xs text-muted-foreground">/ day</span>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
                <Input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-850"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <Input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-850"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                <Input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-850"
                />
              </div>

              {/* Rental Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pick-up Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Drop-off Date</label>
                  <input
                    type="date"
                    required
                    min={startDate || new Date().toISOString().split("T")[0]}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Total Summary */}
              {totalDays > 0 && (
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                      Duration:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{totalDays} days</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-indigo-500" />
                      Daily rate:
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">${car.price}</span>
                  </div>
                  <div className="border-t border-indigo-200/40 dark:border-indigo-900/40 pt-2 flex justify-between items-baseline">
                    <span className="text-xs font-bold uppercase text-indigo-950 dark:text-indigo-400">Total Price</span>
                    <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">${totalPrice}</span>
                  </div>
                </div>
              )}

              {/* Action Submit */}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5 font-semibold shadow-md shadow-indigo-600/10">
                {user ? "Reserve Now" : "Sign In to Book"}
              </Button>
            </form>

            <div className="flex items-center gap-2.5 text-xxs text-muted-foreground justify-center border-t border-slate-100 dark:border-slate-800 pt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Full Collision Damage Protection options ready at check-out</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
