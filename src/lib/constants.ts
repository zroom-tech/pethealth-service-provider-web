import {
  LayoutDashboard,
  Stethoscope,
  Scissors,
  Hotel,
  Users,
  Settings,
} from "lucide-react";

export const PAGE_SIZE = 20;

export const CATEGORIES = [
  { value: "동물미용", label: "동물미용" },
  { value: "동물병원", label: "동물병원" },
  { value: "동물호텔", label: "동물호텔" },
  { value: "용품판매점", label: "용품판매점" },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객 관리", icon: Users },
  { href: "/checkup-records", label: "진단 기록", icon: Stethoscope },
  { href: "/grooming-records", label: "미용 기록", icon: Scissors },
  { href: "/hotel-records", label: "호텔링 기록", icon: Hotel },
  { href: "/settings", label: "설정", icon: Settings },
] as const;
