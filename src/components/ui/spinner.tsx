import React from "react";
import { Loader2 } from "lucide-react";

const spinner = () => {
  return (
    <div>
      <div className=" flex justify-center mt-8 ">
        {/* <div className=" bg-blue-500 w-20 h-20 rounded-full flex justify-center items-center animate-bounce">
          <p className=" p-4 m-4 text-white">Loading..</p>
        </div> */}
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-center animate-pulse">
            Loading your content...
          </p>
        </div>
      </div>
    </div>
  );
};

export default spinner;
