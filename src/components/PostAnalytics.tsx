import SimpleChart from "./chart/SimpleChart";
import BarCharts from "./chart/BarCharts";
const PostAnalytics = () => {
  return (
    <div className="w-full h-full flex justify-center mt-2 gap-6">
      <div className="w-1/2 ">
        <SimpleChart />
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
