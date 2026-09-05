import React from 'react';
import { User, Mail, FileText, Armchair, ShieldCheck } from 'lucide-react';
import { Passenger, FlightSeat } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

interface PassengerFormProps {
  selectedSeats: FlightSeat[];
  passengers: Passenger[];
  onChange: (index: number, updated: Partial<Passenger>) => void;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  selectedSeats,
  passengers,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
          Passenger Information ({passengers.length})
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">Government ID required at boarding gate</span>
      </div>

      {passengers.map((pax, idx) => {
        const assignedSeat = selectedSeats[idx];
        return (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0062E3] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {idx + 1}
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Passenger {idx + 1}
                </span>
              </div>

              {assignedSeat && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 font-mono font-bold text-xs text-[#0062E3] dark:text-[#00B2D6]">
                    Seat {assignedSeat.seatNumber} ({assignedSeat.cabinClass.replace('_', ' ')})
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                placeholder="e.g. Prithviraj Sharma"
                value={pax.name}
                onChange={(e) => onChange(idx, { name: e.target.value })}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. prithviraj@example.com"
                value={pax.email}
                onChange={(e) => onChange(idx, { email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Passport / Govt ID Number"
                placeholder="e.g. P89412750"
                value={pax.documentNumber}
                onChange={(e) => onChange(idx, { documentNumber: e.target.value })}
                leftIcon={<FileText className="w-4 h-4 text-slate-400" />}
                required
              />

              <Select
                label="Passenger Category"
                value={pax.type}
                onChange={(e) => onChange(idx, { type: e.target.value as any })}
              >
                <option value="ADULT">Adult (12+ yrs)</option>
                <option value="CHILD">Child (2-11 yrs)</option>
                <option value="INFANT">Infant (&lt;2 yrs)</option>
              </Select>
            </div>
          </div>
        );
      })}
    </div>
  );
};
