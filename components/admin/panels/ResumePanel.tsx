'use client';

import { useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import type { PanelProps } from '../AdminDashboard';
import { AdminCard, ConfirmDialog, useToast } from '../ui';
import { AdminApiError, patchSite, uploadFile } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';

export default function ResumePanel({ snap, applySnapshot }: PanelProps) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast('error', 'Resume must be a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('error', 'Resume is too large (max 10 MB).');
      return;
    }
    setBusy(true);
    try {
      const url = await uploadFile(file, 'resume');
      const snapshot = await patchSite({ resume: { file: url, uploadedAt: new Date().toISOString() } });
      applySnapshot(snapshot);
      toast('success', snap.resume.file ? 'Resume replaced — the download button now serves the new PDF.' : 'Resume uploaded — the “Download Resume” button is now visible on the public site.');
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const snapshot = await patchSite({ resume: { file: null, uploadedAt: null } });
      applySnapshot(snapshot);
      toast('success', 'Resume removed — download buttons are hidden again.');
    } catch (err) {
      toast('error', err instanceof AdminApiError ? err.message : 'Failed to remove resume.');
    } finally {
      setBusy(false);
      setConfirmRemove(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Resume Management</h1>
        <p className="mt-1 text-sm text-muted">
          The public “View / Download Resume” actions stay hidden until a PDF is uploaded here — no broken buttons.
        </p>
      </header>

      <AdminCard title="Current resume" description={snap.resume.uploadedAt ? `Uploaded ${formatDate(snap.resume.uploadedAt)}.` : 'No resume uploaded yet.'}>
        {snap.resume.file ? (
          <div className="space-y-4">
            <div className="flex flex-col items-start gap-4 rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-5 sm:flex-row sm:items-center">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-neon/30 bg-neon/10 text-neon">
                <FileText className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-300">Resume is live</p>
                <p className="truncate font-mono text-[11px] text-muted">{snap.resume.file}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={snap.resume.file} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3.5 !py-2 text-xs">
                  <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
                </a>
                <a href={snap.resume.file} download className="btn-primary !px-3.5 !py-2 text-xs">
                  <Download className="h-3.5 w-3.5" aria-hidden /> Download
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="btn-ghost cursor-pointer !px-4 !py-2.5 text-xs">
                {busy ? 'Working…' : 'Replace with new PDF'}
                <input type="file" accept="application/pdf" className="hidden" disabled={busy} onChange={(e) => void handleUpload(e.target.files?.[0])} />
              </label>
              <button type="button" onClick={() => setConfirmRemove(true)} disabled={busy} className="rounded-xl border border-red-400/30 px-4 py-2.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-400/10">
                Remove resume
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-line/30 p-8 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted/60" aria-hidden />
              <p className="text-sm font-medium">No resume uploaded yet</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
                Upload the updated PDF (max 10 MB). The hero “Download Resume” button and the resume section appear
                automatically afterwards.
              </p>
            </div>
            <label className="btn-primary mx-auto flex w-fit cursor-pointer !px-5 !py-2.5 text-xs">
              {busy ? 'Uploading…' : 'Upload resume PDF'}
              <input type="file" accept="application/pdf" className="hidden" disabled={busy} onChange={(e) => void handleUpload(e.target.files?.[0])} />
            </label>
          </div>
        )}
      </AdminCard>

      <ConfirmDialog
        open={confirmRemove}
        title="Remove the resume?"
        message="The public View/Download Resume buttons will be hidden again until a new PDF is uploaded."
        confirmLabel="Remove"
        onConfirm={() => void remove()}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
