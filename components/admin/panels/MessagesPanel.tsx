'use client';

import { useState } from 'react';
import { CheckCheck, CornerDownRight, Mail, Trash2 } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import { AdminCard, ConfirmDialog, EmptyRow, useToast } from '../ui';
import { AdminApiError, updateMessages } from '@/lib/admin-api';
import type { Message } from '@/lib/types';
import { cx, formatDate } from '@/lib/utils';

export default function MessagesPanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [openId, setOpenId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = async (updates: Array<{ id: string; read?: boolean; remove?: boolean }>) => {
    setBusy(true);
    try {
      await updateMessages(updates);
      // Update local state without a full refetch.
      let messages = snap.messages;
      for (const u of updates) {
        if (u.remove) messages = messages.filter((m) => m.id !== u.id);
        else if (typeof u.read === 'boolean') messages = messages.map((m) => (m.id === u.id ? { ...m, read: u.read! } : m));
      }
      applySnapshot({ ...snap, messages });
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to update messages.');
    } finally {
      setBusy(false);
    }
  };

  const unread = snap.messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Messages Inbox</h1>
          <p className="mt-1 text-sm text-muted">
            {snap.messages.length} messages · {unread} unread — every contact form submission lands here (and by email when Resend is configured).
          </p>
        </div>
        {unread > 0 && (
          <button type="button" disabled={busy} onClick={() => void apply(snap.messages.filter((m) => !m.read).map((m) => ({ id: m.id, read: true })))} className="btn-ghost !px-4 !py-2 text-xs">
            <CheckCheck className="h-3.5 w-3.5" aria-hidden /> Mark all read
          </button>
        )}
      </header>

      <AdminCard title="Inbox">
        {snap.messages.length === 0 ? (
          <EmptyRow message="No messages yet — submissions from the contact form will appear here." />
        ) : (
          <ul className="space-y-2">
            {snap.messages.map((m) => {
              const open = openId === m.id;
              return (
                <li key={m.id} className={cx('rounded-xl border p-4 transition-colors', m.read ? 'border-line/12 bg-raised/30' : 'border-neon/30 bg-neon/5')}>
                  <div className="flex flex-wrap items-center gap-2">
                    {!m.read && <span className="h-2 w-2 rounded-full bg-neon" aria-label="Unread" />}
                    <button type="button" onClick={() => { setOpenId(open ? null : m.id); if (!m.read) void apply([{ id: m.id, read: true }]); }} className="min-w-0 flex-1 text-left" aria-expanded={open}>
                      <p className="truncate text-sm font-semibold">{m.subject}</p>
                      <p className="truncate font-mono text-[11px] text-muted">
                        {m.name} &lt;{m.email}&gt; · {formatDate(m.createdAt)}
                      </p>
                    </button>
                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="grid h-8 w-8 place-items-center rounded-lg border border-line/20 text-muted transition-colors hover:border-neon/50 hover:text-neon" aria-label={`Reply to ${m.name} by email`}>
                      <CornerDownRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                    <button type="button" onClick={() => setToDelete(m)} className="grid h-8 w-8 place-items-center rounded-lg border border-line/20 text-muted transition-colors hover:border-red-400/50 hover:text-red-400" aria-label={`Delete message from ${m.name}`}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                  {open && (
                    <div className="mt-3 rounded-lg border border-line/12 bg-base/60 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{m.message}</p>
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-line/12 pt-3">
                        <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="btn-primary !px-3.5 !py-1.5 text-[11px]">
                          <Mail className="h-3 w-3" aria-hidden /> Reply via email
                        </a>
                        <button type="button" onClick={() => void apply([{ id: m.id, read: !m.read }])} className="btn-ghost !px-3.5 !py-1.5 text-[11px]">
                          Mark {m.read ? 'unread' : 'read'}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this message?"
        message={`The message from "${toDelete?.name}" will be permanently deleted.`}
        onConfirm={async () => {
          if (toDelete) await apply([{ id: toDelete.id, remove: true }]);
          setToDelete(null);
          toast('success', 'Message deleted.');
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
