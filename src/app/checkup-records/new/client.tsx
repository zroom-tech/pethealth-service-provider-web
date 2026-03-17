"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createCheckupRecord, searchPartnerCustomers, getUserPets } from "../actions";
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
import { ImagePlus, Search, X } from "lucide-react";
import { compressImage } from "@/lib/image";

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

function customerLabel(c: Customer) {
  return c.name || c.userName || `ID ${c.id}`;
}

export function CheckupRecordForm() {
  const router = useRouter();
  const [state, rawFormAction, pending] = useActionState(
    createCheckupRecord,
    null,
  );

  // 고객 검색
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [searching, startSearching] = useTransition();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 반려동물
  const [selectedPetId, setSelectedPetId] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, startLoadingPets] = useTransition();

  // 이미지
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 고객 검색 debounce
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      startSearching(async () => {
        const results = await searchPartnerCustomers(value);
        setSearchResults(results as Customer[]);
      });
    }, 300);
  }, []);

  // 초기 로드 (빈 검색)
  useEffect(() => {
    startSearching(async () => {
      const results = await searchPartnerCustomers("");
      setSearchResults(results as Customer[]);
    });
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 고객 선택
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery(customerLabel(customer));
    setShowDropdown(false);
    setSelectedPetId("");
    startLoadingPets(async () => {
      const result = await getUserPets(customer.id);
      setPets(result as Pet[]);
    });
  }, []);

  // 고객 선택 해제
  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setSearchQuery("");
    setPets([]);
    setSelectedPetId("");
  }, []);

  // 고객 선택 변경 시 펫 로드
  useEffect(() => {
    if (!selectedCustomer) {
      setPets([]);
      setSelectedPetId("");
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (state?.success) {
      toast.success("진단 기록이 등록되었습니다.");
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
      const newPreviews: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        newFiles.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      }
      setCompressedFiles((prev) => [...prev, ...newFiles].slice(0, 10));
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    } finally {
      setCompressing(false);
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setCompressedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 압축된 이미지를 FormData에 주입하여 submit
  const handleSubmit = (formData: FormData) => {
    // 기존 file input의 파일 제거 (압축 전 원본)
    formData.delete("images");
    for (const file of compressedFiles) {
      formData.append("images", file);
    }
    rawFormAction(formData);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>진단 정보 입력</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          {/* 고객 검색 */}
          <div className="space-y-2">
            <Label>고객 *</Label>
            <input
              type="hidden"
              name="user_id"
              value={selectedCustomer?.id ?? ""}
            />
            <div ref={dropdownRef} className="relative">
              {selectedCustomer ? (
                <div className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 text-sm">
                  <span>{customerLabel(selectedCustomer)}</span>
                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="고객 이름으로 검색"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className="pl-9"
                  />
                </div>
              )}
              {showDropdown && !selectedCustomer && (
                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                  {searching ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      검색 중...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {searchQuery
                        ? "검색 결과가 없습니다"
                        : "등록된 고객이 없습니다"}
                    </div>
                  ) : (
                    searchResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => handleSelectCustomer(c)}
                      >
                        <span className="font-medium">
                          {c.name || "-"}
                        </span>
                        {c.userName && (
                          <span className="ml-2 text-muted-foreground">
                            ({c.userName})
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 반려동물 선택 */}
          <div className="space-y-2">
            <Label>반려동물</Label>
            <input
              type="hidden"
              name="pet_profile_id"
              value={selectedPetId}
            />
            <Select
              value={selectedPetId}
              onValueChange={setSelectedPetId}
              disabled={!selectedCustomer || loadingPets}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingPets
                      ? "불러오는 중..."
                      : !selectedCustomer
                        ? "고객을 먼저 선택하세요"
                        : "반려동물을 선택하세요"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={String(pet.id)}>
                    {pet.name}
                    {pet.species === "dog"
                      ? " (강아지)"
                      : pet.species === "cat"
                        ? " (고양이)"
                        : ""}
                    {pet.breed ? ` · ${pet.breed}` : ""}
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
              defaultValue={today}
              max={today}
              required
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">진단 내용</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="진단 내용을 입력하세요"
              rows={4}
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <Label>서류/사진 (최대 10장)</Label>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <Image
                      src={src}
                      alt=""
                      width={96}
                      height={96}
                      className="size-24 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
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
              disabled={previews.length >= 10 || compressing}
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
            {pending ? "등록 중..." : "진단 기록 등록"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
