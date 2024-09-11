import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";

type Comment = {
  timestamp: string;
  text: string;
  id: string;
};

type RightDrawerProps = {
  children: React.ReactNode;
  comments: Comment[];
};

export default function InstagramRightDrawer({
  children,
  comments,
}: RightDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription>Comments for the post</SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {comments.length === 0 && <p>No comments found.</p>}
          {comments.length > 0 && (
            <ul className="mt-2 space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="border-b pb-2">
                  <p className="text-sm">
                    {comment.text || "No text in this comment"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
