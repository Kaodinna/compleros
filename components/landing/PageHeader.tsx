interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="pt-[140px] pb-[60px] px-6 bg-hero-gradient text-center">
      <div className="section-container">
        <h1 className="font-heading text-[32px] sm:text-[38px] md:text-[44px] font-semibold text-navy mb-4 leading-[1.15]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] sm:text-[17px] md:text-[18px] text-muted max-w-[560px] mx-auto leading-[1.7]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
