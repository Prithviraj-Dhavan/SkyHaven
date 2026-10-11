import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Plane, Calendar, DollarSign, Clock, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { Airport } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';

export const FlightManager: React.FC = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for creating a new flight
  const [flightNumber, setFlightNumber] = useState('');
  const [airline, setAirline] = useState('SkyHaven Airways');
  const [originAirportId, setOriginAirportId] = useState('');
  const [destAirportId, setDestAirportId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [basePrice, setBasePrice] = useState('120');
  const [aircraftType, setAircraftType] = useState('Boeing 787-9 Dreamliner');
  const [durationMinutes, setDurationMinutes] = useState('140');
  const [gate, setGate] = useState('G15');
  const [terminal, setTerminal] = useState('T3');

  const loadFlights = async () => {
    setIsLoading(true);
    try {
      const [resFlights, resAirports] = await Promise.all([
        api.getAdminFlights(1, 50),
        api.getAirports(),
      ]);

      if (resFlights.success && resFlights.data) {
        setFlights(resFlights.data.flights);
      }
      if (resAirports.success && resAirports.data) {
        setAirports(resAirports.data);
        if (resAirports.data.length >= 2) {
          setOriginAirportId(resAirports.data[0].id);
          setDestAirportId(resAirports.data[1].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlights();
  }, []);

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createFlight({
        flight_number: flightNumber || `SH-${Math.floor(100 + Math.random() * 900)}`,
        airline,
        origin_airport_id: originAirportId,
        destination_airport_id: destAirportId,
        departure_time: new Date(departureTime || Date.now() + 86400000).toISOString(),
        arrival_time: new Date(arrivalTime || Date.now() + 86400000 + 7200000).toISOString(),
        base_price: Number(basePrice),
        aircraft_type: aircraftType,
        duration_minutes: Number(durationMinutes),
        gate,
        terminal,
      });

      if (res.success) {
        setIsModalOpen(false);
        loadFlights();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create flight');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [flightToDelete, setFlightToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteFlight = async () => {
    if (!flightToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteFlight(flightToDelete);
      setFlightToDelete(null);
      loadFlights();
    } catch (e: any) {
      console.error(e.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Active Fleet Schedules ({flights.length})
          </h3>
          <p className="text-xs text-slate-500">Manage flight routes, cabin configurations, and pricing.</p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="glow"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Schedule New Flight
        </Button>
      </div>

      {/* Flights Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">Flight</th>
              <th className="p-4">Route</th>
              <th className="p-4">Departure & Arrival</th>
              <th className="p-4">Aircraft</th>
              <th className="p-4">Base Fare</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                  Loading active fleet schedules...
                </td>
              </tr>
            ) : flights.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                  No scheduled flights found.
                </td>
              </tr>
            ) : (
              flights.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    <div className="font-mono text-brand-500">{f.flightNumber}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{f.airline}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    <div>{f.origin}</div>
                    <div className="text-brand-500">➔ {f.destination}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    <div>{new Date(f.departureTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-[10px] text-slate-500">{f.durationMinutes} min non-stop</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                    {f.aircraftType}
                  </td>
                  <td className="p-4 font-bold font-mono text-slate-900 dark:text-white">
                    ₹{Number(f.basePrice).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <Badge variant="emerald">{f.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setFlightToDelete(f.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Flight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Flight Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Flight"
        subtitle="Generates flight schedule and automatically provisions 72-seat multi-cabin grid."
      >
        <form onSubmit={handleCreateFlight} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Flight Number"
              placeholder="e.g. SH-204"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              required
            />
            <Input
              label="Operating Airline"
              placeholder="e.g. SkyHaven Airways"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Origin Hub"
              value={originAirportId}
              onChange={(e) => setOriginAirportId(e.target.value)}
              required
            >
              <option value="">Select departure airport</option>
              {airports.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.cityName} ({a.code}) - {a.country}
                </option>
              ))}
            </Select>

            <Select
              label="Destination Hub"
              value={destAirportId}
              onChange={(e) => setDestAirportId(e.target.value)}
              required
            >
              <option value="">Select arrival airport</option>
              {airports.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.cityName} ({a.code}) - {a.country}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Departure Time"
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
            />
            <Input
              label="Arrival Time"
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Base Price (₹)"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
            />
            <Input
              label="Duration (min)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
            <Input
              label="Aircraft Model"
              value={aircraftType}
              onChange={(e) => setAircraftType(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned Gate"
              value={gate}
              onChange={(e) => setGate(e.target.value)}
            />
            <Input
              label="Terminal"
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-4"
          >
            Provision & Publish Flight Schedule
          </Button>
        </form>
      </Modal>

      {/* Sleek Custom Delete Confirmation Modal */}
      <Modal
        isOpen={!!flightToDelete}
        onClose={() => setFlightToDelete(null)}
        title="Delete Flight Schedule"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently remove this scheduled flight? Active passenger holds and cabin assignments for this flight will be terminated.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setFlightToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteFlight}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
