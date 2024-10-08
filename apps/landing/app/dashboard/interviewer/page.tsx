"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import Schedule_Dialog from "@/appComponents/schedule_dialog";
import { useUser } from "@clerk/nextjs";
import { BaseUser, Meeting } from "@repo/types";
import axios from "axios";
import Header from "./header";
import Image from "next/image";
import pending from "@/public/pending_actions_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import group from "@/public/groups_24dp_00000_FILL0_wght400_GRAD0_opsz24.svg";
import settings from "@/public/settings_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import done from "@/public/done_all_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import help from "@/public/help_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import keyboard from "@/public/keyboard_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import EventDone from "@/public/event_available_24dp_00000_FILL0_wght400_GRAD0_opsz24.svg";
import WhitePending from "@/public/pending_in_white.svg";
import WhiteGroup from "@/public/group_in_white.svg";

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
  const [language, setLanguage] = useState("");
  const [value, setValue] = useState(getRandomId());
  const [allMeet, setAllMeet] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [focus, setFocus] = useState<"conduct" | "attend" | null>(null);
  const [currentUser, setCurrentUser] = useState<BaseUser | null>(null);
  const { user } = useUser();
  useEffect(() => {
    const addUserToDatabase = async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/addUser`,
        {
          email: user?.primaryEmailAddress?.emailAddress,
          name: user?.fullName,
        }
      );

      setCurrentUser(res.data.currUser);
    };
    addUserToDatabase();
  }, [user]);

  useEffect(() => {
    const handleInterviewsToConduct = async () => {
      try {
        if (!user) return;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/interviewsToConduct/${currentUser?.id}`
        );
        setAllMeet(res.data.allmeet);
        setFocus("conduct");
      } catch (error) {
        console.log("Error while fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };
    handleInterviewsToConduct();
  }, [user, user?.id, currentUser?.id]);

  const handleInterviewsToConduct = async (id: string | string[]) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/interviewsToConduct/${id}`
      );
      setAllMeet(res.data.allmeet);
      setFocus("conduct");
    } catch (error) {
      console.log("Error while handle Interviews to conduct", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewsToAttend = async (id: string | string[]) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/interviewsToAttend/${id}`
      );
      setAllMeet(res.data.allmeet);
      setFocus("attend");
    } catch (error) {
      console.log("Error while handle Interviews to Attend", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-2 h-[56rem] mx-4 my-4 rounded-3xl shadow-lg">
      <Header />
      <div className="flex">
        <div className="w-[20%] flex flex-col items-center justify-between py-14 divide-y">
          <div className="flex flex-col gap-4 w-[80%]">
            <div
              className={`hover:bg-black hover:text-white p-4 rounded-xl cursor-pointer flex gap-4 hover-effect ${
                focus === "conduct" ? "bg-black text-white" : ""
              }`}
              onClick={() =>
                handleInterviewsToConduct(currentUser?.id as string)
              }
            >
              {focus === "conduct" ? (
                <Image
                  src={WhiteGroup}
                  width={24}
                  height={24}
                  alt="pending meeting"
                />
              ) : (
                <Image
                  src={group}
                  width={24}
                  height={24}
                  alt="pending meeting"
                />
              )}
              Interviews to Conduct
            </div>
            <div
              className={`hover:bg-black hover:text-white p-4 rounded-xl cursor-pointer flex gap-4 hover-effect ${
                focus === "attend" ? "bg-black text-white" : ""
              }`}
              onClick={() =>
                handleInterviewsToAttend(currentUser?.id as string)
              }
            >
              {focus === "attend" ? (
                <Image
                  src={WhitePending}
                  width={24}
                  height={24}
                  alt="pending meeting"
                />
              ) : (
                <Image
                  src={pending}
                  width={24}
                  height={24}
                  alt="pending meeting"
                />
              )}
              Interviews to Attend
            </div>
            <div className="hover:bg-black hover:text-white p-4 rounded-xl cursor-pointer flex gap-4 hover-effect">
              <Image
                src={EventDone}
                width={24}
                height={24}
                alt="pending meeting"
              />
              Interviews Conducted
            </div>
            <div className="hover:bg-black hover:text-white p-4 rounded-xl cursor-pointer flex gap-4 hover-effect">
              <Image src={done} width={24} height={24} alt="pending meeting" />
              Interviews Attended
            </div>
          </div>
          <div className="flex flex-col gap-4 w-[80%]">
            <div className="hover:bg-black hover:text-white p-4 rounded-xl cursor-pointer flex gap-4 hover-effect">
              <Image
                src={keyboard}
                width={24}
                height={24}
                alt="pending meeting"
              />
              Keyboard Shortcuts
            </div>
            <div className="hover:bg-black hover:text-white p-4 rounded-xl cursor-pointer flex gap-4 hover-effect">
              <Image
                src={settings}
                width={24}
                height={24}
                alt="pending meeting"
              />
              Settings
            </div>
            <div className="hover:bg-black hover:text-white p-4 rounded-xl cursor-pointer flex gap-4 hover-effect">
              <Image src={help} width={24} height={24} alt="pending meeting" />
              Help center
            </div>
          </div>
        </div>
        <div className="border w-[80%] flex justify-center border-r-0 border-b-0 h-[49.8rem]">
          <div className="w-[90%] py-5">
            <Schedule_Dialog
              value={value}
              language={language}
              setLanguage={setLanguage}
              setValue={setValue}
              getRandomId={getRandomId}
              setAllMeet={setAllMeet}
              allMeet={allMeet}
              focus={focus}
            />
            <DataTable
              columns={columns(
                user?.fullName as string,
                setAllMeet,
                currentUser?.id as string,
                focus
              )}
              data={allMeet}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
