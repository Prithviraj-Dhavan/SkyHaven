import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Flight, FlightSeat } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ReleaseSeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRelease: () => void;
  flight?: Flight | null;
  seats: FlightSeat[];
  secondsLeft?: number;
  isProcessing?: boolean;
}

export const ReleaseSeatsModal: React.FC<ReleaseSeatsModalProps> = ({
  isOpen,
  onClose,
  onConfirmRelease,
  seats,
  isProcessing = false,
}) => {
  const seatNumbers = seats.map((s) => s.seatNumber).join(', ');

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center p-2">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Release Locked Seats?
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm sm:text-base leading-relaxed">
          Are you sure you want to release seat{seats.length > 1 ? 's' : ''} {seatNumbers ? `(${seatNumbers})` : ''}? Your temporary lock will be cancelled and these seats will immediately become available for other travelers to book.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:w-1/2"
            disabled={isProcessing}
          >
            Keep My Seats
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmRelease}
            className="sm:w-1/2 bg-rose-500 hover:bg-rose-600 focus:ring-rose-500 text-white"
            isLoading={isProcessing}
          >
            Release Seats
          </Button>
        </div>
      </div>
    </Modal>
  );
};
