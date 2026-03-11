//decydujemy dane sa z backend czy mock
import { DiaryEntry } from "../diary.types";
import { diaryMock } from "../../../../mocks/diary.mock";

export function useDiaryEntries() {
  const entries: DiaryEntry[] = diaryMock;
  console.log("🔥 REAL HOOK FILE LOADED");

  return { entries };
}
