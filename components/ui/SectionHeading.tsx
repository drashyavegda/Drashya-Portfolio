import Reveal from './Reveal';

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }: Props) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto mb-12 max-w-2xl text-center sm:mb-16' : 'mb-12 max-w-2xl sm:mb-16'}>
      <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.3em] text-neon">
        <span aria-hidden className="mr-2 text-violet">//</span>
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-[2.6rem]">{title}</h2>
      {subtitle && <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{subtitle}</p>}
    </Reveal>
  );
}
