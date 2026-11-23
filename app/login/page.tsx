'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Coffee,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from '@/components/BrandLogo';
import { DEMO_MOBILE, DEMO_OTP } from '@/lib/mockData';
import { useChilserStore } from '@/lib/store';
import { formatShamsiHeaderDate } from '@/lib/formatters';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, authReady, loginWithOtp, loginDemo } = useChilserStore();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState(DEMO_MOBILE);
  const [code, setCode] = useState(DEMO_OTP);
  const [error, setError] = useState('');
  const [bgFailed, setBgFailed] = useState(false);

  useEffect(() => {
    if (authReady && currentUser) {
      router.replace('/dashboard');
    }
  }, [authReady, currentUser, router]);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const clean = mobile.trim().replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    if (!/^09\d{9}$/.test(clean)) {
      setError('لطفاً شماره موبایل ۱۱ رقمی معتبر وارد کنید (مثال: 09126723365).');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = loginWithOtp(mobile, code);
    if (!result.ok) {
      setError(result.error ?? 'خطا در ورود به سامانه');
      return;
    }
    router.push('/dashboard');
  };

  const handleQuickDemo = () => {
    loginDemo();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-5xl bg-[#FFFEFC] rounded-[32px] shadow-[0_12px_40px_rgba(75,46,36,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Form Column (Start / Right in RTL) */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-10">
              <BrandLogo variant="light" showSubtitle />
              <span className="text-xs text-[#786D65] hidden sm:inline">
                نسخه سازمانی داخلی
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#29231F] tracking-tight">
              ورود به چیلسر یکپارچه
            </h1>
            <p className="text-sm text-[#786D65] mt-2 leading-relaxed">
              سامانه مدیریت تولید، برشته‌کاری، انبار، فروش و امور مالی چیلسر.
              <br />
              <span className="text-xs">{formatShamsiHeaderDate()}</span>
            </p>

            {/* Demo Credentials Hint */}
            <div className="mt-6 p-4 rounded-2xl bg-[#F7F4EF] text-xs text-[#4B2E24] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C47A3C]" />
                اطلاعات ورود آزمایشی (پیش‌فرض پر شده است):
              </p>
              <p className="text-[#786D65] tabular-nums">
                شماره موبایل: <strong className="text-[#29231F]" dir="ltr">{DEMO_MOBILE}</strong>
                {' · '}
                کد تایید پیامکی: <strong className="text-[#29231F]" dir="ltr">{DEMO_OTP}</strong>
              </p>
            </div>

            {step === 'mobile' ? (
              <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-xs font-medium text-[#29231F] mb-2"
                  >
                    شماره موبایل سازمانی
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-[#786D65] absolute start-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      dir="ltr"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="09126723365"
                      className="w-full bg-[#F7F4EF] rounded-2xl ps-11 pe-4 py-3 text-sm text-[#29231F] text-left tabular-nums focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-medium text-[#B84A3A]">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full bg-[#4B2E24] hover:bg-[#3A221A] text-[#FFFEFC] text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>دریافت کد تایید ۵ رقمی</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#786D65]">
                  <span className="tabular-nums">
                    کد به شماره <strong className="text-[#29231F]" dir="ltr">{mobile}</strong> ارسال شد
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="text-[#C47A3C] font-medium hover:underline"
                  >
                    ویرایش شماره
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="otpCode"
                    className="block text-xs font-medium text-[#29231F] mb-2"
                  >
                    کد تایید ۵ رقمی پیامک
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#786D65] absolute start-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="otpCode"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      dir="ltr"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="00000"
                      className="w-full bg-[#F7F4EF] rounded-2xl ps-11 pe-4 py-3 text-base tracking-[0.45em] font-bold text-[#29231F] text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-[#C47A3C]/50"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-medium text-[#B84A3A]">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید و ورود به داشبورد</span>
                </button>
              </form>
            )}

            {/* One-Click Demo Access */}
            <div className="mt-4 pt-4 border-t border-[#4B2E24]/8">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-3 px-6 rounded-full bg-[#F7F4EF] hover:bg-[#EDE6DC] text-[#4B2E24] text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#C47A3C]" />
                <span>ورود سریع یک‌کلیکی به نسخه دمو</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#786D65] mt-8">
            چیلسر یکپارچه · طراحی‌شده برای مدیریت تولید، برشته‌کاری و فروش قهوه (کاملاً آفلاین)
          </p>
        </div>

        {/* Visual Espresso Brand Showcase Column (Left in RTL) */}
        <div className="lg:col-span-6 relative bg-[#261914] text-[#FFFEFC] p-8 md:p-12 flex flex-col justify-between overflow-hidden min-h-[340px]">
          {!bgFailed && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/images/login-roastery.webp"
              alt="کارگاه برشته‌کاری قهوه چیلسر"
              referrerPolicy="no-referrer"
              onError={() => setBgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}

          {/* Subtle Coffee Geometric Background Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            viewBox="0 0 400 400"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="330" cy="70" r="140" stroke="#C47A3C" strokeWidth="1.5" />
            <circle cx="330" cy="70" r="95" stroke="#F7F4EF" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="60" cy="340" r="120" stroke="#C47A3C" strokeWidth="1.5" />
          </svg>

          <div className="relative z-10">
            <span className="text-xs font-medium text-[#C47A3C]">
              از دانه سبز تا فنجان مشتری
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-3 leading-snug text-[#FFFEFC]">
              کنترل یکپارچه کارگاه برشته‌کاری، انبار و فروش در یک محیط آرام
            </h2>
            <p className="text-sm text-[#D4C9C1] mt-4 leading-relaxed">
              پایش دقیق بچ‌های رُست و درصد افت وزن، مدیریت موجودی دانه سبز، ثبت
              سفارش کافه‌ها، پیگیری ارسال و حسابداری عملیاتی در بستر تقویم شمسی.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/6 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <Coffee className="w-5 h-5 text-[#C47A3C] mb-2" />
              <p className="text-sm font-bold">پایش بچ‌های برشته‌کاری</p>
              <p className="text-xs text-[#C9BEB6] mt-1">
                محاسبه خودکار افت وزن و ورود به انبار محصول
              </p>
            </div>
            <div className="bg-white/6 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-[#8AB878] mb-2" />
              <p className="text-sm font-bold">گردش کار یکپارچه</p>
              <p className="text-xs text-[#C9BEB6] mt-1">
                اتصال آنی خرید، تولید، سفارش، ارسال و حسابداری
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
