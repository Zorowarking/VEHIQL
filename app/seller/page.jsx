"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/components/AppContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Building, 
  PlusCircle, 
  Trash2, 
  Check, 
  X, 
  Briefcase, 
  FileCheck, 
  PhoneCall, 
  Info, 
  Car, 
  MessageSquare,
  BadgeAlert
} from "lucide-react";
import { toast } from "sonner";
import { getVehicles, getInquiries } from "@/lib/actions";

export default function SellerDashboard() {
  const { user } = useUser();
  const { 
    dbUser, 
    company, 
    registerCompanyProfile, 
    addCar, 
    deleteCar, 
    updateReservationStatus,
    appLoading 
  } = useApp();
  const router = useRouter();

  // Tab Control State
  const [activeTab, setActiveTab] = useState("overview");

  // Showroom Profile Form State
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Seller Inventory & Inquiries States
  const [sellerCars, setSellerCars] = useState([]);
  const [sellerInquiries, setSellerInquiries] = useState([]);
  const [loadingSellerData, setLoadingSellerData] = useState(false);

  // New Car Listing Form State
  const [carName, setCarName] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carBody, setCarBody] = useState("suv");
  const [carTransmission, setCarTransmission] = useState("Automatic");
  const [carFuel, setCarFuel] = useState("Petrol");
  const [carPrice, setCarPrice] = useState("");
  const [carSeats, setCarSeats] = useState("5");
  const [featuresText, setFeaturesText] = useState("");

  // Initialize company profile form when company state loads
  useEffect(() => {
    if (company) {
      setCompanyName(company.company_name || "");
      setPhone(company.phone || "");
      setAddress(company.address || "");
      setDescription(company.description || "");
      setRegNumber(company.registration_number || "");
      setLogoUrl(company.logo || "");
    }
  }, [company]);

  // Load seller's private inventory and inquiries
  const fetchSellerData = async () => {
    if (!user?.id) return;
    setLoadingSellerData(true);
    try {
      // Fetch seller's own listings (including pending approval)
      const myCars = await getVehicles({ seller_id: user.id, status: null });
      setSellerCars(myCars);

      // Fetch inquiries on seller's cars
      const myInquiries = await getInquiries(user.id, "seller");
      setSellerInquiries(myInquiries);
    } catch (err) {
      console.error("Error fetching seller data:", err);
    } finally {
      setLoadingSellerData(false);
    }
  };

  useEffect(() => {
    if (user?.id && dbUser?.role === "seller") {
      fetchSellerData();
    }
  }, [user, dbUser]);

  // Check role authorization
  useEffect(() => {
    if (dbUser && !appLoading) {
      if (dbUser.role !== "seller") {
        router.push("/role-select");
      }
    }
  }, [dbUser, appLoading, router]);

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!companyName || !phone || !address) {
      toast.error("Please fill in company name, phone, and showroom address.");
      return;
    }

    const success = await registerCompanyProfile({
      company_name: companyName,
      phone,
      address,
      description,
      registration_number: regNumber,
      logo: logoUrl || "/make/bmw.webp"
    });

    if (success) {
      toast.success("Showroom profile updated and submitted for verification!");
      fetchSellerData();
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();

    if (!company || company.status !== "approved") {
      toast.error("Your showroom profile must be APPROVED by Admin before listing inventory.");
      return;
    }

    if (!carName || !carMake || !carPrice || !carSeats) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const featuresArray = featuresText
      .split(",")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const success = await addCar({
      name: carName,
      make: carMake,
      body: carBody,
      transmission: carTransmission,
      fuel: carFuel,
      price: Number(carPrice),
      seats: Number(carSeats),
      features: featuresArray.length > 0 ? featuresArray : ["A/C", "Infotainment Touchscreen"],
      image: "/1.png", // fallback placeholer image
      status: "pending" // requires admin approval
    });

    if (success) {
      // Clear form
      setCarName("");
      setCarMake("");
      setCarBody("suv");
      setCarTransmission("Automatic");
      setCarFuel("Petrol");
      setCarPrice("");
      setCarSeats("5");
      setFeaturesText("");
      fetchSellerData();
    }
  };

  const handleDeleteListing = async (carId) => {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      await deleteCar(carId);
      fetchSellerData();
    }
  };

  const handleStatusUpdate = async (inqId, buyerId, newStatus) => {
    await updateReservationStatus(inqId, buyerId, newStatus);
    fetchSellerData();
  };

  if (appLoading || loadingSellerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Syncing seller dashboard...</p>
        </div>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const activeListings = sellerCars.filter(c => c.status === "approved").length;
  const pendingListings = sellerCars.filter(c => c.status === "pending").length;
  const totalLeads = sellerInquiries.length;
  const pendingLeads = sellerInquiries.filter(i => i.status === "pending").length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      
      {/* Header and Company Status Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Seller Showroom</h1>
          <p className="text-muted-foreground text-sm">Manage your vehicle listings, handle customer inquiries, and edit your business profile.</p>
        </div>
        
        {/* Verification Status Badge */}
        {company ? (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${
            company.status === "approved" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/60"
              : company.status === "rejected"
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/60"
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/60"
          }`}>
            <Building className="w-4 h-4" />
            <span>Showroom: {company.company_name} ({company.status.toUpperCase()})</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-750 border border-amber-250 text-xs font-bold">
            <BadgeAlert className="w-4 h-4 text-amber-550" />
            <span>Showroom Profile: Pending Registration</span>
          </div>
        )}
      </div>

      {/* Showroom Verification Alert Notice */}
      {company && company.status === "pending" && (
        <div className="p-4 bg-amber-50/80 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-400 mb-8 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Verification Pending</p>
            <p className="text-xs mt-1">Your showroom registration is currently under review by our administration. You can configure your profile and draft listings, but listings will not be visible on the public browsing catalog until verification is approved.</p>
          </div>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="rounded-3xl border-slate-200 dark:border-slate-850 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Public Listings</CardTitle>
            <Car className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeListings}</div>
            <p className="text-xxs text-muted-foreground mt-1">Approved and active on catalog</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 dark:border-slate-850 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</CardTitle>
            <FileCheck className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{pendingListings}</div>
            <p className="text-xxs text-muted-foreground mt-1">Listings waiting for admin approval</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 dark:border-slate-850 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalLeads}</div>
            <p className="text-xxs text-muted-foreground mt-1">Inquiries made on your listings</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 dark:border-slate-850 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Leads</CardTitle>
            <PhoneCall className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingLeads}</div>
            <p className="text-xxs text-muted-foreground mt-1">Active customer requests needing callback</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Control */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 overflow-x-auto">
        {[
          { id: "overview", name: "Leads & inquiries" },
          { id: "inventory", name: "Manage Inventory" },
          { id: "profile", name: "Showroom Settings" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-slate-900"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Contents: Leads / Inquiries */}
      {activeTab === "overview" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Customer Inquiries</h3>

          {sellerInquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="pb-3 pr-4">Vehicle</th>
                    <th className="pb-3 px-4">Buyer Details</th>
                    <th className="pb-3 px-4">Proposed Schedule</th>
                    <th className="pb-3 px-4">Est. Quote</th>
                    <th className="pb-3 px-4">Message</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {sellerInquiries.map((res) => (
                    <tr key={res.id} className="align-middle">
                      <td className="py-4 pr-4 font-semibold">{res.car_name}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold block">{res.buyer_name}</span>
                        <span className="text-xxs text-muted-foreground block">{res.buyer_email}</span>
                      </td>
                      <td className="py-4 px-4 text-xs whitespace-nowrap">
                        {new Date(res.start_date).toLocaleDateString()} to {new Date(res.end_date).toLocaleDateString()}
                        <span className="block text-xxs text-muted-foreground">({res.total_days} days)</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-850 dark:text-slate-350">${res.total_price}</td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={res.message}>
                        {res.message}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                          res.status === "pending"
                            ? "bg-amber-100/70 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            : res.status === "confirmed"
                            ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : res.status === "cancelled"
                            ? "bg-red-100/70 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                            : "bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                        }`}>
                          {res.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === "pending" && (
                            <>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleStatusUpdate(res.id, res.buyer_id, "confirmed")}
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg"
                                aria-label="Confirm Lead"
                              >
                                <Check className="w-4.5 h-4.5" />
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleStatusUpdate(res.id, res.buyer_id, "cancelled")}
                                className="h-8 w-8 p-0 text-red-650 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                                aria-label="Reject Lead"
                              >
                                <X className="w-4.5 h-4.5" />
                              </Button>
                            </>
                          )}
                          {res.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(res.id, res.buyer_id, "completed")}
                              className="h-8 px-3 rounded-lg border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                            >
                              Complete Transaction
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No inquiries on your vehicle listings found.
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Inventory Management */}
      {activeTab === "inventory" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Active / Pending Inventory Listings */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Your Showroom Inventory</h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sellerCars.length > 0 ? (
                sellerCars.map((car) => (
                  <div key={car.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center p-1 border border-slate-100 dark:border-slate-750">
                        <Image
                          src={car.image}
                          alt={car.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug flex items-center gap-2">
                          {car.name}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            car.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : car.status === "rejected"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          }`}>
                            {car.status.toUpperCase()}
                          </span>
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {car.make} • {car.body} • ${car.price}/day
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteListing(car.id)}
                      className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg w-8 h-8"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Your showroom is empty. Use the form to list your first vehicle.
                </div>
              )}
            </div>
          </div>

          {/* Add New Listing Form */}
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-indigo-500" />
              Add Inventory
            </h3>

            {company && company.status === "approved" ? (
              <form onSubmit={handleAddCar} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-450">Car Name</label>
                  <Input
                    required
                    placeholder="e.g. BMW M8 Competiton"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Make / Brand</label>
                  <Input
                    required
                    placeholder="e.g. BMW"
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Body Type</label>
                    <select
                      value={carBody}
                      onChange={(e) => setCarBody(e.target.value)}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500 cursor-pointer"
                    >
                      <option value="suv">SUV</option>
                      <option value="sedan">Sedan</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="convertible">Convertible</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Transmission</label>
                    <select
                      value={carTransmission}
                      onChange={(e) => setCarTransmission(e.target.value)}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500 cursor-pointer"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Seats</label>
                    <Input
                      required
                      type="number"
                      min="2"
                      max="9"
                      value={carSeats}
                      onChange={(e) => setCarSeats(e.target.value)}
                      className="rounded-xl border-slate-200 dark:border-slate-855 text-xs h-10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Fuel</label>
                    <select
                      value={carFuel}
                      onChange={(e) => setCarFuel(e.target.value)}
                      className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-2 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500 cursor-pointer"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Rate/day</label>
                    <Input
                      required
                      type="number"
                      min="1"
                      placeholder="120"
                      value={carPrice}
                      onChange={(e) => setCarPrice(e.target.value)}
                      className="rounded-xl border-slate-200 dark:border-slate-855 text-xs h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Features (comma separated)</label>
                  <Input
                    placeholder="Heads-up Display, 4WD, Premium Audio"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855 text-xs"
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs">
                  Submit for Approval
                </Button>
              </form>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
                <Building className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-muted-foreground">You must register your showroom company profile and receive administrator verification before adding vehicle listings.</p>
                <Button size="sm" onClick={() => setActiveTab("profile")} className="bg-indigo-600 text-white text-xs rounded-lg">
                  Set Showroom Profile
                </Button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Tab Contents: Showroom / Profile Settings */}
      {activeTab === "profile" && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-3xl">
          <CardHeader>
            <CardTitle>Showroom Company Settings</CardTitle>
            <CardDescription>Setup your public dealership showroom profile. Profile information requires verification by the administration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateCompany} className="space-y-5 text-left">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Showroom / Company Name</label>
                  <Input
                    required
                    placeholder="e.g. Apex Auto Showroom"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Registration / License Number</label>
                  <Input
                    placeholder="e.g. REG-8927189-TX"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Showroom Contact Phone</label>
                  <Input
                    required
                    placeholder="e.g. +1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Logo Image Link</label>
                  <Input
                    placeholder="e.g. /make/bmw.webp"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Showroom Physical Address</label>
                <Input
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-855"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Dealership Bio / Description</label>
                <Textarea
                  placeholder="Tell buyers about your dealership collection, service history, and rental/sale policies."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="rounded-xl border-slate-200 dark:border-slate-855"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs px-6 py-5">
                  Save Showroom Profile
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
