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
import { Users, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [showResults, setShowResults] = useState(false);

  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      option: "",
      dateRange: null,
    },
  });

  const selectedOption = watch("option");

  const {
    data: accounts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
  });

  const { data: pageInfo, isLoading: pageInfoLoading } = useQuery({
    queryKey: ["pageInfo", selectedOption],
    queryFn: () =>
      axios
        .get(`https://meta-api-eight.vercel.app/api/v1/page/${selectedOption}`)
        .then((res) => res.data.data),
    enabled: !!selectedOption,
  });

  const onSubmit = useCallback((data: FormData) => {
    console.log(data);
    setSelectedAccount(data.option);
    setSelectedDateRange(data.dateRange);
    setShowResults(true);
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
            <Button
              className="flex-grow"
              id="submit"
              onClick={handleSubmit(onSubmit)}
            >
              Generate
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-grow"
                  disabled={!selectedOption}
                >
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle className="pb-4">Page Preview</DialogTitle>
                  <div>
                    {pageInfoLoading ? (
                      <div>Loading page info...</div>
                    ) : pageInfo ? (
                      <div className="space-y-4">
                        <img
                          src={pageInfo.cover?.source}
                          alt="Page Cover"
                          className="w-full h-64 object-fit rounded-md"
                        />
                        <h1 className="text-xl  text-black font-semibold">
                          {pageInfo.name}
                        </h1>
                        <div className="text-base text-gray-600">
                          {pageInfo.about}
                        </div>
                        <div className="flex justify-between text-base">
                          <div className="flex items-center bg-gray-200 p-2 rounded-md my-2  ">
                            <Users className="w-5 h-5 mr-2" />
                            <span>{pageInfo.fan_count} fans</span>
                          </div>
                          <div className="flex items-center bg-gray-200 p-2 rounded-md my-2">
                            <UserPlus className="w-5 h-5 mr-2" />
                            <span>{pageInfo.followers_count} followers</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>No page info available</div>
                    )}
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {showResults && (
        <div className="mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageInfo pageId={selectedAccount} dateRange={selectedDateRange} />
          <div className="mt-8">
            <FeedDisplay
              accountId={selectedAccount}
              dateRange={selectedDateRange}
            />
          </div>
        </div>
      )}
    </>
  );
}
