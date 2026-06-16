"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import { Star, Heart, Fuel, Settings2, Users, ArrowRight, Trash2 } from "lucide-react";

export default function SavedCarsPage() {
  const { dbUser, cars, savedCars, toggleSaveCar, appLoading } = useApp();
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

  // Look up details for all saved cars
  const bookmarkedCars = cars.filter((car) => savedCars.includes(String(car.id)));

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Saved Vehicles</h1>
        <p className="text-muted-foreground text-sm">Keep track of cars you're interested in renting or reserving.</p>
      </div>

      {bookmarkedCars.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarkedCars.map((car) => (
            <div key={car.id} className="group flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300">
              <div className="relative h-44 w-full p-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-center">
                {/* Brand Badge */}
                <div className="absolute top-4 left-4 z-10 px-2 py-1 rounded-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-slate-100 dark:border-slate-800">
                  {car.make}
                </div>

                {/* Remove from Saved Button */}
                <button
                  onClick={() => toggleSaveCar(car.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white hover:bg-red-50 dark:bg-slate-900 text-red-500 hover:text-red-600 border border-slate-100 dark:border-slate-800 shadow-xs transition-colors"
                  aria-label="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="relative w-full h-full">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-contain group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{car.rating.toFixed(1)}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-950 dark:text-white line-clamp-1">
                    {car.name}
                  </h3>
                  <span className="text-xs text-muted-foreground capitalize">{car.body}</span>
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-3 gap-1 py-2 border-y border-slate-200/60 dark:border-slate-800/60 text-xs text-muted-foreground text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Fuel className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate">{car.fuel}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center border-x border-slate-200/60 dark:border-slate-800/60">
                    <Settings2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate">{car.transmission === "Automatic" ? "Auto" : "Manual"}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{car.seats} S</span>
                  </div>
                </div>

                {/* Price and Details link */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Per day</span>
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      ${car.price}
                    </p>
                  </div>
                  <Link href={`/cars/${car.id}`}>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">Bookmark cars from the browse page to keep track of your favorite choices in one place.</p>
          </div>
          <Link href="/cars" className="inline-block">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2">
              Browse Cars
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
