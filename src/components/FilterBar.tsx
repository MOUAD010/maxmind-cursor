import React, { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import MonthsRangePicker from "@/components/ui/MonthsRangePicker";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FeedDisplay } from "./FeedDisplay";
import { Facebook, Instagram } from "lucide-react";
// import { Users, UserPlus } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
import PageInfo from "./PageInfo"; // We'll create this component

type FormData = {
  option: string;
  dateRange: { startDate: string; endDate: string } | null;
};

type Account = {
  name: string;
  id: string;
};

type ApiResponse = {
  data: {
    data: Account[];
  };
};

const fetchAccounts = async (): Promise<Account[]> => {
  const response = await axios.post<ApiResponse>(
    "https://meta-api-eight.vercel.app/api/v1/accounts",
    {
      limit: "11",
      after: "",
      before: "",
    }
  );
  return response.data.data.data;
};

export function FilterBar() {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [platform, setPlatform] = useState<"facebook" | "instagram" | null>(
    null
  );

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      option: "",
      dateRange: null,
    },
  });

  // const selectedOption = watch("option");

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  // const { data: pageInfo, isLoading: pageInfoLoading } = useQuery({
  //   queryKey: ["pageInfo", selectedOption],
  //   queryFn: () =>
  //     axios
  //       .get(`https://meta-api-eight.vercel.app/api/v1/page/${selectedOption}`)
  //       .then((res) => res.data.data),
  //   enabled: !!selectedOption,
  // });

  const onSubmit = useCallback(
    (data: FormData, platform: "facebook" | "instagram") => {
      console.log(data);
      setSelectedAccount(data.option);
      setSelectedDateRange(data.dateRange);
      setShowResults(true);
      setPlatform(platform);
    },
    []
  );

  React.useEffect(() => {
    if (error) {
      console.error("Query error:", error);
    }
  }, [error]);

  const selectOptions = useMemo(() => {
    if (isLoading)
      return [
        <SelectItem key="loading" value="loading">
          Loading...
        </SelectItem>,
      ];
    if (!accounts || accounts.length === 0)
      return [
        <SelectItem key="no-accounts" value="no-accounts">
          No accounts found
        </SelectItem>,
      ];
    return accounts.map((account) => (
      <SelectItem key={account.id} value={account.id}>
        {account.name}
      </SelectItem>
    ));
  }, [isLoading, accounts]);

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <>
      <div className="flex justify-center" id="filter-bar">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex    flex-wrap w-[90%] items-center gap-4 p-4 bg-card rounded-lg shadow-md"
        >
          <div className="w-fuul flex-grow">
            <Controller
              name="option"
              control={control}
              render={({ field }) => (
                <Select
                  name="option-select"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>{selectOptions}</SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="w-auto flex justify-center">
            <Controller
              name="dateRange"
              control={control}
              render={({ field }) => (
                <MonthsRangePicker
                  selectedDate={field.value}
                  onRangeChange={field.onChange}
                />
              )}
            />
          </div>

          <motion.div
            className="w-full sm:w-auto flex gap-2 mt-4 sm:mt-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={() => setShowButton(true)}>Generate</Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </motion.div>
        </motion.div>
      </div>
      {showButton && (
        <div>
          <div className="flex ml-20 justify-start w-36 gap-4 mt-4">
            <Button
              className="flex-grow bg-blue-600 hover:bg-blue-700"
              id="submit-facebook"
              onClick={() =>
                handleSubmit((data) => onSubmit(data, "facebook"))()
              }
            >
              <Facebook size={16} className="mr-1" />
              Generate Facebook
            </Button>
            <Button
              className="flex-grow bg-gradient-to-r from-[#f9ce34] to-[#ee2a7b] hover:from-[#f9ce34] hover:to-[#ee2a7b]"
              id="submit-instagram"
              onClick={() =>
                handleSubmit((data) => onSubmit(data, "instagram"))()
              }
            >
              <Instagram className="mr-1" size={16} /> Generate Instagram
            </Button>
          </div>
        </div>
      )}
      {showResults && platform && (
        <div className="mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageInfo
            pageId={selectedAccount}
            dateRange={selectedDateRange}
            platform={platform}
          />
          <div className="mt-8 mb-8">
            <FeedDisplay
              accountId={selectedAccount}
              dateRange={selectedDateRange}
              platform={platform}
            />
          </div>
        </div>
      )}
    </>
  );
}
