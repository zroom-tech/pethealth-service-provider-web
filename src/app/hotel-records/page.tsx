import Link from "next/link";
import Image from "next/image";
import { getHotelRecords } from "./actions";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate, truncate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

function formatDateOnly(dateStr: string | null) {
  if (!dateStr) return "-";
  return dateStr.slice(0, 10);
}

export default async function HotelRecordsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { records, total } = await getHotelRecords(page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">호텔링 기록</h1>
          <p className="text-sm text-muted-foreground">
            총 {total}건의 호텔링 기록
          </p>
        </div>
        <Button asChild>
          <Link href="/hotel-records/new">
            <Plus className="mr-1 size-4" />
            호텔링 기록 등록
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>체크인</TableHead>
              <TableHead>체크아웃</TableHead>
              <TableHead>고객</TableHead>
              <TableHead className="hidden sm:table-cell">반려동물</TableHead>
              <TableHead className="hidden md:table-cell">메모</TableHead>
              <TableHead className="hidden sm:table-cell">사진</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  등록된 호텔링 기록이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => {
                const user = record.users as unknown as {
                  name: string | null;
                  user_name: string | null;
                } | null;
                const pet = record.pet_profiles as unknown as {
                  name: string | null;
                  species: string | null;
                } | null;
                const imageUrls = (record.image_urls ?? []) as string[];

                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {formatDateOnly(record.started_at)}
                    </TableCell>
                    <TableCell>
                      {formatDateOnly(record.ended_at)}
                    </TableCell>
                    <TableCell>
                      {user?.name || user?.user_name || "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {pet ? (
                        <Badge variant="secondary">
                          {pet.name}
                          {pet.species === "dog"
                            ? " 🐕"
                            : pet.species === "cat"
                              ? " 🐈"
                              : ""}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {truncate(record.memo, 30)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {imageUrls.length > 0 ? (
                        <div className="flex gap-1">
                          {imageUrls.slice(0, 3).map((url, i) => (
                            <Image
                              key={i}
                              src={url}
                              alt=""
                              width={32}
                              height={32}
                              className="size-8 rounded object-cover"
                            />
                          ))}
                          {imageUrls.length > 3 && (
                            <span className="flex size-8 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                              +{imageUrls.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/hotel-records/${record.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" asChild disabled={page <= 1}>
            <Link href={`/hotel-records?page=${page - 1}`}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={page >= totalPages}
          >
            <Link href={`/hotel-records?page=${page + 1}`}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
