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
      limit: "10",
      after: "",
      before: "",
    }
  );
  return response.data.data.data;
};

export function FilterBar() {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      option: "",
      dateRange: null,
    },
  });

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const onSubmit = useCallback((data: FormData) => {
    console.log(data);
    setSelectedAccount(data.option);
    setSelectedDateRange(data.dateRange);
  }, []);

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
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap w-[90%] items-center gap-4 p-4 bg-card rounded-lg shadow-md"
        >
          <div className="w-fuul flex-grow">
            <Controller
              name="option"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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
            <Button className="flex-grow" onClick={handleSubmit(onSubmit)}>
              Generate
            </Button>
            <Button variant="outline" className="flex-grow">
              Preview
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <FeedDisplay accountId={selectedAccount} dateRange={selectedDateRange} />
    </>
  );
}
