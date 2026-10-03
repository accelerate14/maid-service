import React, { useState } from 'react';
import Input from '../ui/Input';

const timeSlots = [
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const StepSchedule = ({ schedule, onDateChange, onTimeChange, address, onAddressChange }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const isDateDisabled = (day) => {
    const date = new Date(viewYear, viewMonth, day);
    return date < today;
  };

  const isSelected = (day) => {
    if (!schedule.date) return false;
    const sel = new Date(schedule.date + 'T00:00:00');
    return sel.getDate() === day && sel.getMonth() === viewMonth && sel.getFullYear() === viewYear;
  };

  const selectDate = (day) => {
    if (isDateDisabled(day)) return;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onDateChange(`${viewYear}-${m}-${d}`);
  };

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-slate-900">Pick a Date & Time</h2>
        <p className="text-sm text-slate-500 mt-1">Select your preferred cleaning schedule</p>
      </div>

      <div className="space-y-6 mb-6">
        <Input
          id="booking-address"
          label="Service address"
          placeholder="123 Main St, Apt 4B"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-slate-200/50 p-6 shadow-sm">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 className="font-heading font-semibold text-slate-800">
              {MONTHS[viewMonth]} {viewYear}
            </h3>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const disabled = isDateDisabled(day);
              const selected = isSelected(day);
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  disabled={disabled}
                  className={`aspect-square rounded-xl text-sm font-medium transition-all duration-150 relative
                    ${disabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'}
                    ${selected ? 'bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary-dark' : ''}
                    ${isToday && !selected ? 'ring-2 ring-primary/30 text-primary font-bold' : ''}
                    ${!disabled && !selected ? 'text-slate-700' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="font-heading font-semibold text-slate-800 mb-4">
            {schedule.date 
              ? `Time slots for ${new Date(schedule.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
              : 'Select a date first'
            }
          </h4>
          <div className={`grid grid-cols-2 gap-3 ${!schedule.date ? 'opacity-50 pointer-events-none' : ''}`}>
            {timeSlots.map((slot, i) => (
              <button
                key={slot.value}
                onClick={() => onTimeChange(slot.value)}
                className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 animate-fade-in
                  ${schedule.time === slot.value
                    ? 'border-primary bg-primary/5 text-primary shadow-md shadow-primary/10'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm bg-white'
                  }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {slot.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSchedule;
