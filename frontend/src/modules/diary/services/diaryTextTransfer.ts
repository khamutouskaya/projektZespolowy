let pendingText: string | null = null;
let pendingId: string | null = null;

export const diaryTextTransfer = {
  set(text: string, id?: string) {
    pendingText = text;
    pendingId = id ?? null;
  },
  get(): { text: string | null; id: string | null } {
    return { text: pendingText, id: pendingId };
  },
  clear() {
    pendingText = null;
    pendingId = null;
  },
};
