"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { updateHotelRecord } from "../actions";
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
  checkinDate: string;
  checkoutDate: string;
  memo: string | null;
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

export function HotelDetailForm({
  record,
  customer,
  pets,
}: {
  record: Record;
  customer: Customer;
  pets: Pet[];
}) {
  const router = useRouter();
  const [state, rawFormAction, pending] = useActionState(updateHotelRecord, null);

  const [selectedPetId, setSelectedPetId] = useState(
    record.petProfileId ? String(record.petProfileId) : "",
  );

  const [existingUrls, setExistingUrls] = useState<string[]>(record.imageUrls);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalImages = existingUrls.length + newPreviews.length;

  useEffect(() => {
    if (state?.success) {
      toast.success("호텔링 기록이 수정되었습니다.");
      router.push("/hotel-records");
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
    formData.delete("existing_urls");
    for (const url of existingUrls) {
      formData.append("existing_urls", url);
    }
    rawFormAction(formData);
  };

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/hotel-records">
          <ArrowLeft className="mr-1 size-4" />
          목록으로
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>호텔링 정보 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="record_id" value={record.id} />

            <div className="space-y-2">
              <Label>고객</Label>
              <Input value={customer.name || customer.userName || `ID ${customer.id}`} disabled />
            </div>

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
                      {p.name}{p.species === "dog" ? " (강아지)" : p.species === "cat" ? " (고양이)" : ""}{p.breed ? ` · ${p.breed}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin_date">체크인 *</Label>
                <Input id="checkin_date" name="checkin_date" type="date" defaultValue={record.checkinDate} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout_date">체크아웃 *</Label>
                <Input id="checkout_date" name="checkout_date" type="date" defaultValue={record.checkoutDate} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">메모</Label>
              <Textarea id="memo" name="memo" defaultValue={record.memo ?? ""} placeholder="호텔링 관련 메모를 입력하세요" rows={4} />
            </div>

            <div className="space-y-2">
              <Label>사진 (최대 10장)</Label>
              {(existingUrls.length > 0 || newPreviews.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {existingUrls.map((url, i) => (
                    <div key={`e-${i}`} className="relative">
                      <Image src={url} alt="" width={96} height={96} className="size-24 rounded-lg border object-cover" />
                      <button type="button" onClick={() => removeExisting(i)} className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white">
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((src, i) => (
                    <div key={`n-${i}`} className="relative">
                      <Image src={src} alt="" width={96} height={96} className="size-24 rounded-lg border object-cover" />
                      <button type="button" onClick={() => removeNew(i)} className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white">
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button type="button" variant="outline" className="w-full" disabled={totalImages >= 10 || compressing} onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="mr-2 size-4" />
                {compressing ? "압축 중..." : "사진 추가"}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
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
