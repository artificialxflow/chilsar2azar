'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Flame,
  MessageSquareHeart,
  Plus,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import {
  FilterTabs,
  KpiCard,
  Modal,
  PageHeader,
  StatusBadge,
} from '@/components/ui/Primitives';
import { useChilserStore } from '@/lib/store';
import { SurveyFollowUpStatus } from '@/lib/mockData';
import { formatNumber, formatShamsiDate } from '@/lib/formatters';

export default function SurveysPage() {
  const { state, addSurvey, updateSurveyStatus } = useChilserStore();
  const [filter, setFilter] = useState<'ALL' | SurveyFollowUpStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const [customerName, setCustomerName] = useState(
    state.customers[0]?.companyName ?? ''
  );
  const [orderNumber, setOrderNumber] = useState(
    state.orders[0]?.orderNumber ?? ''
  );
  const [overallScore, setOverallScore] = useState('5');
  const [roastQuality, setRoastQuality] = useState('5');
  const [aromaFreshness, setAromaFreshness] = useState('5');
  const [deliverySpeed, setDeliverySpeed] = useState('5');
  const [npsScore, setNpsScore] = useState('9');
  const [comment, setComment] = useState('');

  const filtered = state.surveys.filter(
    (s) => filter === 'ALL' || s.followUpStatus === filter
  );

  const avgOverall =
    state.surveys.length > 0
      ? state.surveys.reduce((acc, s) => acc + s.overallScore, 0) /
        state.surveys.length
      : 0;
  const avgRoast =
    state.surveys.length > 0
      ? state.surveys.reduce((acc, s) => acc + s.roastQuality, 0) /
        state.surveys.length
      : 0;
  const avgNps =
    state.surveys.length > 0
      ? state.surveys.reduce((acc, s) => acc + s.npsScore, 0) /
        state.surveys.length
      : 0;

  const handleAddSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;
    addSurvey({
      customerName: customerName.trim(),
      orderNumber: orderNumber.trim() || 'ORD-1405',
      overallScore: Number(overallScore) || 5,
      roastQuality: Number(roastQuality) || 5,
      aromaFreshness: Number(aromaFreshness) || 5,
      deliverySpeed: Number(deliverySpeed) || 5,
      npsScore: Number(npsScore) || 9,
      comment: comment.trim(),
      followUpStatus: 'NEW',
    });
    setComment('');
    setModalOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="نظرسنجی و بازخورد مشتریان"
        subtitle="ارزیابی کیفیت برشته‌کاری، عطر و تازگی دانه و سرعت ارسال پس از تحویل سفارش"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-[#C47A3C] hover:bg-[#AF682E] text-[#FFFEFC] text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت بازخورد جدید</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <KpiCard
          title="میانگین رضایت کل (از ۵)"
          value={formatNumber(avgOverall, 1)}
          unit="ستاره"
          badgeTone="copper"
          icon={<Star className="w-5 h-5" />}
        />
        <KpiCard
          title="امتیاز کیفیت برشته‌کاری"
          value={formatNumber(avgRoast, 1)}
          unit="از ۵"
          badgeTone="espresso"
          icon={<Flame className="w-5 h-5" />}
        />
        <KpiCard
          title="میانگین شاخص توصیه (NPS)"
          value={formatNumber(avgNps, 1)}
          unit="از ۱۰"
          badgeTone="olive"
          icon={<ThumbsUp className="w-5 h-5" />}
        />
      </div>

      <div className="mb-6">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'ALL', label: 'همه بازخوردها', count: state.surveys.length },
            { value: 'NEW', label: 'جدید', count: state.surveys.filter((s) => s.followUpStatus === 'NEW').length },
            { value: 'REVIEWED', label: 'بررسی‌شده', count: state.surveys.filter((s) => s.followUpStatus === 'REVIEWED').length },
            { value: 'RESOLVED', label: 'پیگیری‌شده', count: state.surveys.filter((s) => s.followUpStatus === 'RESOLVED').length },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((srv) => (
          <div
            key={srv.id}
            className="bg-[#FFFEFC] rounded-3xl p-6 shadow-[0_2px_12px_rgba(41,35,31,0.035)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#786D65] tabular-nums">
                    {srv.surveyCode} · سفارش {srv.orderNumber}
                  </span>
                  <h3 className="text-sm font-bold text-[#29231F] mt-1">
                    {srv.customerName}
                  </h3>
                </div>
                <StatusBadge
                  label={
                    srv.followUpStatus === 'RESOLVED'
                      ? 'پاسخ داده‌شده'
                      : srv.followUpStatus === 'REVIEWED'
                      ? 'در حال بررسی'
                      : 'جدید'
                  }
                  tone={
                    srv.followUpStatus === 'RESOLVED'
                      ? 'success'
                      : srv.followUpStatus === 'REVIEWED'
                      ? 'copper'
                      : 'warning'
                  }
                />
              </div>

              <p className="mt-4 text-xs text-[#29231F] leading-relaxed bg-[#F7F4EF] rounded-2xl p-4">
                «{srv.comment}»
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="bg-[#F7F4EF]/70 rounded-xl p-2">
                  <span className="text-[#786D65] block">کیفیت رُست</span>
                  <strong className="text-[#4B2E24] tabular-nums">
                    {formatNumber(srv.roastQuality, 0)} / ۵
                  </strong>
                </div>
                <div className="bg-[#F7F4EF]/70 rounded-xl p-2">
                  <span className="text-[#786D65] block">عطر و تازگی</span>
                  <strong className="text-[#4B2E24] tabular-nums">
                    {formatNumber(srv.aromaFreshness, 0)} / ۵
                  </strong>
                </div>
                <div className="bg-[#F7F4EF]/70 rounded-xl p-2">
                  <span className="text-[#786D65] block">سرعت ارسال</span>
                  <strong className="text-[#4B2E24] tabular-nums">
                    {formatNumber(srv.deliverySpeed, 0)} / ۵
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#4B2E24]/8 flex items-center justify-between text-xs">
              <span className="text-[#786D65] tabular-nums">
                {formatShamsiDate(srv.submittedAt)}
              </span>
              {srv.followUpStatus !== 'RESOLVED' ? (
                <button
                  type="button"
                  onClick={() => updateSurveyStatus(srv.id, 'RESOLVED')}
                  className="text-[#5E7C52] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ثبت به عنوان پیگیری‌شده</span>
                </button>
              ) : (
                <span className="text-[#5E7C52] font-medium inline-flex items-center gap-1">
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>بسته‌شده</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Survey Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ثبت بازخورد و نظرسنجی مشتری"
        subtitle="ثبت ارزیابی کیفی پس از تحویل سفارش"
      >
        <form onSubmit={handleAddSurvey} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">مشتری</label>
              <input
                required
                name="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">شماره سفارش</label>
              <input
                name="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'رضایت کل (۱-۵)', val: overallScore, set: setOverallScore },
              { label: 'کیفیت رُست (۱-۵)', val: roastQuality, set: setRoastQuality },
              { label: 'عطر و تازگی (۱-۵)', val: aromaFreshness, set: setAromaFreshness },
              { label: 'سرعت ارسال (۱-۵)', val: deliverySpeed, set: setDeliverySpeed },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-[11px] font-medium mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={field.val}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full bg-[#F7F4EF] rounded-xl px-3 py-2 text-sm tabular-nums"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">امتیاز توصیه به دیگران (NPS از ۰ تا ۱۰)</label>
            <input
              type="number"
              min={0}
              max={10}
              value={npsScore}
              onChange={(e) => setNpsScore(e.target.value)}
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">متن نظر مشتری *</label>
            <textarea
              required
              rows={3}
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="نظر مشتری درباره طعم، عصاره‌گیری، بسته‌بندی و تحویل..."
              className="w-full bg-[#F7F4EF] rounded-2xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-full bg-[#F7F4EF] text-sm font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#C47A3C] text-[#FFFEFC] text-sm font-bold"
            >
              ثبت بازخورد
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
