"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Heart, Fuel, Settings2, Users, Search, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { cars, toggleSaveCar, isCarSaved } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    let query = "?";
    if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`;
    if (selectedMake) query += `make=${encodeURIComponent(selectedMake)}&`;
    router.push(`/cars${query.slice(0, -1)}`);
  };

  const makes = [
    { name: "BMW", img: "/make/bmw.webp" },
    { name: "Honda", img: "/make/honda.webp" },
    { name: "Hyundai", img: "/make/hyundai.webp" },
    { name: "Tata", img: "/make/tata.webp" },
    { name: "Ford", img: "/make/ford.webp" },
    { name: "Mahindra", img: "/make/mahindra.webp" },
  ];

  const bodies = [
    { name: "Sedan", slug: "sedan", img: "/body/sedan.webp" },
    { name: "SUV", slug: "suv", img: "/body/suv.webp" },
    { name: "Hatchback", slug: "hatchback", img: "/body/hatchback.webp" },
    { name: "Convertible", slug: "convertible", img: "/body/convertible.webp" },
  ];

  // Get top 4 rated cars to display as featured
  const featuredCars = [...cars]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-20 lg:py-32">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/3.jpg"
            alt="Premium Car Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Premium Car Rental & Booking
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Find, Reserve, & Rent Your{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Dream Car
              </span>{" "}
              Instantly
            </h1>
            <p className="text-lg text-slate-300 max-w-xl">
              Experience the luxury of premium travel. Explore our curated fleet of luxury sedans, sports convertibles, and rugged off-road SUVs.
            </p>

            {/* Quick Search Widget */}
            <form onSubmit={handleSearch} className="bg-background dark:bg-slate-900 p-3 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3 max-w-2xl text-foreground">
              <div className="flex-1 flex items-center gap-2 px-3 border-r border-slate-200 dark:border-slate-800">
                <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Which car model are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 bg-transparent px-0 h-10 w-full text-sm placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="w-full md:w-48 flex items-center gap-2 px-3 border-r md:border-r border-slate-200 dark:border-slate-800">
                <Settings2 className="text-slate-400 w-5 h-5 flex-shrink-0" />
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="bg-transparent text-sm h-10 w-full focus:outline-none cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  <option value="">All Brands</option>
                  {makes.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl h-11 px-6 shadow-lg shadow-indigo-600/20">
                Search Fleet
              </Button>
            </form>
          </div>

          {/* Featured Hero Car Image */}
          <div className="lg:col-span-5 hidden lg:block relative h-[380px] w-full">
            <Image
              src="/1.png"
              alt="Hero Car"
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)] animate-float"
              priority
            />
          </div>
        </div>
      </section>

      {/* Brand Selector Section */}
      <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Explore Popular Brands</h2>
            <p className="text-muted-foreground text-sm">Find your preferred drive from the world&apos;s most trusted manufacturers.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 justify-center">
            {makes.map((make) => (
              <Link key={make.name} href={`/cars?make=${make.name}`}>
                <div className="group flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-800/50 shadow-sm transition-all duration-300">
                  <div className="relative w-12 h-12 mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
                    <Image
                      src={make.img}
                      alt={make.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {make.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Body Type Selector Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Filter by Body Type</h2>
            <p className="text-muted-foreground text-sm">Choose a category that fits your style and space requirements.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {bodies.map((body) => (
              <Link key={body.slug} href={`/cars?body=${body.slug}`}>
                <div className="group relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all duration-300">
                  <div className="relative w-full h-24 mb-4">
                    <Image
                      src={body.img}
                      alt={body.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {body.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Fleet Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-wider uppercase">Our Featured Fleet</span>
              <h2 className="text-3xl font-bold tracking-tight mt-1">Stunning Cars Ready for Action</h2>
            </div>
            <Link href="/cars" className="mt-4 md:mt-0 group inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">
              View All Cars
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => {
              const saved = isCarSaved(car.id);
              return (
                <div key={car.id} className="group flex flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 w-full p-4 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm">
                      {car.make}
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSaveCar(car.id);
                      }}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 shadow-sm transition-colors"
                      aria-label="Save car"
                    >
                      <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
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

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{car.rating.toFixed(1)}</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-950 dark:text-white line-clamp-1">
                        {car.name}
                      </h3>
                      <span className="text-xs text-muted-foreground capitalize">{car.body}</span>
                    </div>

                    {/* Specs Row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200/60 dark:border-slate-800/60 text-xs text-muted-foreground">
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

                    {/* Pricing and Action */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Per day</span>
                        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                          ${car.price}
                        </p>
                      </div>
                      <Link href={`/cars/${car.id}`}>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/10">
                          Rent Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider">Simple Booking Process</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">How Vehiql Works</h2>
            <p className="text-muted-foreground text-sm mt-2">Rent your dream car in three simple steps with our streamlined digital check-in.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-4 shadow-sm relative z-10">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-lg font-bold mx-auto">
                1
              </span>
              <h3 className="text-xl font-bold">Choose Your Vehicle</h3>
              <p className="text-sm text-muted-foreground">Select from our premium catalog of high-performing cars and SUVs matching your travel requirements.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-4 shadow-sm relative z-10">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-lg font-bold mx-auto">
                2
              </span>
              <h3 className="text-xl font-bold">Select Date & Time</h3>
              <p className="text-sm text-muted-foreground">Pick your rental dates, complete details, and check estimated pricing transparently.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-4 shadow-sm relative z-10">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-lg font-bold mx-auto">
                3
              </span>
              <h3 className="text-xl font-bold">Confirm & Drive</h3>
              <p className="text-sm text-muted-foreground">Approve the summary, and pick up your clean vehicle. Enjoy premium roadside assistance anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[320px] w-full bg-indigo-50 dark:bg-slate-900 rounded-3xl overflow-hidden p-6 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <Image
                src="/2.webp"
                alt="Support Guarantee"
                fill
                className="object-cover opacity-90"
              />
            </div>
            <div className="space-y-6">
              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold uppercase tracking-wider">Premium Experience</span>
              <h2 className="text-3xl font-extrabold tracking-tight">VEHIQL Guarantees Maximum Safety and Comfort</h2>
              <p className="text-muted-foreground text-sm">
                We maintain our fleet with the highest safety inspection standards, delivering cleaner, smoother cars. Benefit from round-the-clock roadside assistance, full comprehensive insurance options, and flexible cancellation policies.
              </p>
              <ul className="space-y-3">
                {[
                  "24/7 Roadside Assistance & Concierge Service",
                  "Complimentary Full Vehicle Sanitation",
                  "Flexible Bookings with Zero Cancellation Fees",
                  "Verified Professional Drivers Available on Demand",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
