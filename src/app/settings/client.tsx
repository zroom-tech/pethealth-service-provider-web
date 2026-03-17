"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { updatePartner, changePassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

interface Partner {
  id: number;
  email: string;
  name: string;
  category: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  address1: string | null;
  address2: string | null;
  instagram_url: string | null;
  website_url: string | null;
  description: string | null;
}

export function SettingsForm({ partner }: { partner: Partner }) {
  const [category, setCategory] = useState(partner.category);
  const [profileState, profileAction, profilePending] = useActionState(
    updatePartner,
    null,
  );
  const [pwState, pwAction, pwPending] = useActionState(changePassword, null);

  useEffect(() => {
    if (profileState?.success) toast.success("파트너 정보가 수정되었습니다.");
    if (profileState?.error) toast.error(profileState.error);
  }, [profileState]);

  useEffect(() => {
    if (pwState?.success) toast.success("비밀번호가 변경되었습니다.");
    if (pwState?.error) toast.error(pwState.error);
  }, [pwState]);

  const qrRef = useRef<HTMLCanvasElement>(null);
  const deepLink = `keenylog://partner/${partner.id}`;

  const handleDownloadQR = useCallback(() => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `partner-qr-${partner.id}.png`;
    a.click();
  }, [partner.id]);

  return (
    <div className="space-y-6">
      {/* QR 코드 */}
      <Card>
        <CardHeader>
          <CardTitle>고객 등록 QR 코드</CardTitle>
          <CardDescription>
            고객이 키니로그 앱으로 QR 코드를 스캔하면 자동으로 고객으로
            등록됩니다
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="rounded-lg border bg-white p-4">
            <QRCodeCanvas
              ref={qrRef}
              value={deepLink}
              size={200}
              level="H"
              marginSize={2}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {deepLink}
          </p>
          <Button variant="outline" size="sm" onClick={handleDownloadQR}>
            <Download className="mr-2 size-4" />
            QR 코드 다운로드
          </Button>
        </CardContent>
      </Card>

      {/* 파트너 정보 수정 */}
      <Card>
        <CardHeader>
          <CardTitle>파트너 정보</CardTitle>
          <CardDescription>사업체의 기본 정보를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            {/* 이메일 (읽기 전용) */}
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input value={partner.email} disabled />
              <p className="text-xs text-muted-foreground">
                이메일은 변경할 수 없습니다
              </p>
            </div>

            <Separator />

            {/* 사업체 기본 정보 */}
            <div className="space-y-2">
              <Label htmlFor="name">사업체명 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={partner.name}
                placeholder="사업체 이름"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>업종 *</Label>
              <input type="hidden" name="category" value={category} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="업종을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={partner.phone ?? ""}
                placeholder="02-1234-5678"
              />
            </div>

            <Separator />

            {/* 주소 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">국가</Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  defaultValue={partner.country ?? ""}
                  placeholder="대한민국"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">도시</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue={partner.city ?? ""}
                  placeholder="서울특별시"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address1">주소</Label>
              <Input
                id="address1"
                name="address1"
                type="text"
                defaultValue={partner.address1 ?? ""}
                placeholder="도로명 주소"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2">상세 주소</Label>
              <Input
                id="address2"
                name="address2"
                type="text"
                defaultValue={partner.address2 ?? ""}
                placeholder="건물명, 층, 호수"
              />
            </div>

            <Separator />

            {/* 추가 정보 */}
            <div className="space-y-2">
              <Label htmlFor="instagram_url">인스타그램 URL</Label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                defaultValue={partner.instagram_url ?? ""}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">웹사이트 URL</Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                defaultValue={partner.website_url ?? ""}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">사업체 소개</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={partner.description ?? ""}
                placeholder="사업체를 간단히 소개해주세요"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={profilePending}>
              {profilePending ? "저장 중..." : "저장"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 */}
      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
          <CardDescription>계정 비밀번호를 변경합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={pwAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="현재 비밀번호 입력"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="8자 이상"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPasswordConfirm">새 비밀번호 확인</Label>
              <Input
                id="newPasswordConfirm"
                name="newPasswordConfirm"
                type="password"
                placeholder="새 비밀번호 재입력"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" disabled={pwPending}>
              {pwPending ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
