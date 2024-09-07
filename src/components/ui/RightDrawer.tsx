import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";

type Comment = {
  created_time: string;
  message: string;
  id: string;
};

type RightDrawerProps = {
  children: React.ReactNode;
  date: string;
  text: string;
  postId: string;
  fetchComments: (postId: string) => Promise<Comment[]>;
};

export default function RightDrawer({
  children,

  postId,
  fetchComments,
}: RightDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: comments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: isOpen,
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription>Comments for the post</SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {isLoading && <p>Loading comments...</p>}
          {error && <p>Error loading comments. Please try again.</p>}
          {comments && comments.length === 0 && <p>No comments found.</p>}
          {comments && comments.length > 0 && (
            <ul className="mt-2 space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="border-b pb-2">
                  <p className="text-sm">
                    {comment.message || "No Text is this comment"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_time).toLocaleString()}
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
