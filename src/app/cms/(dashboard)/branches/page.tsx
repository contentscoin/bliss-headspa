"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BranchForm = {
  name: string;
  region: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  businessHours: string;
};

const emptyForm: BranchForm = {
  name: "",
  region: "",
  address: "",
  phone: "",
  lat: "",
  lng: "",
  businessHours: "",
};

export default function BranchesPage() {
  const branches = useQuery(api.branches.list, {});
  const createBranch = useMutation(api.branches.create);
  const updateBranch = useMutation(api.branches.update);
  const toggleActive = useMutation(api.branches.toggleActive);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<Id<"branches"> | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (branch: NonNullable<typeof branches>[number]) => {
    setEditId(branch._id);
    setForm({
      name: branch.name,
      region: branch.region,
      address: branch.address,
      phone: branch.phone,
      lat: String(branch.lat),
      lng: String(branch.lng),
      businessHours: branch.businessHours,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      region: form.region,
      address: form.address,
      phone: form.phone,
      lat: parseFloat(form.lat) || 0,
      lng: parseFloat(form.lng) || 0,
      businessHours: form.businessHours,
    };

    try {
      if (editId) {
        await updateBranch({ branchId: editId, ...data });
        toast.success("지점이 수정되었습니다");
      } else {
        await createBranch(data);
        toast.success("지점이 추가되었습니다");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다");
    }
  };

  const setField = (key: keyof BranchForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (branches === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">지점 관리</h1>
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
        <h1 className="text-3xl font-bold">지점 관리</h1>
        <Button onClick={openCreate}>지점 추가</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-brand">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">지점명</th>
              <th className="px-4 py-3 text-left font-medium">지역</th>
              <th className="px-4 py-3 text-left font-medium">주소</th>
              <th className="px-4 py-3 text-left font-medium">전화</th>
              <th className="px-4 py-3 text-left font-medium">활성</th>
              <th className="px-4 py-3 text-left font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {branches?.map((b) => (
              <tr key={b._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">{b.name}</td>
                <td className="px-4 py-3">{b.region}</td>
                <td className="px-4 py-3">{b.address}</td>
                <td className="px-4 py-3">{b.phone}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.isActive ? "활성" : "비활성"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(b)}>
                    수정
                  </Button>
                  <Button
                    variant={b.isActive ? "destructive" : "secondary"}
                    size="sm"
                    onClick={async () => {
                      try {
                        await toggleActive({ branchId: b._id });
                        toast.success("상태가 변경되었습니다");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "오류가 발생했습니다");
                      }
                    }}
                  >
                    {b.isActive ? "비활성화" : "활성화"}
                  </Button>
                </td>
              </tr>
            ))}
            {branches?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  등록된 지점이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-brand-lg border border-border w-full max-w-lg p-6 mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "지점 수정" : "지점 추가"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {([
                ["name", "지점명"],
                ["region", "지역"],
                ["address", "주소"],
                ["phone", "전화번호"],
                ["lat", "위도"],
                ["lng", "경도"],
                ["businessHours", "영업시간"],
              ] as [keyof BranchForm, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    required={key !== "lat" && key !== "lng"}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setDialogOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">{editId ? "수정" : "추가"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
