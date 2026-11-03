import type { Availability, AvailabilityStatus } from '@/lib/types';

const STATUS_META: Record<Exclude<AvailabilityStatus, 'hidden'>, { label: string; dot: string; text: string }> = {
  internships: { label: 'Open to Internships', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  hackathons: { label: 'Open to Hackathons', dot: 'bg-neon', text: 'text-neon' },
  collaborations: { label: 'Open to Collaborations', dot: 'bg-violet', text: 'text-violet' },
  unavailable: { label: 'Not Currently Available', dot: 'bg-amber-400', text: 'text-amber-400' },
};

/** Renders only the status explicitly selected by the admin. Hidden by default. */
export default function AvailabilityBadge({ availability }: { availability: Availability }) {
  if (!availability.visible || availability.status === 'hidden') return null;
  const meta = STATUS_META[availability.status];
  return (
    <span
      className="chip gap-2"
      role="status"
      aria-label={`Availability: ${meta.label}`}
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${meta.dot} opacity-60`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
      </span>
      <span className={meta.text}>{meta.label}</span>
    </span>
  );
}
