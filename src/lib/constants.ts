import {
  LayoutDashboard,
  Stethoscope,
  Scissors,
  Hotel,
  Users,
  Dog,
  Building2,
  Settings,
} from "lucide-react";

export const PAGE_SIZE = 20;

export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객 관리", icon: Users },
  { href: "/pets", label: "반려동물", icon: Dog },
  { href: "/checkup-records", label: "진단 기록", icon: Stethoscope },
  { href: "/grooming-records", label: "미용 기록", icon: Scissors },
  { href: "/hotel-records", label: "호텔링 기록", icon: Hotel },
  { href: "/business", label: "사업체 정보", icon: Building2 },
  { href: "/settings", label: "설정", icon: Settings },
] as const;
