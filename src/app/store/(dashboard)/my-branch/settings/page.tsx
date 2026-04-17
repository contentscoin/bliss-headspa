"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";

const SESSION_KEY = "bliss_session_token";

type BranchForm = {
  name: string;
  region: string;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  businessHours: string;
};

export default function BranchSettingsPage() {
  const { user } = useAuth();
  const branchId = user?.branchId as Id<"branches"> | undefined;
  const branch = useQuery(api.branches.getById, branchId ? { branchId } : "skip");
  const updateBranch = useMutation(api.branches.update);
  const changePassword = useMutation(api.auth.changePassword);

  const [form, setForm] = useState<BranchForm>({
    name: "",
    region: "",
    address: "",
    phone: "",
    lat: "",
    lng: "",
    businessHours: "",
  });
  const [savingBranch, setSavingBranch] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name,
        region: branch.region,
        address: branch.address,
        phone: branch.phone,
        lat: String(branch.lat),
        lng: String(branch.lng),
        businessHours: branch.businessHours,
      });
    }
  }, [branch]);

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;
    setSavingBranch(true);
    try {
      await updateBranch({
        branchId,
        name: form.name,
        region: form.region,
        address: form.address,
        phone: form.phone,
        lat: parseFloat(form.lat) || 0,
        lng: parseFloat(form.lng) || 0,
        businessHours: form.businessHours,
      });
      toast.success("지점 정보가 저장되었습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSavingBranch(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("새 비밀번호와 확인 값이 다릅니다.");
      return;
    }
    if (pwForm.next.length < 4) {
      toast.error("새 비밀번호는 4자 이상이어야 합니다.");
      return;
    }
    const sessionToken =
      typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
    if (!sessionToken) {
      toast.error("세션을 찾을 수 없습니다. 다시 로그인해 주세요.");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({
        sessionToken,
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      toast.success("비밀번호가 변경되었습니다.");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSavingPw(false);
    }
  };

  if (!branchId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">설정</h1>
        <p className="text-muted-foreground">지점 관리자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  const setField = (key: keyof BranchForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="설정" description="지점 정보와 비밀번호를 관리합니다." />

      {/* 지점 정보 */}
      <section className="rounded-2xl border border-border bg-card shadow-brand p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold">지점 정보</h2>
          <p className="text-sm text-muted-foreground">
            지점 코드: <span className="font-mono">{branch?.branchCode ?? "-"}</span>
          </p>
        </div>
        <form onSubmit={handleBranchSubmit} className="space-y-3">
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
                className="w-full min-h-[44px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
                required={key !== "lat" && key !== "lng"}
              />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={savingBranch}>
              {savingBranch ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </section>

      {/* 비밀번호 변경 */}
      <section className="rounded-2xl border border-border bg-card shadow-brand p-6">
        <h2 className="text-lg font-bold mb-4">비밀번호 변경</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">현재 비밀번호</label>
            <input
              type="password"
              className="w-full min-h-[44px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={pwForm.current}
              onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">새 비밀번호 (4자 이상)</label>
            <input
              type="password"
              className="w-full min-h-[44px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={pwForm.next}
              onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
              minLength={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              className="w-full min-h-[44px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
              minLength={4}
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={savingPw}>
              {savingPw ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
