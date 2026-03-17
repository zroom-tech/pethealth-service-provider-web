"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { updateCheckupRecord } from "../actions";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { compressImage } from "@/lib/image";

interface Record {
  id: number;
  checkupDate: string;
  description: string | null;
  imageUrls: string[];
  petProfileId: number | null;
}

interface Customer {
  id: number;
  name: string | null;
  userName: string | null;
}

interface Pet {
  id: number;
  name: string;
  species: string | null;
  breed: string | null;
}

export function CheckupDetailForm({
  record,
  customer,
  pet,
  pets,
}: {
  record: Record;
  customer: Customer;
  pet: Pet | null;
  pets: Pet[];
}) {
  const router = useRouter();
  const [state, rawFormAction, pending] = useActionState(
    updateCheckupRecord,
    null,
  );

  const [selectedPetId, setSelectedPetId] = useState(
    record.petProfileId ? String(record.petProfileId) : "",
  );

  // 기존 이미지 URL + 새 이미지 프리뷰
  const [existingUrls, setExistingUrls] = useState<string[]>(record.imageUrls);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingUrls.length + newPreviews.length;

  useEffect(() => {
    if (state?.success) {
      toast.success("진단 기록이 수정되었습니다.");
      router.push("/checkup-records");
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setCompressing(true);
    try {
      const newFiles: File[] = [];
      const previews: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        newFiles.push(compressed);
        previews.push(URL.createObjectURL(compressed));
      }
      setCompressedFiles((prev) => [...prev, ...newFiles].slice(0, 10 - existingUrls.length));
      setNewPreviews((prev) => [...prev, ...previews].slice(0, 10 - existingUrls.length));
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeExisting = (index: number) => {
    setExistingUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNew = (index: number) => {
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    setCompressedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    formData.delete("images");
    for (const file of compressedFiles) {
      formData.append("images", file);
    }
    // 기존 URL 유지
    formData.delete("existing_urls");
    for (const url of existingUrls) {
      formData.append("existing_urls", url);
    }
    rawFormAction(formData);
  };

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/checkup-records">
          <ArrowLeft className="mr-1 size-4" />
          목록으로
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>진단 정보 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="record_id" value={record.id} />

            {/* 고객 (읽기 전용) */}
            <div className="space-y-2">
              <Label>고객</Label>
              <Input
                value={customer.name || customer.userName || `ID ${customer.id}`}
                disabled
              />
            </div>

            {/* 반려동물 선택 */}
            <div className="space-y-2">
              <Label>반려동물</Label>
              <input type="hidden" name="pet_profile_id" value={selectedPetId} />
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="반려동물을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                      {p.species === "dog"
                        ? " (강아지)"
                        : p.species === "cat"
                          ? " (고양이)"
                          : ""}
                      {p.breed ? ` · ${p.breed}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 검진 날짜 */}
            <div className="space-y-2">
              <Label htmlFor="checkup_date">검진 날짜 *</Label>
              <Input
                id="checkup_date"
                name="checkup_date"
                type="date"
                defaultValue={record.checkupDate?.slice(0, 10)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">진단 내용</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={record.description ?? ""}
                placeholder="진단 내용을 입력하세요"
                rows={4}
              />
            </div>

            {/* 이미지 */}
            <div className="space-y-2">
              <Label>서류/사진 (최대 10장)</Label>
              {(existingUrls.length > 0 || newPreviews.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {existingUrls.map((url, i) => (
                    <div key={`e-${i}`} className="relative">
                      <Image
                        src={url}
                        alt=""
                        width={96}
                        height={96}
                        className="size-24 rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExisting(i)}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((src, i) => (
                    <div key={`n-${i}`} className="relative">
                      <Image
                        src={src}
                        alt=""
                        width={96}
                        height={96}
                        className="size-24 rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNew(i)}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={totalImages >= 10 || compressing}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="mr-2 size-4" />
                {compressing ? "압축 중..." : "사진 추가"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "저장 중..." : "수정 저장"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
