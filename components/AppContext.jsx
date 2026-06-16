"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { INITIAL_CARS } from "@/lib/data/cars";
import {
  getUserProfile,
  createUserProfile,
  updateUserRole,
  getVehicles,
  getSavedVehicles,
  toggleSaveVehicle,
  isVehicleSaved,
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getSellerCompany,
  createOrUpdateCompany
} from "@/lib/actions";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const userId = user?.id || null;
  const router = useRouter();
  const pathname = usePathname();

  // Mode status (DB vs LocalStorage Demo)
  const [isDbMode, setIsDbMode] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // App States
  const [dbUser, setDbUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [cars, setCars] = useState(INITIAL_CARS);
  const [savedCars, setSavedCars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]); // for Admin
  const [compareList, setCompareList] = useState([]);

  // Check if DB is available and load user & data
  const loadAppData = useCallback(async () => {
    setAppLoading(true);
    try {
      // 1. Fetch active listings
      const dbCars = await getVehicles({ status: 'approved' });
      if (dbCars && dbCars.length > 0) {
        setCars(dbCars);
        setIsDbMode(true);
      } else {
        // Fallback to local storage or initial cars
        const storedAdminCars = localStorage.getItem("vehiql_admin_cars");
        if (storedAdminCars) {
          const parsed = JSON.parse(storedAdminCars);
          setCars([...INITIAL_CARS, ...parsed]);
        } else {
          setCars(INITIAL_CARS);
        }
        setIsDbMode(false);
      }

      // 2. Fetch User Profile if logged in
      if (userId) {
        const profile = await getUserProfile(userId);
        if (profile) {
          setDbUser(profile);
          setIsDbMode(true);

          // If seller, fetch company
          if (profile.role === "seller") {
            const comp = await getSellerCompany(userId);
            setCompany(comp);
          }

          // Fetch user-scoped saved cars and inquiries from DB
          const saved = await getSavedVehicles(userId);
          setSavedCars(saved.map(c => String(c.id)));

          const resList = await getInquiries(userId, profile.role);
          setReservations(resList);

          // Fetch all for admin
          if (profile.role === "admin") {
            const allRes = await getInquiries(userId, "admin");
            setAllReservations(allRes);
          }
        } else {
          // No profile in DB. If they are signed in via Clerk, redirect to role selection
          setDbUser(null);
          setCompany(null);
          setSavedCars([]);
          setReservations([]);
          
          if (pathname !== "/role-select" && !pathname.startsWith("/(auth)") && pathname !== "/sign-in" && pathname !== "/sign-up") {
            router.push("/role-select");
          }
        }
      } else {
        setDbUser(null);
        setCompany(null);
        setSavedCars([]);
        setReservations([]);
      }
    } catch (err) {
      console.warn("Database error, falling back to LocalStorage demo:", err);
      setIsDbMode(false);

      // LocalStorage demo fallback
      if (userId) {
        try {
          const storedSaved = localStorage.getItem(`vehiql_saved_${userId}`);
          setSavedCars(storedSaved ? JSON.parse(storedSaved) : []);

          const storedReservations = localStorage.getItem(`vehiql_reservations_${userId}`);
          setReservations(storedReservations ? JSON.parse(storedReservations) : []);

          // Retrieve dummy dbUser role from local storage for demo
          const dummyUserRole = localStorage.getItem(`vehiql_role_${userId}`) || "buyer";
          setDbUser({ id: userId, email: user.primaryEmailAddress?.emailAddress, name: user.fullName, role: dummyUserRole });

          if (dummyUserRole === "seller") {
            const dummyComp = localStorage.getItem(`vehiql_company_${userId}`);
            setCompany(dummyComp ? JSON.parse(dummyComp) : { company_name: "Demo Showroom", status: "approved" });
          }
        } catch (e) {
          console.error("Failed loading local storage fallback:", e);
        }
      }
    } finally {
      setAppLoading(false);
    }
  }, [userId, user, pathname, router]);

  useEffect(() => {
    if (isLoaded) {
      loadAppData();
    }
  }, [isLoaded, userId, loadAppData]);

  // Load all reservations for Admin (simulation/real)
  const reloadReservations = async () => {
    if (isDbMode && dbUser) {
      const resList = await getInquiries(userId, dbUser.role);
      setReservations(resList);
      if (dbUser.role === "admin") {
        const allRes = await getInquiries(userId, "admin");
        setAllReservations(allRes);
      }
    } else {
      // LocalStorage load
      const allRes = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("vehiql_reservations_")) {
            const stored = localStorage.getItem(key);
            if (stored) {
              allRes.push(...JSON.parse(stored));
            }
          }
        }
        allRes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAllReservations(allRes);
      } catch (e) {
        console.error("Local reservations reload failed:", e);
      }
    }
  };

  // Toggle Save Car
  const toggleSaveCar = async (carId) => {
    if (!userId) {
      toast.error("Please sign in to save cars");
      return;
    }

    try {
      if (isDbMode) {
        // DB Mode
        const isSaved = await toggleSaveVehicle(userId, carId);
        setSavedCars(prev => {
          if (isSaved) {
            toast.success("Car saved to your list!");
            return [...prev, String(carId)];
          } else {
            toast.success("Car removed from saved list");
            return prev.filter(id => String(id) !== String(carId));
          }
        });
      } else {
        // LocalStorage fallback
        setSavedCars((prev) => {
          let updated;
          if (prev.includes(String(carId))) {
            updated = prev.filter((id) => String(id) !== String(carId));
            toast.success("Car removed from saved list");
          } else {
            updated = [...prev, String(carId)];
            toast.success("Car saved to your list!");
          }
          localStorage.setItem(`vehiql_saved_${userId}`, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving car");
    }
  };

  const isCarSaved = (carId) => {
    return savedCars.includes(String(carId));
  };

  // Add inquiry/reservation
  const addReservation = async (reservationData) => {
    if (!userId) {
      toast.error("Please sign in to contact sellers or book cars");
      return false;
    }

    try {
      if (isDbMode) {
        // DB Mode
        const newInq = await createInquiry({
          buyer_id: userId,
          vehicle_id: reservationData.carId,
          message: reservationData.message || `Hi, I am interested in your ${reservationData.carName}.`,
          start_date: reservationData.startDate,
          end_date: reservationData.endDate,
          total_days: reservationData.totalDays,
          total_price: reservationData.totalPrice
        });
        if (newInq) {
          toast.success("Inquiry and reservation request submitted successfully!");
          await loadAppData();
          return true;
        }
      } else {
        // LocalStorage fallback
        const newRes = {
          id: `res_${Date.now()}`,
          userId,
          status: "Pending",
          createdAt: new Date().toISOString(),
          ...reservationData,
        };

        setReservations((prev) => {
          const updated = [newRes, ...prev];
          localStorage.setItem(`vehiql_reservations_${userId}`, JSON.stringify(updated));
          return updated;
        });
        toast.success("Reservation request submitted successfully!");
        return true;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit reservation request");
    }
    return false;
  };

  // Cancel reservation
  const cancelReservation = async (resId) => {
    try {
      if (isDbMode) {
        await updateInquiryStatus(resId, "Cancelled");
        toast.success("Reservation cancelled");
        await loadAppData();
      } else {
        setReservations((prev) => {
          const updated = prev.map((res) =>
            res.id === resId ? { ...res, status: "Cancelled" } : res
          );
          localStorage.setItem(`vehiql_reservations_${userId}`, JSON.stringify(updated));
          return updated;
        });
        toast.success("Reservation cancelled");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel reservation");
    }
  };

  // Add car listing
  const addCar = async (newCarData) => {
    try {
      if (isDbMode) {
        const res = await addVehicle({
          seller_id: userId,
          make: newCarData.make,
          name: newCarData.name,
          body: newCarData.body,
          transmission: newCarData.transmission,
          fuel: newCarData.fuel,
          price: Number(newCarData.price),
          seats: Number(newCarData.seats),
          image: newCarData.image || "/1.png",
          features: newCarData.features || [],
          status: dbUser?.role === 'admin' ? 'approved' : 'pending' // Admin auto-approves, seller needs review
        });

        if (res) {
          if (dbUser?.role === 'admin') {
            toast.success("New car listing added successfully!");
          } else {
            toast.success("Listing submitted and pending admin approval.");
          }
          await loadAppData();
          return true;
        }
      } else {
        // LocalStorage fallback
        const newCar = {
          id: `car_${Date.now()}`,
          rating: 5.0,
          image: newCarData.image || "/1.png",
          ...newCarData,
          price: Number(newCarData.price),
          seats: Number(newCarData.seats),
        };

        setCars((prev) => {
          const updated = [...prev, newCar];
          const adminOnly = updated.filter((c) => !INITIAL_CARS.some((ic) => ic.id === c.id));
          localStorage.setItem("vehiql_admin_cars", JSON.stringify(adminOnly));
          return updated;
        });
        toast.success("New car listing added successfully!");
        return true;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add listing");
    }
    return false;
  };

  // Update car listing
  const updateCar = async (updatedCar) => {
    try {
      if (isDbMode) {
        await updateVehicle(updatedCar.id, updatedCar);
        toast.success("Car listing updated successfully!");
        await loadAppData();
      } else {
        setCars((prev) => {
          const updated = prev.map((c) => (c.id === updatedCar.id ? updatedCar : c));
          const adminOnly = updated.filter((c) => !INITIAL_CARS.some((ic) => ic.id === c.id));
          localStorage.setItem("vehiql_admin_cars", JSON.stringify(adminOnly));
          return updated;
        });
        toast.success("Car listing updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update car listing");
    }
  };

  // Delete car listing
  const deleteCar = async (carId) => {
    try {
      if (isDbMode) {
        await deleteVehicle(carId);
        toast.success("Car listing deleted successfully!");
        await loadAppData();
      } else {
        setCars((prev) => {
          const updated = prev.filter((c) => c.id !== carId);
          const adminOnly = updated.filter((c) => !INITIAL_CARS.some((ic) => ic.id === c.id));
          localStorage.setItem("vehiql_admin_cars", JSON.stringify(adminOnly));
          return updated;
        });
        toast.success("Car listing deleted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete car listing");
    }
  };

  // Update reservation status
  const updateReservationStatus = async (resId, targetUserId, newStatus) => {
    try {
      if (isDbMode) {
        await updateInquiryStatus(resId, newStatus);
        toast.success(`Reservation status updated to ${newStatus}`);
        await loadAppData();
      } else {
        const userKey = `vehiql_reservations_${targetUserId}`;
        const stored = localStorage.getItem(userKey);
        if (stored) {
          const userRes = JSON.parse(stored);
          const updatedUserRes = userRes.map((r) =>
            r.id === resId ? { ...r, status: newStatus } : r
          );
          localStorage.setItem(userKey, JSON.stringify(updatedUserRes));

          if (targetUserId === userId) {
            setReservations(updatedUserRes);
          } else {
            reloadReservations();
          }
          toast.success(`Reservation status updated to ${newStatus}`);
        }
      }
    } catch (e) {
      console.error("Failed to update reservation status", e);
      toast.error("Failed to update status");
    }
  };

  // Register Company profile (Sellers)
  const registerCompanyProfile = async (companyData) => {
    try {
      if (isDbMode) {
        const comp = await createOrUpdateCompany(userId, companyData);
        setCompany(comp);
        toast.success("Company profile saved and pending admin approval.");
        await loadAppData();
        return true;
      } else {
        localStorage.setItem(`vehiql_company_${userId}`, JSON.stringify({ ...companyData, status: "pending" }));
        setCompany({ ...companyData, status: "pending" });
        toast.success("Company profile saved and pending admin approval.");
        return true;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save company profile");
    }
    return false;
  };

  // Choose user role (Initial onboarding / Role switching)
  const registerUserRole = async (selectedRole) => {
    try {
      if (isDbMode) {
        if (dbUser) {
          await updateUserRole(userId, selectedRole);
        } else {
          await createUserProfile(userId, user.primaryEmailAddress?.emailAddress || "", user.fullName || user.username || "", selectedRole);
        }
        toast.success(`Profile registered as ${selectedRole.toUpperCase()}`);
        await loadAppData();
        router.push(selectedRole === "admin" ? "/admin" : selectedRole === "seller" ? "/seller" : "/");
        return true;
      } else {
        localStorage.setItem(`vehiql_role_${userId}`, selectedRole);
        toast.success(`Profile registered as ${selectedRole.toUpperCase()}`);
        await loadAppData();
        router.push(selectedRole === "admin" ? "/admin" : selectedRole === "seller" ? "/seller" : "/");
        return true;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to register role selection");
    }
    return false;
  };

  // Toggle vehicle in compare list (limit to 3)
  const toggleCompare = (carId) => {
    const idStr = String(carId);
    setCompareList((prev) => {
      if (prev.includes(idStr)) {
        toast.success("Removed from comparison list");
        return prev.filter((id) => id !== idStr);
      } else {
        if (prev.length >= 3) {
          toast.warning("You can compare up to 3 cars at a time.");
          return prev;
        }
        toast.success("Added to comparison list!");
        return [...prev, idStr];
      }
    });
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (carId) => {
    return compareList.includes(String(carId));
  };

  return (
    <AppContext.Provider
      value={{
        isDbMode,
        appLoading,
        dbUser,
        company,
        cars,
        savedCars,
        reservations,
        allReservations,
        toggleSaveCar,
        isCarSaved,
        addReservation,
        cancelReservation,
        addCar,
        updateCar,
        deleteCar,
        updateReservationStatus,
        registerCompanyProfile,
        registerUserRole,
        reloadAppData: loadAppData,
        compareList,
        toggleCompare,
        clearCompare,
        isInCompare
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
};
