import React from "react";
import Image from "next/image";
import mySpinnerImage from "@/app/CircleLogo.png"; // Adjust the path to your image

export default function Spinner() {
  return (
    <div className="flex justify-center items-center h-full">
      <Image
        src={mySpinnerImage}
        alt="Loading..."
        className="h-8 w-8 animate-spin"
      />
    </div>
  );
}
