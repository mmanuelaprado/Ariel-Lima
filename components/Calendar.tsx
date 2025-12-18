
import React, { useState } from 'react';

interface CalendarProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
}

export const Calendar: React.FC<CalendarProps> = ({ onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderHeader = () => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return (
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-pink-100 rounded-full transition-colors"
        >
          &lt;
        </button>
        <h3 className="text-lg font-semibold text-pink-700">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 hover:bg-pink-100 rounded-full transition-colors"
        >
          &gt;
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-bold text-pink-400 uppercase">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const cells = [];

    // Empty cells for days before the start of the month
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Actual days
    for (let d = 1; d <= numDays; d++) {
      const date = new Date(year, month, d);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isPast = date < new Date(new Date().setHours(0,0,0,0));

      cells.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => onSelectDate(date)}
          className={`h-10 w-full flex items-center justify-center rounded-lg text-sm transition-all
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-pink-100'}
            ${isSelected ? 'bg-pink-500 text-white font-bold hover:bg-pink-600' : ''}
            ${isToday && !isSelected ? 'border border-pink-500 text-pink-600' : ''}
          `}
        >
          {d}
        </button>
      );
    }

    return <div className="grid grid-cols-7 gap-1">{cells}</div>;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
