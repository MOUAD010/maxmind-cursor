import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";

export default function RightDrawer({ children }: any) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Right Drawer</SheetTitle>
          <SheetDescription>
            This is a drawer that appears from the right side of the screen.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <h3 className="text-lg font-medium">Drawer Content</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You can add any content you want in this drawer. For example,
            navigation links, forms, or any other components.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
