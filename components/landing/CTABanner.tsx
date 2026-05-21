import WaitlistInput from "./WaitlistInput";

interface CTABannerProps {
  heading?: string;
  subtext?: string;
  btnLabel?: string;
}

export default function CTABanner({
  heading = "Ready to simplify your compliance?",
  subtext = "Join the waitlist and be among the first Florida providers to access Compleros. Free plan available from day one.",
  btnLabel = "Get Early Access",
}: CTABannerProps) {
  return (
    <section className="py-16 md:py-[100px] px-6" aria-labelledby="cta-banner-heading">
      <div className="section-container">
        <div className="bg-navy-gradient rounded-2xl px-6 sm:px-10 md:px-16 py-12 md:py-16 text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-1/2 -right-[20%] w-[400px] h-[400px] rounded-full bg-radial-gold pointer-events-none opacity-60" />

          <div className="relative z-10">
            <p className="section-tag !text-gold-light mb-4">Early Access</p>
            <h2
              id="cta-banner-heading"
              className="font-heading text-[26px] sm:text-[32px] md:text-[38px] font-semibold text-white mb-4 leading-[1.2]"
            >
              {heading}
            </h2>
            <p className="text-[17px] text-white/70 mb-10 max-w-[480px] mx-auto leading-[1.7]">
              {subtext}
            </p>

            <div className="flex justify-center">
              <WaitlistInput
                placeholder="Enter your work email"
                btnLabel={btnLabel}
                btnClassName="bg-gold text-white hover:bg-gold-dark"
                inputClassName="bg-white"
              />
            </div>

            <p className="text-[13px] text-white/40 mt-5">
              No credit card required · Free forever plan · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
