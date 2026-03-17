import Link from "next/link";
import { getCustomerDetail } from "../actions";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Cat, Dog } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

function speciesLabel(species: string | null) {
  if (species === "dog") return "강아지";
  if (species === "cat") return "고양이";
  return species ?? "-";
}

function genderLabel(gender: string | null) {
  if (gender === "male") return "수컷";
  if (gender === "female") return "암컷";
  return gender ?? "-";
}

function calcAge(birthDate: string | null): string {
  if (!birthDate) return "-";
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months}개월`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining > 0 ? `${years}세 ${remaining}개월` : `${years}세`;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const userId = Number(id);
  const { user, pets } = await getCustomerDetail(userId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* 뒤로가기 */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/customers">
          <ArrowLeft className="mr-1 size-4" />
          고객 목록
        </Link>
      </Button>

      {/* 고객 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>고객 정보</CardTitle>
          <CardDescription>사용자 기본 정보</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground">이름</span>
            <span>{user.name || "-"}</span>
            <span className="text-muted-foreground">닉네임</span>
            <span>{user.user_name || "-"}</span>
            <span className="text-muted-foreground">이메일</span>
            <span>{user.email || "-"}</span>
            <span className="text-muted-foreground">전화번호</span>
            <span>{user.phone || "-"}</span>
            <span className="text-muted-foreground">가입일</span>
            <span>{formatDate(user.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 반려동물 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>반려동물 ({pets.length})</CardTitle>
          <CardDescription>등록된 반려동물 목록</CardDescription>
        </CardHeader>
        <CardContent>
          {pets.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              등록된 반려동물이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {pets.map((pet, index) => (
                <div key={pet.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {pet.species === "cat" ? (
                        <Cat className="size-5 text-muted-foreground" />
                      ) : (
                        <Dog className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{pet.name}</span>
                        <Badge variant="secondary">
                          {speciesLabel(pet.species)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1 text-sm">
                        <span className="text-muted-foreground">품종</span>
                        <span>{pet.breed || "-"}</span>
                        <span className="text-muted-foreground">성별</span>
                        <span>{genderLabel(pet.gender)}</span>
                        <span className="text-muted-foreground">나이</span>
                        <span>{calcAge(pet.birth_date)}</span>
                        <span className="text-muted-foreground">체중</span>
                        <span>
                          {pet.weight_kg ? `${pet.weight_kg}kg` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
