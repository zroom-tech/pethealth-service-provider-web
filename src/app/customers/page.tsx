import Link from "next/link";
import { getCustomers } from "./actions";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, UserRoundSearch } from "lucide-react";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search ?? "";
  const { customers, total } = await getCustomers(page, search);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">고객 관리</h1>
        <p className="text-sm text-muted-foreground">
          QR 코드로 등록된 고객 목록입니다
        </p>
      </div>

      {/* 검색 */}
      <form className="flex gap-2">
        <Input
          name="search"
          type="text"
          placeholder="이름, 이메일, 전화번호 검색"
          defaultValue={search}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          검색
        </Button>
        {search && (
          <Button variant="ghost" asChild>
            <Link href="/customers">초기화</Link>
          </Button>
        )}
      </form>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead className="hidden sm:table-cell">닉네임</TableHead>
              <TableHead className="hidden md:table-cell">이메일</TableHead>
              <TableHead className="hidden sm:table-cell">전화번호</TableHead>
              <TableHead className="hidden md:table-cell">등록일</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {search ? "검색 결과가 없습니다" : "등록된 고객이 없습니다"}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.name || "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {customer.userName || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.email || "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {customer.phone || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDate(customer.registeredAt)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/customers/${customer.id}`}>
                        <UserRoundSearch className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" asChild disabled={page <= 1}>
            <Link
              href={`/customers?page=${page - 1}${search ? `&search=${search}` : ""}`}
              aria-disabled={page <= 1}
            >
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
            <Link
              href={`/customers?page=${page + 1}${search ? `&search=${search}` : ""}`}
              aria-disabled={page >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
