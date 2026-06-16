"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Fuel, Settings2, Users, ArrowLeft, Trash2, ShieldCheck, CheckCircle2, GitCompare } from "lucide-react";

export default function ComparePage() {
  const { cars, compareList, toggleCompare, clearCompare } = useApp();

  // Filter full car objects that are in the compareList
  const compareCars = cars.filter((car) => compareList.includes(String(car.id)));

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/cars" className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Fleet
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Compare Vehicles</h1>
          <p className="text-muted-foreground text-sm">Analyze and choose the perfect ride side-by-side.</p>
        </div>
        {compareCars.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            className="border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl"
          >
            Clear All
          </Button>
        )}
      </div>

      {compareCars.length === 0 ? (
        /* Empty State */
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/50 backdrop-blur text-center py-16 px-6 max-w-md mx-auto">
          <CardContent className="space-y-6">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <GitCompare className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No Vehicles Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Please visit the fleet explore page and click the compare icon on up to three cars.
              </p>
            </div>
            <Link href="/cars">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5 px-6 font-semibold shadow-lg shadow-indigo-600/10">
                Browse Vehicles
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Compare Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {compareCars.map((car) => (
            <Card key={car.id} className="relative group overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              
              {/* Delete from comparison button */}
              <button
                onClick={() => toggleCompare(car.id)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 border border-slate-100 dark:border-slate-800 shadow-xs transition-colors"
                aria-label="Remove from comparison"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="p-6 space-y-6 flex-grow">
                {/* Visual Area */}
                <div className="relative h-44 w-full bg-slate-50 dark:bg-slate-850/30 rounded-2xl flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800/50">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xxs font-bold uppercase tracking-wider">
                      {car.make}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{car.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white line-clamp-1">{car.name}</h3>
                </div>

                {/* Spec Table */}
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per Day</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">${car.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-slate-400" /> Fuel Type</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{car.fuel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5 text-slate-400" /> Transmission</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{car.transmission}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Seats</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{car.seats} Passengers</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Body Style</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{car.body}</span>
                  </div>
                </div>

                {/* Features list */}
                {car.features && car.features.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {car.features.slice(0, 3).map((feat, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-xxs text-slate-600 dark:text-slate-350">
                          <CheckCircle2 className="w-2.5 h-2.5 text-indigo-500" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/65 mt-auto">
                <Link href={`/cars/${car.id}`} className="block w-full pt-4">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-semibold shadow-md shadow-indigo-600/10">
                    Rent This Vehicle
                  </Button>
                </Link>
              </div>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
