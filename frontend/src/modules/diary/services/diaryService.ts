import * as Crypto from "expo-crypto";
import db from "../db/diaryDb";
import { DiaryEntry } from "../diary.types";

const toEntry = (row: any): DiaryEntry => ({
  ...JSON.parse(row.content),
  id: row.id,
  userId: row.user_id,
  syncStatus: row.sync_status,
  serverId: row.server_id ?? undefined,
  updatedAt: row.updated_at,
});

export const diaryService = {
  getAll: (userId: string): DiaryEntry[] => {
    const rows = db.getAllSync(
      `SELECT * FROM diary_entries WHERE user_id = ? ORDER BY json_extract(content, '$.date') DESC`,
      [userId],
    );
    return rows.map(toEntry);
  },

  getById: (id: string, userId: string): DiaryEntry | null => {
    const row = db.getFirstSync(
      `SELECT * FROM diary_entries WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
    return row ? toEntry(row) : null;
  },

  create: (userId: string, data: Partial<DiaryEntry>): DiaryEntry => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const entry: DiaryEntry = {
      id,
      userId,
      icon: data.icon ?? "📝",
      title: data.title ?? "",
      preview: data.preview ?? "",
      date: data.date ?? new Date().toLocaleDateString("pl-PL"),
      duration: data.duration ?? "0 min",
      mood: data.mood ?? "",
      section: data.section ?? "today",
      content: data.content ?? "",
      tags: data.tags ?? "[]",
      syncStatus: "pending",
      updatedAt: now,
    };

    db.runSync(
      `INSERT INTO diary_entries (id, user_id, content, sync_status, updated_at)
       VALUES (?, ?, ?, 'pending', ?)`,
      [id, userId, JSON.stringify(entry), now],
    );

    return entry;
  },

  update: (id: string, userId: string, data: Partial<DiaryEntry>): void => {
    const existing = diaryService.getById(id, userId);
    if (!existing) return;
    const now = new Date().toISOString();
    const updated: DiaryEntry = {
      ...existing,
      ...data,
      updatedAt: now,
      syncStatus: "pending",
    };

    db.runSync(
      `UPDATE diary_entries SET content = ?, sync_status = 'pending', updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [JSON.stringify(updated), now, id, userId],
    );
  },

  delete: (id: string, userId: string): void => {
    db.runSync(`DELETE FROM diary_entries WHERE id = ? AND user_id = ?`, [
      id,
      userId,
    ]);
  },

  getPending: (userId: string): DiaryEntry[] => {
    const rows = db.getAllSync(
      `SELECT * FROM diary_entries WHERE user_id = ? AND sync_status = 'pending'`,
      [userId],
    );
    return rows.map(toEntry);
  },

  markSynced: (id: string, serverId: string): void => {
    db.runSync(
      `UPDATE diary_entries SET sync_status = 'synced', server_id = ? WHERE id = ?`,
      [serverId, id],
    );
  },
};
