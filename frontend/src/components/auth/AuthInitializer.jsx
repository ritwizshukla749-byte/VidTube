import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { loginSuccess, setLoading } from "../../store/authSlice.js";
import { getCurrentUser } from "../../services/auth.services.js";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true));

      try {
        const response = await getCurrentUser();

        dispatch(loginSuccess(response.data));
      } catch (error) {
        //User is not logged in or token is invalid,
        // handle the error if needed.
      } finally {
        dispatch(setLoading(false));
      }
    };
    initializeAuth();
  }, [dispatch]);
  return children;
}

export default AuthInitializer;
