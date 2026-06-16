"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Heart, Fuel, Settings2, Users, Search, SlidersHorizontal, RotateCcw, GitCompare } from "lucide-react";

const CARS_PER_PAGE = 6;

function CarsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cars, toggleSaveCar, isCarSaved, compareList, toggleCompare, clearCompare, isInCompare } = useApp();

  // Filter States
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");
  const [priceRange, setPriceRange] = useState(250);
  const [sortBy, setSortBy] = useState("rating-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state with URL search params on mount/param change
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setMake(searchParams.get("make") || "");
    setBody(searchParams.get("body") || "");
    setTransmission(searchParams.get("transmission") || "");
    setFuel(searchParams.get("fuel") || "");
    setPriceRange(Number(searchParams.get("price")) || 250);
    setCurrentPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // Update URL search params when state changes (helps with bookmarking/sharing search results)
  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === "" || val === null || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset page if filters change
    if (!newParams.page) {
      params.set("page", "1");
    }
    router.push(`/cars?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearch("");
    setMake("");
    setBody("");
    setTransmission("");
    setFuel("");
    setPriceRange(250);
    setSortBy("rating-desc");
    router.push("/cars");
  };

  // Unique lists for filter dropdowns
  const makesList = ["BMW", "Honda", "Hyundai", "Tata", "Ford", "Mahindra"];
  const bodiesList = ["sedan", "convertible", "hatchback", "suv"];
  const fuelsList = ["Petrol", "Diesel", "Electric", "Hybrid"];

  // Filter and Sort Logic
  const filteredCars = cars
    .filter((car) => {
      const matchSearch = car.name.toLowerCase().includes(search.toLowerCase()) || 
                          car.make.toLowerCase().includes(search.toLowerCase());
      const matchMake = make ? car.make === make : true;
      const matchBody = body ? car.body === body : true;
      const matchTransmission = transmission ? car.transmission === transmission : true;
      const matchFuel = fuel ? car.fuel === fuel : true;
      const matchPrice = car.price <= priceRange;

      return matchSearch && matchMake && matchBody && matchTransmission && matchFuel && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating-desc") return b.rating - a.rating;
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * CARS_PER_PAGE,
    currentPage * CARS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Explore the Fleet</h1>
        <p className="text-muted-foreground text-sm">Find and book the vehicle that fits your premium travel goals.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-sm sticky top-20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              Filters
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-indigo-600 flex items-center gap-1.5 h-8 px-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Search Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search car model..."
                value={search}
                onChange={(e) => updateParams({ search: e.target.value })}
                className="pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Brand</label>
            <select
              value={make}
              onChange={(e) => updateParams({ make: e.target.value })}
              className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-indigo-500 cursor-pointer"
            >
              <option value="">All Brands</option>
              {makesList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Body Type</label>
            <select
              value={body}
              onChange={(e) => updateParams({ body: e.target.value })}
              className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-indigo-500 cursor-pointer"
            >
              <option value="">All Body Styles</option>
              {bodiesList.map((b) => (
                <option key={b} value={b} className="capitalize">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Transmission</label>
            <div className="grid grid-cols-2 gap-2">
              {["Automatic", "Manual"].map((type) => (
                <button
                  key={type}
                  onClick={() => updateParams({ transmission: transmission === type ? "" : type })}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    transmission === type
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fuel Type</label>
            <select
              value={fuel}
              onChange={(e) => updateParams({ fuel: e.target.value })}
              className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50/50 dark:bg-slate-950/20 text-sm focus:outline-indigo-500 cursor-pointer"
            >
              <option value="">All Fuel Types</option>
              {fuelsList.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Max Price</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">${priceRange}/day</span>
            </div>
            <input
              type="range"
              min="40"
              max="250"
              step="5"
              value={priceRange}
              onChange={(e) => updateParams({ price: e.target.value })}
              className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xxs text-muted-foreground">
              <span>$40</span>
              <span>$250</span>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <section className="lg:col-span-9 space-y-6">
          {/* Top sorting banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl gap-4 shadow-xs">
            <span className="text-sm font-semibold text-muted-foreground">
              Showing <span className="text-foreground font-bold">{filteredCars.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-slate-50 dark:bg-slate-950/20 text-xs focus:outline-indigo-500 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="rating-desc">Highest Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {paginatedCars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCars.map((car) => {
                const saved = isCarSaved(car.id);
                return (
                  <div key={car.id} className="group flex flex-col justify-between overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48 w-full p-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-center border-b border-slate-100 dark:border-slate-850">
                      {/* Brand Badge */}
                      <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-slate-100 dark:border-slate-800 shadow-xs">
                        {car.make}
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSaveCar(car.id);
                        }}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white dark:bg-slate-900 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 border border-slate-100 dark:border-slate-800 shadow-xs transition-colors"
                        aria-label="Save car"
                      >
                        <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                      </button>

                      {/* Compare Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCompare(car.id);
                        }}
                        className={`absolute top-16 right-4 z-10 p-2 rounded-full border shadow-xs transition-all duration-300 ${
                          isInCompare(car.id)
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                            : "bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 border-slate-100 dark:border-slate-800"
                        }`}
                        aria-label="Compare car"
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>

                      <div className="relative w-full h-full">
                        <Image
                          src={car.image}
                          alt={car.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{car.rating.toFixed(1)}</span>
                        </div>
                        <h3 className="font-bold text-base text-slate-950 dark:text-white line-clamp-1">
                          {car.name}
                        </h3>
                        <span className="text-xs text-muted-foreground capitalize">{car.body}</span>
                      </div>

                      {/* Specs Grid */}
                      <div className="grid grid-cols-3 gap-1 py-3 border-y border-slate-200/60 dark:border-slate-800/60 text-xs text-muted-foreground text-center">
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

                      {/* Price & Rent button */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Per day</span>
                          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            ${car.price}
                          </p>
                        </div>
                        <Link href={`/cars/${car.id}`}>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors">
                            Rent Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">No Vehicles Match Your Search</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">Try broadening your parameters, adjusting the price range slider, or resetting your filter choices.</p>
              </div>
              <Button onClick={resetFilters} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Reset All Filters
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ page: currentPage - 1 })}
                disabled={currentPage === 1}
                className="rounded-xl border-slate-200 dark:border-slate-800"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={currentPage === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateParams({ page: p })}
                  className={`rounded-xl h-9 w-9 p-0 ${
                    currentPage === p
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ page: currentPage + 1 })}
                disabled={currentPage === totalPages}
                className="rounded-xl border-slate-200 dark:border-slate-800"
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-11/12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <GitCompare className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Compare Vehicles</p>
              <p className="text-xs text-muted-foreground">{compareList.length} of 3 selected</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-xs text-muted-foreground hover:text-red-500 h-9 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Clear
            </Button>
            <Link href="/compare">
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-4 font-semibold shadow-md shadow-indigo-600/10"
              >
                Compare Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-sm font-semibold">Loading fleet data...</div>}>
      <CarsPageContent />
    </Suspense>
  );
}
