import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";

import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  Error,
  Form,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";
import { doc, getDoc, setDoc } from "firebase/firestore";

// const Wrapper = styled.div`
//   height: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 420px;
//   padding: 50px 0px;
// `;

// const Title = styled.h1`
//   font-size: 42px;
// `;

// const Form = styled.form`
//   margin-top: 50px;
//   margin-bottom: 10px;
//   display: flex;
//   flex-direction: column;
//   gap: 10px;
//   width: 100%;
// `;

// const Input = styled.input`
//   padding: 10px 20px;
//   border-radius: 50px;
//   border: none;
//   /* width: 100%; */
//   font-size: 16px;
//   &[type="submit"] {
//     cursor: pointer;
//     &:hover {
//       opacity: 0.8;
//     }
//   }
// `;

// const Error = styled.span`
//   font-weight: 600;
//   color: tomato;
// `;

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isLoading || name === "" || email === "" || password === "") return;

    try {
      setLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(credentials.user);

      await updateProfile(credentials.user, {
        displayName: name,
      });

      const user = credentials.user;

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
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e.code, e.message);
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Wrapper>
      <Title>Join 𝕏</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="name"
          value={name}
          placeholder="Name"
          type="text"
          required
        />
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          value={password}
          name="password"
          placeholder="Password"
          type="password"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Create Account"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Already have an account? <Link to="/login">Log in &rarr;</Link>
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
