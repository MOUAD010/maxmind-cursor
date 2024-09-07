import SimpleChart from "./chart/SimpleChart";
import BarCharts from "./chart/BarCharts";
import { useQuery } from "@tanstack/react-query";
import { getPostInsights } from "@/utils/api";

const PostAnalytics = ({ id_post }: { id_post: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["post", id_post],
    queryFn: () => getPostInsights(id_post),
  });

  if (isLoading) return <div>Loading...</div>;

  // Extract names from the data, handling different possible structures

  const item = { data };
  return (
    <div className="w-full h-full flex justify-center mt-2 gap-6">
      <div className="w-1/2 ">
        {/* {id_post} */}

        <SimpleChart states={item.data.data} />
      </div>
      <div className="w-1/2 flex flex-col items-center h-full justify-between">
        <div className="mb-2">
          <BarCharts />
        </div>
        <div className=" flex-grow">
          <BarCharts />
        </div>
      </div>
    </div>
  );
};

export default PostAnalytics;
