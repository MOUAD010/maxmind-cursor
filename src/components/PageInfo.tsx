import React from "react";
import FacebookPageInfo from "./PageInfo/FacebookPageInfo";
import InstagramPageInfo from "./PageInfo/InstagramPageInfo";

type PageInfoProps = {
  pageId: string;
  dateRange: { startDate: string; endDate: string } | null;
  platform: "facebook" | "instagram";
};

const PageInfo: React.FC<PageInfoProps> = ({ pageId, dateRange, platform }) => {
  return (
    <div className="">
      {platform === "facebook" ? (
        <FacebookPageInfo pageId={pageId} dateRange={dateRange} />
      ) : (
        <InstagramPageInfo pageId={pageId} dateRange={dateRange} />
      )}
    </div>
  );
};

export default PageInfo;
