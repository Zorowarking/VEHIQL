"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/components/AppContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShieldAlert, 
  Award, 
  FileText, 
  Landmark, 
  PlusCircle, 
  Trash2, 
  Check, 
  X, 
  Building, 
  Users, 
  ShieldCheck, 
  Settings, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { 
  getAnalytics, 
  getPendingCompanies, 
  getPendingVehicles, 
  updateCompanyStatus, 
  updateVehicleStatus, 
  getAllUsers, 
  updateUserRole, 
  updateUserStatus 
} from "@/lib/actions";

export default function AdminPage() {
  const { user } = useUser();
  const { dbUser, cars, allReservations, addCar, deleteCar, updateReservationStatus, isDbMode, appLoading } = useApp();
  const router = useRouter();

  // Tab Control State
  const [activeTab, setActiveTab] = useState("listings");

  // Admin DB Specific States
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalSellers: 0,
    recentBookings: []
  });
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingDbData, setLoadingDbData] = useState(false);

  // New Car Form State (Admin Quick Add)
  const [name, setName] = useState("");
  const [make, setMake] = useState("");
  const [body, setBody] = useState("suv");
  const [transmission, setTransmission] = useState("Automatic");
  const [fuel, setFuel] = useState("Petrol");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("5");
  const [featuresInput, setFeaturesInput] = useState("");

  // Platform Dummy Settings State
  const [platformFee, setPlatformFee] = useState("5");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Check role authorization
  useEffect(() => {
    if (dbUser && !appLoading) {
      if (dbUser.role !== "admin") {
        router.push("/role-select");
      }
    }
  }, [dbUser, appLoading, router]);

  // Load Admin Data from PostgreSQL DB
  const loadAdminDbData = async () => {
    if (!isDbMode) return;
    setLoadingDbData(true);
    try {
      const stats = await getAnalytics();
      setAnalytics(stats);

      const companies = await getPendingCompanies();
      setPendingCompanies(companies);

      const vCars = await getPendingVehicles();
      setPendingCars(vCars);

      const users = await getAllUsers();
      setUsersList(users);
    } catch (err) {
      console.error("Failed loading admin DB data:", err);
    } finally {
      setLoadingDbData(false);
    }
  };

  useEffect(() => {
    if (isDbMode && dbUser?.role === "admin") {
      loadAdminDbData();
    }
  }, [isDbMode, dbUser]);

  const handleAddCar = async (e) => {
    e.preventDefault();

    if (!name || !make || !price || !seats) {
      toast.error("Please fill in all required car fields");
      return;
    }

    const featuresArray = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const success = await addCar({
      name,
      make,
      body,
      transmission,
      fuel,
      price: Number(price),
      seats: Number(seats),
      features: featuresArray.length > 0 ? featuresArray : ["Leather Interior", "AC"],
      image: "/1.png",
      status: "approved" // Admin listings are auto-approved
    });

    if (success) {
      setName("");
      setMake("");
      setBody("suv");
      setTransmission("Automatic");
      setFuel("Petrol");
      setPrice("");
      setSeats("5");
      setFeaturesInput("");
      loadAdminDbData();
    }
  };

  const handleDeleteListing = async (carId) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteCar(carId);
      loadAdminDbData();
    }
  };

  const handleApproveCompany = async (compId, status) => {
    try {
      await updateCompanyStatus(compId, status);
      toast.success(`Company registration status set to ${status.toUpperCase()}`);
      loadAdminDbData();
    } catch (err) {
      toast.error("Failed updating company verification status");
    }
  };

  const handleApproveCar = async (carId, status) => {
    try {
      await updateVehicleStatus(carId, status);
      toast.success(`Vehicle catalog listing set to ${status.toUpperCase()}`);
      loadAdminDbData();
    } catch (err) {
      toast.error("Failed updating vehicle listing status");
    }
  };

  const handleUserRoleChange = async (targetUserId, newRole) => {
    try {
      await updateUserRole(targetUserId, newRole);
      toast.success(`User role updated to ${newRole}`);
      loadAdminDbData();
    } catch (err) {
      toast.error("Failed updating user role");
    }
  };

  const handleUserStatusChange = async (targetUserId, newStatus) => {
    try {
      await updateUserStatus(targetUserId, newStatus);
      toast.success(`User account status updated to ${newStatus}`);
      loadAdminDbData();
    } catch (err) {
      toast.error("Failed updating user account status");
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success("Platform configuration updated successfully!");
  };

  if (appLoading || loadingDbData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Syncing platform administration...</p>
        </div>
      </div>
    );
  }

  // Fallback calculations for LocalStorage demo mode
  const totalListings = isDbMode ? analytics.totalListings : cars.length;
  const activeBookings = isDbMode ? analytics.activeBookings : allReservations.filter(res => res.status === "Pending" || res.status === "Confirmed").length;
  const totalRevenue = isDbMode ? analytics.totalRevenue : allReservations.filter(res => res.status === "Confirmed" || res.status === "Completed").reduce((sum, res) => sum + res.totalPrice, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground text-sm">Control site inventory, showroom registrations, role permissions, and platform settings.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-indigo-500" />
          <span>Operator: {user?.fullName || "Staff Administrator"}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="rounded-3xl border-slate-200 dark:border-slate-850 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Approved Listings</CardTitle>
            <Award className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalListings}</div>
            <p className="text-xxs text-muted-foreground mt-1">Active vehicles on catalog</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 dark:border-slate-850 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Rentals</CardTitle>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{activeBookings}</div>
            <p className="text-xxs text-muted-foreground mt-1">Pending and confirmed inquiries</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 dark:border-slate-850 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Revenue</CardTitle>
            <Landmark className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${totalRevenue}</div>
            <p className="text-xxs text-muted-foreground mt-1">Calculated from transaction values</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Control */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 overflow-x-auto">
        {[
          { id: "listings", name: "Manage Listings" },
          { id: "approvals", name: "Showroom Approvals" },
          { id: "vehicles", name: "Vehicle Moderation" },
          { id: "users", name: "User Permissions" },
          { id: "bookings", name: "Rental Reservations" },
          { id: "settings", name: "Platform Settings" }
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

      {/* Tab: Listings */}
      {activeTab === "listings" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Approved Catalog Vehicles</h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cars.map((car) => (
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
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{car.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">
                        {car.make} • {car.body} • ${car.price}/day {car.company_name && `• Showroom: ${car.company_name}`}
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
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-indigo-500" />
              Add Platform Car
            </h3>
            <form onSubmit={handleAddCar} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Car Name</label>
                <Input
                  required
                  placeholder="e.g. BMW X5 M"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-850"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Make / Brand</label>
                <Input
                  required
                  placeholder="e.g. BMW"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Body Type</label>
                  <select
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500 cursor-pointer"
                  >
                    <option value="suv">SUV</option>
                    <option value="sedan">Sedan</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="convertible">Convertible</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-3 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500 cursor-pointer"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Seats</label>
                  <Input
                    required
                    type="number"
                    min="2"
                    max="9"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855 text-xs h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fuel</label>
                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value)}
                    className="w-full h-10 border border-slate-200 dark:border-slate-800 rounded-xl px-2 bg-white dark:bg-slate-900 text-xs focus:outline-indigo-500 cursor-pointer"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Rate/day</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    placeholder="120"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-855 text-xs h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-455">Features (comma separated)</label>
                <Input
                  placeholder="Adaptive cruise, Panoramic roof"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-855 text-xs"
                />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs">
                Save Listing
              </Button>
            </form>
          </aside>
        </div>
      )}

      {/* Tab: Showroom Approvals */}
      {activeTab === "approvals" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Pending Showroom / Company Approvals</h3>
          {isDbMode ? (
            pendingCompanies.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {pendingCompanies.map(comp => (
                  <div key={comp.id} className="p-6 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 relative p-1 flex items-center justify-center border">
                        <Image src={comp.logo} alt="Logo" fill className="object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{comp.company_name}</h4>
                        <p className="text-xxs text-muted-foreground">Owner: {comp.seller_name} ({comp.seller_email})</p>
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                      <p><strong>License:</strong> {comp.registration_number}</p>
                      <p><strong>Phone:</strong> {comp.phone}</p>
                      <p><strong>Address:</strong> {comp.address}</p>
                      <p className="italic"><strong>Bio:</strong> {comp.description}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="xs" onClick={() => handleApproveCompany(comp.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="xs" onClick={() => handleApproveCompany(comp.id, 'rejected')} variant="outline" className="border-red-200 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-550 text-sm">No pending company registrations at this time.</div>
            )
          ) : (
            <div className="text-center py-12 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Database not configured. Company approval workflows are only available in PostgreSQL Database Mode.</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: Vehicle Moderation */}
      {activeTab === "vehicles" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Pending Vehicle Listings Approvals</h3>
          {isDbMode ? (
            pendingCars.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingCars.map(car => (
                  <div key={car.id} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-12 bg-slate-50 dark:bg-slate-850 rounded-lg flex items-center justify-center p-1 border">
                        <Image src={car.image} alt={car.name} fill className="object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-snug">{car.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {car.make} • {car.body} • ${car.price}/day • Showroom: {car.company_name || car.seller_email}
                        </p>
                        <p className="text-[10px] text-indigo-500 mt-1"><strong>Specs:</strong> {car.transmission} | {car.fuel} | {car.seats} Seats</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="xs" onClick={() => handleApproveCar(car.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button size="xs" onClick={() => handleApproveCar(car.id, 'rejected')} variant="outline" className="border-red-200 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-550 text-sm">No vehicle listings pending moderation.</div>
            )
          ) : (
            <div className="text-center py-12 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Database not configured. Vehicle approval moderation is only available in PostgreSQL Database Mode.</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold mb-4">User Permissions</h3>
          {isDbMode ? (
            usersList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-850">
                    <tr>
                      <th className="pb-3 pr-4">User ID</th>
                      <th className="pb-3 px-4">Contact</th>
                      <th className="pb-3 px-4">Platform Role</th>
                      <th className="pb-3 px-4">Account Status</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="align-middle">
                        <td className="py-4 pr-4 font-mono text-xs">{usr.id}</td>
                        <td className="py-4 px-4">
                          <span className="font-semibold block">{usr.name || "N/A"}</span>
                          <span className="text-xxs text-muted-foreground block">{usr.email}</span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-850 dark:text-slate-350 capitalize">
                          {usr.role}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                            usr.status === "active"
                              ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "bg-red-100/70 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                          }`}>
                            {usr.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role toggles */}
                            <select
                              value={usr.role}
                              onChange={(e) => handleUserRoleChange(usr.id, e.target.value)}
                              className="text-xs bg-transparent border rounded-lg px-2 py-1 focus:outline-indigo-500 cursor-pointer text-slate-650 dark:text-slate-350"
                            >
                              <option value="buyer">Buyer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                            
                            {/* Status toggles */}
                            {usr.status === "active" ? (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleUserStatusChange(usr.id, "suspended")}
                                className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-xs"
                              >
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleUserStatusChange(usr.id, "active")}
                                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg text-xs"
                              >
                                Activate
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
              <div className="text-center py-12 text-slate-550 text-sm">No users registered in database.</div>
            )
          ) : (
            <div className="text-center py-12 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Database not configured. User permissions and lists are only available in PostgreSQL Database Mode.</span>
            </div>
          )}
        </div>
      )}

      {/* Tab: Reservations */}
      {activeTab === "bookings" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Rental Reservations & Transaction Monitoring</h3>
          
          {allReservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 px-4">Customer</th>
                    <th className="pb-3 px-4">Showroom / Company</th>
                    <th className="pb-3 px-4">Vehicle</th>
                    <th className="pb-3 px-4">Duration</th>
                    <th className="pb-3 px-4">Price</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {allReservations.map((res) => (
                    <tr key={res.id} className="align-middle">
                      <td className="py-4 pr-4 font-mono text-xs">{res.id}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold block">{res.customerName || res.buyer_name}</span>
                        <span className="text-xxs text-muted-foreground block">{res.customerEmail || res.buyer_email}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {res.company_name || "VEHIQL Direct"}
                      </td>
                      <td className="py-4 px-4 font-semibold">{res.carName || res.car_name}</td>
                      <td className="py-4 px-4 text-xs whitespace-nowrap">
                        {new Date(res.startDate || res.start_date).toLocaleDateString()} to {new Date(res.endDate || res.end_date).toLocaleDateString()}
                        <span className="block text-xxs text-muted-foreground">({res.totalDays || res.total_days} days)</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-850 dark:text-slate-300">${res.totalPrice || res.total_price}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                            res.status === "Pending" || res.status === "pending"
                              ? "bg-amber-100/70 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                              : res.status === "Confirmed" || res.status === "confirmed"
                              ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : res.status === "Cancelled" || res.status === "cancelled"
                              ? "bg-red-100/70 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                              : "bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                          }`}
                        >
                          {(res.status).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(res.status === "Pending" || res.status === "pending") && (
                            <>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => updateReservationStatus(res.id, res.userId || res.buyer_id, "confirmed")}
                                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg"
                                aria-label="Confirm Booking"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => updateReservationStatus(res.id, res.userId || res.buyer_id, "cancelled")}
                                className="h-8 w-8 p-0 text-red-655 hover:text-red-755 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                                aria-label="Cancel Booking"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {(res.status === "Confirmed" || res.status === "confirmed") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReservationStatus(res.id, res.userId || res.buyer_id, "completed")}
                              className="h-8 px-3 rounded-lg border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                            >
                              Complete
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
              No reservation bookings found.
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-2xl">
          <CardHeader>
            <CardTitle>Platform Configuration Settings</CardTitle>
            <CardDescription>Adjust default commission rates, policy guidelines, and control system maintenance mode.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-6 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Default Showroom Commission Fee (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="rounded-xl border-slate-200 dark:border-slate-850"
                />
                <p className="text-xxs text-muted-foreground">Percentage fee retained by VEHIQL on listing reservations.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">System Maintenance Mode</h4>
                  <p className="text-xxs text-muted-foreground">Temporarily block buyer reservation checkout forms during database maintenance.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    maintenanceMode ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      maintenanceMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs px-6 py-5">
                  Apply Platform Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
