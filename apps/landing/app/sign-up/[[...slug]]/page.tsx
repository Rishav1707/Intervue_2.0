"use client";

import { SignUp } from "@clerk/nextjs";
import axios from "axios";
import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const addUserToDatabase = async () => {
      const user = await getUserFromClerk();

      axios
        .post("http://localhost:8000/addUser", {
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        })
        .then(() => console.log("User added to the database"))
        .catch((err) => console.log(err));
    };

    const getUserFromClerk = async () => {
      const { data } = await axios.get("/api/clerk/session");
      return data.user;
    };

    addUserToDatabase();
  }, []);

  return (
    <div className="flex flex-col justify-center h-screen w-full items-center">
      <SignUp />
    </div>
  );
};

export default Page;
