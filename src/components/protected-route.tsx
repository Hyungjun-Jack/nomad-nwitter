import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [approved, setApproved] = useState(false);
  const [login, setLogin] = useState({
    loading: true,
    login: false,
    approved: false,
  });

  useEffect(() => {
    console.log("useEffect");
    const _checkApprovedUser = async () => {
      const user = auth.currentUser;
      console.log({ user });

      if (user === null) {
        //   return <Navigate to={"/login"} />;
        setLogin({ loading: false, login: false, approved: false });
      } else {
        const userSnap = await getDoc(doc(db, "users", user?.uid));
        if (!userSnap.exists()) {
          //     return <Navigate to={"/login"} />;
          setLogin({ loading: false, login: true, approved: false });
        } else {
          const data = userSnap.data();
          console.log({ data });

          setLogin({ loading: false, login: true, approved: data.approved });

          //     return <Navigate to={"/login"} />;
        }
      }
    };

    _checkApprovedUser();
  }, []);

  return !login.approved ? (
    children
  ) : login.loading ? (
    "loading"
  ) : (
    <Navigate to={"/login"} />
  );
}
