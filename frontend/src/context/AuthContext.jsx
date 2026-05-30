import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import {
  apiSignup, apiLogin, apiGoogleAuth, apiGetProfile, apiUpdateProfile,
  apiCalculateBMI, apiGetBMIHistory, apiGetProducts, apiAddProduct,
  apiUpdateProduct, apiDeleteProduct, apiPlaceOrder, apiGetMyOrders,
  apiGetAllOrders, apiUpdateOrderStatus, apiGetAllUsers, apiDeleteUser,
  apiGetWellnessContent, apiAddWellnessContent, apiUpdateWellnessContent,
  apiDeleteWellnessContent, setToken, removeToken, getToken
} from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth functions
  const signup = async (email, password, additionalData) => {
    const result = await apiSignup({ email, password, ...additionalData });
    setToken(result.token);
    setCurrentUser({ uid: result.user.uid, email: result.user.email, displayName: result.user.name });
    // Auto-fetch userData so dashboard has health data immediately
    try { await fetchUserData(); } catch (e) {}
    return result;
  };

  const login = async (email, password) => {
    const result = await apiLogin(email, password);
    setToken(result.token);
    setCurrentUser({ uid: result.user.uid, email: result.user.email, displayName: result.user.name });
    // Auto-fetch userData so dashboard has data immediately
    try { await fetchUserData(); } catch (e) {}
    return result;
  };

  const loginWithGoogle = async () => {
    const firebaseResult = await signInWithPopup(auth, googleProvider);
    const user = firebaseResult.user;
    const result = await apiGoogleAuth({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    });
    setToken(result.token);
    setCurrentUser({ uid: result.user.uid, email: result.user.email, displayName: result.user.name });
    try { await fetchUserData(); } catch (e) {}
    return result;
  };

  const logout = async () => {
    try { await signOut(auth); } catch (e) {}
    removeToken();
    setCurrentUser(null);
    setUserData(null);
  };

  const fetchUserData = async () => {
    try {
      const data = await apiGetProfile();
      setUserData(data);
      // Also ensure currentUser is set
      if (!currentUser && data) {
        setCurrentUser({ uid: data.id, email: data.email, displayName: data.name });
      }
      return data;
    } catch (e) { return null; }
  };

  const updateUserData = async (uid, data) => {
    await apiUpdateProfile(data);
    setUserData(prev => ({ ...prev, ...data }));
  };

  // BMI
  const saveBMIRecord = async (uid, bmiData) => {
    return await apiCalculateBMI(bmiData.weight, bmiData.height);
  };
  const getBMIRecords = async () => await apiGetBMIHistory();

  // Products
  const getProducts = async () => {
    try { return await apiGetProducts(); } catch (e) { return []; }
  };
  const addProduct = async (product) => await apiAddProduct(product);
  const updateProduct = async (id, data) => await apiUpdateProduct(id, data);
  const deleteProduct = async (id) => await apiDeleteProduct(id);

  // Orders
  const placeOrder = async (orderData) => await apiPlaceOrder(orderData);
  const getUserOrders = async () => await apiGetMyOrders();
  const getAllOrders = async () => await apiGetAllOrders();
  const updateOrderStatus = async (id, status) => await apiUpdateOrderStatus(id, status);

  // Admin
  const getAllUsers = async () => await apiGetAllUsers();
  const deleteUser = async (uid) => await apiDeleteUser(uid);

  // Wellness
  const getWellnessContent = async (type) => {
    try { return await apiGetWellnessContent(type); } catch (e) { return []; }
  };
  const addWellnessContent = async (type, data) => await apiAddWellnessContent(type, data);
  const updateWellnessContent = async (type, id, data) => await apiUpdateWellnessContent(type, id, data);
  const deleteWellnessContent = async (type, id) => await apiDeleteWellnessContent(type, id);

  useEffect(() => {
    let tokenRecoveryDone = false;

    // Step 1: Check for existing JWT token on mount (handles email/password login persistence)
    const token = getToken();
    if (token) {
      fetchUserData().then(data => {
        if (data) {
          setCurrentUser({ uid: data.id, email: data.email, displayName: data.name });
        } else {
          // Token is invalid or expired
          removeToken();
          setCurrentUser(null);
          setUserData(null);
        }
        tokenRecoveryDone = true;
        setLoading(false);
      }).catch(() => {
        removeToken();
        setCurrentUser(null);
        setUserData(null);
        tokenRecoveryDone = true;
        setLoading(false);
      });
    } else {
      tokenRecoveryDone = true;
    }

    // Step 2: Listen for Firebase auth state (mainly for Google sign-in)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && getToken()) {
        // Firebase user exists with a token — set currentUser if not already set
        setCurrentUser(prev => prev || { uid: user.uid, email: user.email, displayName: user.displayName });
        if (!userData) {
          try { await fetchUserData(); } catch (e) {}
        }
        setLoading(false);
      } else if (!getToken()) {
        // No token and no Firebase user — truly logged out
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
      } else {
        // Has token but no Firebase user (email/password login) — let token recovery handle it
        // Only set loading false if token recovery is already done
        if (tokenRecoveryDone) {
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser, userData, loading,
    signup, login, loginWithGoogle, logout,
    fetchUserData, updateUserData,
    saveBMIRecord, getBMIRecords,
    getProducts, addProduct, updateProduct, deleteProduct,
    placeOrder, getUserOrders, getAllOrders, updateOrderStatus,
    getAllUsers, deleteUser,
    getWellnessContent, addWellnessContent, updateWellnessContent, deleteWellnessContent
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
