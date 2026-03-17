"use client";

import { useActionState, useState, useTransition } from "react";
import { login, signup, checkEmail } from "./actions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, PawPrint, XCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export default function LoginPage() {
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    null,
  );
  const [category, setCategory] = useState("");
  const [emailCheck, setEmailCheck] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  const [checkingEmail, startCheckEmail] = useTransition();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* 브랜드 헤더 */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">키니로그 파트너스</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            반려동물 건강 서비스 제공자 관리
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          {/* 로그인 탭 */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>
                  이메일과 비밀번호로 로그인하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={loginAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">이메일</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">비밀번호</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="비밀번호 입력"
                      required
                    />
                  </div>
                  {loginState?.error && (
                    <p className="text-sm text-destructive">
                      {loginState.error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginPending}
                  >
                    {loginPending ? "로그인 중..." : "로그인"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>회원가입</CardTitle>
                <CardDescription>
                  사업체 정보를 입력하고 계정을 생성하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={signupAction} className="space-y-4">
                  {/* 계정 정보 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일 *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        required
                        onChange={() => setEmailCheck(null)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={checkingEmail}
                        onClick={() => {
                          const email = (
                            document.getElementById(
                              "signup-email",
                            ) as HTMLInputElement
                          )?.value;
                          startCheckEmail(async () => {
                            const result = await checkEmail(email);
                            setEmailCheck(result);
                          });
                        }}
                      >
                        {checkingEmail ? "확인 중..." : "중복확인"}
                      </Button>
                    </div>
                    {emailCheck && (
                      <p
                        className={`flex items-center gap-1 text-sm ${emailCheck.available ? "text-secondary" : "text-destructive"}`}
                      >
                        {emailCheck.available ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <XCircle className="size-3.5" />
                        )}
                        {emailCheck.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호 *</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="8자 이상"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password-confirm">
                      비밀번호 확인 *
                    </Label>
                    <Input
                      id="signup-password-confirm"
                      name="passwordConfirm"
                      type="password"
                      placeholder="비밀번호 재입력"
                      required
                      minLength={8}
                    />
                  </div>

                  <Separator />

                  {/* 사업체 기본 정보 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">사업체명 *</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
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
                    <Label htmlFor="signup-phone">전화번호</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="02-1234-5678"
                    />
                  </div>

                  <Separator />

                  {/* 주소 */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="signup-country">국가</Label>
                      <Input
                        id="signup-country"
                        name="country"
                        type="text"
                        placeholder="대한민국"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-city">도시</Label>
                      <Input
                        id="signup-city"
                        name="city"
                        type="text"
                        placeholder="서울특별시"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-address1">주소</Label>
                    <Input
                      id="signup-address1"
                      name="address1"
                      type="text"
                      placeholder="도로명 주소"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-address2">상세 주소</Label>
                    <Input
                      id="signup-address2"
                      name="address2"
                      type="text"
                      placeholder="건물명, 층, 호수"
                    />
                  </div>

                  <Separator />

                  {/* 추가 정보 */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-instagram">인스타그램 URL</Label>
                    <Input
                      id="signup-instagram"
                      name="instagram_url"
                      type="url"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-website">웹사이트 URL</Label>
                    <Input
                      id="signup-website"
                      name="website_url"
                      type="url"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-description">사업체 소개</Label>
                    <Textarea
                      id="signup-description"
                      name="description"
                      placeholder="사업체를 간단히 소개해주세요"
                      rows={3}
                    />
                  </div>

                  {signupState?.error && (
                    <p className="text-sm text-destructive">
                      {signupState.error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signupPending}
                  >
                    {signupPending ? "가입 중..." : "회원가입"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
