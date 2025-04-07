import { Image } from "lucide-react";
import { ActionItem } from "./action-item";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { Button } from "./ui/button";

export function UploadIcon() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    if (!inputValue?.trim()) {
      return;
    }
    console.log("Submitted text:", inputValue);
    setOpen(false);
  };

  useEffect(() => {
    setInputValue("");
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <ActionItem>
        <Image size={20}  />
        <span className="font-medium">Upload</span>
      </ActionItem>
      </PopoverTrigger>
      <PopoverContent className="space-y-4">
        <div className="grid w-full lg:max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">Picture</Label>
          <Input id="picture" type="file" />
        </div>
        <Button className="w-full" onClick={handleSubmit}>
          Confirm
        </Button>
      </PopoverContent>
    </Popover>
  );
}