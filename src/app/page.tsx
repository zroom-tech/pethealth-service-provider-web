import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Stethoscope,
  Scissors,
  Hotel,
  Users,
  Dog,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardPage() {
  const cards = [
    {
      title: "고객 수",
      count: 0,
      icon: Users,
    },
    {
      title: "반려동물",
      count: 0,
      icon: Dog,
    },
    {
      title: "진단 기록",
      count: 0,
      icon: Stethoscope,
    },
    {
      title: "미용 기록",
      count: 0,
      icon: Scissors,
    },
    {
      title: "호텔링 기록",
      count: 0,
      icon: Hotel,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="size-6" />
        <h1 className="text-2xl font-bold">대시보드</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.count.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
