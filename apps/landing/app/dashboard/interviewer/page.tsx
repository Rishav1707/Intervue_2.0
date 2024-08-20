"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import Schedule_Dialog from "@/appComponents/schedule_dialog";
import { useUser } from "@clerk/nextjs";
import { Meeting } from "@repo/types";
import axios from "axios";
import Header from "./header";

function getRandomId() {
  const SLUG_WORKS = [
    "cool",
    "coder",
    "awesome",
    "cringe",
    "worker",
    "intelligent",
    "rider",
    "load",
    "network",
    "open",
    "source",
  ];
  let slug = "";
  for (let i = 0; i < 3; i++) {
    slug += SLUG_WORKS[Math.floor(Math.random() * SLUG_WORKS.length)];
  }
  return slug;
}

export default function DemoPage() {
  // const data = await getData();
  const [language, setLanguage] = useState("");
  const [value, setValue] = useState(getRandomId());
  const user = useUser();
  const [allMeet, setAllMeet] = useState<Meeting[]>([]);

  useEffect(() => {
    const getUserMeet = async () => {
      try {
        const res = await axios.get("http://localhost:8000/allMeet");
        console.log(res.data.allmeet);
        setAllMeet(res.data.allmeet);
      } catch (error) {
        console.log("Error while fetching data", error);
      }
    };
    getUserMeet();
  }, []);

  return (
    <div className="border-2 h-[56rem] mx-4 my-4 rounded-3xl">
      <Header />
      <div className="flex justify-end">
        <div className="border w-[80%] flex justify-center border-r-0 h-[47rem]">
          <div className="w-[90%] py-5">
            <Schedule_Dialog
              value={value}
              language={language}
              setLanguage={setLanguage}
              setValue={setValue}
              getRandomId={getRandomId}
              setAllMeet={setAllMeet}
              allMeet={allMeet}
            />
            <DataTable
              columns={columns(
                value,
                user.user?.fullName as string,
                setAllMeet
              )}
              data={allMeet.map((meet) => {
                return meet;
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
