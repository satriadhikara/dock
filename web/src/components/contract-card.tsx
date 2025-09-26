import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ContractCardProps {
  company: string;
  title: string;
  createdAt: string;
  avatars?: Array<{ imageUrl?: string; fallback: string }>;
  badgeClassName?: string;
}

export function ContractCard({
  company,
  title,
  createdAt,
  avatars = [],
  badgeClassName = "bg-[#EBE9FE]",
}: ContractCardProps) {
  return (
    <div className="gap-3 mt-4">
      <Card className="p-4 gap-0">
        <CardTitle
          className={`text-xs ${badgeClassName} w-fit py-1 px-2.5 rounded-[30px] mb-3`}
        >
          {company}
        </CardTitle>
        <CardContent className="p-0 font-semibold text-xl">{title}</CardContent>
        <CardDescription>Created on {createdAt}</CardDescription>
        <CardFooter className="mt-3 p-0 justify-end *:data-[slot=avatar]:ring-background flex -space-x-3.5 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
          {avatars.length === 0 ? (
            <>
              <Avatar>
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </>
          ) : (
            avatars.map((a, idx) => (
              <Avatar key={idx}>
                {a.imageUrl ? (
                  <AvatarImage src={a.imageUrl} alt="" />
                ) : (
                  <AvatarFallback>{a.fallback}</AvatarFallback>
                )}
              </Avatar>
            ))
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
