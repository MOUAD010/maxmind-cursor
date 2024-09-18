import React, { useCallback, useMemo } from "react";
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
import PageInfo from "./PageInfo";

// Define types for form data and API responses
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

// Function to fetch accounts from the API
const fetchAccounts = async (): Promise<Account[]> => {
  const response = await axios.post<ApiResponse>(
    "https://meta-api-eight.vercel.app/api/v1/accounts",
    { limit: "11", after: "", before: "" }
  );
  return response.data.data.data;
};

export function FilterBar() {
  const navigate = useNavigate();
  const [showResults, setShowResults] = React.useState(false);
  const [platform, setPlatform] = React.useState<
    "facebook" | "instagram" | null
  >(null);
  const [submittedData, setSubmittedData] = React.useState<FormData | null>(
    null
  );

  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      option: "",
      dateRange: null,
    },
  });

  const selectedOption = watch("option");
  const selectedDateRange = watch("dateRange");

  const isSubmitDisabled = !selectedOption || !selectedDateRange;

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const onSubmit = useCallback(
    (data: FormData, selectedPlatform: "facebook" | "instagram") => {
      console.log(data);
      const today = new Date();
      // Check if the endDate month is the current month and endDate is defined
      if (
        data.dateRange?.endDate &&
        new Date(data.dateRange.endDate).getMonth() === today.getMonth()
      ) {
        // Adjust the endDate to today's date
        data.dateRange.endDate = `${today.getFullYear()}-${(
          today.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
        setShowResults(true);
        setPlatform(selectedPlatform);
        setSubmittedData(data);
        // console.log("Updated endDate:", data.dateRange?.endDate);
      } else {
        setShowResults(true);
        setPlatform(selectedPlatform);
        setSubmittedData(data);
      }

      // Process form data, e.g., submit it or set states
    },
    []
  );

  React.useEffect(() => {
    if (error) console.error("Query error:", error);
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
          className="flex  w-[90%] items-center gap-4 p-4 bg-card rounded-lg shadow-md"
        >
          <div className="w-full flex-grow">
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
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <div className="flex ml-20 justify-start w-36 gap-4 mt-4">
        <Button
          className="flex-grow bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          id="submit-facebook"
          onClick={() => handleSubmit((data) => onSubmit(data, "facebook"))()}
          disabled={isSubmitDisabled}
        >
          <Facebook size={16} className="mr-1" />
          Generate Facebook
        </Button>
        <Button
          className="flex-grow bg-gradient-to-r from-[#f9ce34] to-[#ee2a7b] hover:from-[#f9ce34] hover:to-[#ee2a7b] disabled:opacity-50 disabled:cursor-not-allowed"
          id="submit-instagram"
          onClick={() => handleSubmit((data) => onSubmit(data, "instagram"))()}
          disabled={isSubmitDisabled}
        >
          <Instagram className="mr-1" size={16} /> Generate Instagram
        </Button>
      </div>

      {showResults && platform && submittedData && (
        <div className="mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageInfo
            pageId={submittedData.option}
            dateRange={submittedData.dateRange}
            platform={platform}
          />
          <div className="mt-8 mb-8">
            <FeedDisplay
              accountId={submittedData.option}
              dateRange={submittedData.dateRange}
              platform={platform}
            />
          </div>
        </div>
      )}
    </>
  );
}
