import { useAuthStore } from "@/services/store/useAuthStore";
import { ProfileStats } from "../profile.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { diaryService } from "@/modules/diary/services/diaryService";

export const useProfileStats = (): ProfileStats => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [entryCount, setEntryCount] = useState(0);
  const userId = user?.id ?? "";

  const reload = useCallback(() => {
    if (!userId) return;
    const count = diaryService.getAll(userId).length;
    setEntryCount(count);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const memberSince = useMemo(() => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (token) {
      const decoded: any = jwtDecode(token);
      return new Date(decoded.iat * 1000).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return "—";
  }, [user?.createdAt, token]);

  return { entryCount, memberSince, reload };
};
