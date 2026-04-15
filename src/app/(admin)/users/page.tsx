"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Role = "customer" | "branch_admin" | "buyer" | "super_admin";

const roleLabels: Record<Role, string> = {
  super_admin: "수퍼어드민",
  branch_admin: "지점관리자",
  buyer: "구매자",
  customer: "고객",
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  branchId: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "customer",
  branchId: "",
};

export default function UsersPage() {
  const users = useQuery(api.users.listAll);
  const branches = useQuery(api.branches.list, {});
  const registerUser = useMutation(api.auth.register);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: keyof UserForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "이름은 2자 이상 입력해 주세요.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해 주세요.";
    }
    if (form.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다.";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "연락처를 입력해 주세요.";
    }
    if (form.role === "branch_admin" && !form.branchId) {
      newErrors.branchId = "지점을 선택해 주세요.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,
      });
      toast.success("계정이 생성되었습니다");
      setDialogOpen(false);
      setForm(emptyForm);
      setErrors({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다");
    }
  };

  const getBranchName = (branchId?: Id<"branches">) => {
    if (!branchId || !branches) return "-";
    return branches.find((b) => b._id === branchId)?.name ?? "-";
  };

  if (users === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">계정 관리</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">계정 관리</h1>
        <Button onClick={() => { setForm(emptyForm); setErrors({}); setDialogOpen(true); }}>
          계정 추가
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">이름</th>
              <th className="px-4 py-3 text-left font-medium">이메일</th>
              <th className="px-4 py-3 text-left font-medium">역할</th>
              <th className="px-4 py-3 text-left font-medium">연결 지점</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                    {roleLabels[u.role as Role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{getBranchName(u.branchId)}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  등록된 사용자가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <h2 className="text-xl font-bold mb-4">계정 추가</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input
                  className={`w-full min-h-[44px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : ""}`}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">이메일</label>
                <input
                  type="email"
                  className={`w-full min-h-[44px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : ""}`}
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">비밀번호</label>
                <input
                  type="password"
                  className={`w-full min-h-[44px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : ""}`}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  required
                />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">연락처</label>
                <input
                  className={`w-full min-h-[44px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? "border-red-500" : ""}`}
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="010-1234-5678"
                  required
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">역할</label>
                <select
                  className="w-full min-h-[44px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                >
                  {(Object.entries(roleLabels) as [Role, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {form.role === "branch_admin" && (
                <div>
                  <label className="block text-sm font-medium mb-1">연결 지점</label>
                  <select
                    className={`w-full min-h-[44px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.branchId ? "border-red-500" : ""}`}
                    value={form.branchId}
                    onChange={(e) => setField("branchId", e.target.value)}
                  >
                    <option value="">선택</option>
                    {branches?.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.branchId && <p className="text-sm text-red-600 mt-1">{errors.branchId}</p>}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setDialogOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">추가</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
