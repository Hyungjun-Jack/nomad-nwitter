import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Button = styled.span`
  margin-top: 50px;
  background-color: white;
  font-weight: 500;
  width: 100%;
  color: black;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 50px;
  border: 0;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 25px;
`;

export default function GithubButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider();
      const credentials = await signInWithPopup(auth, provider);
      //   await signInWithRedirect(auth, provider);

      const user = credentials.user;

      //   firebase.firestore().collection("users").doc(user.uid).set({
      //     email: user.email,
      //     isApproved: false,
      //   });

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      console.log({ docRef, docSnap });

      if (docSnap.exists()) {
        console.log(docSnap.data());
      } else {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          username: user.displayName || "Anonymous",
          userId: user.uid,
          isApproved: false,
        });
      }

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button onClick={onClick}>
      <Logo src="/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
