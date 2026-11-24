import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowUpRight, Info } from 'lucide-react';
import { VILLAGES, CROPS, Crop } from '../data/paralicycleData';

export interface RequestPrefill {
  village?: string;
  crop?: Crop;
  area?: number;
  estimateT?: number;
  pickup?: string;
}

interface RecoveryRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: RequestPrefill | null;
}

export const RecoveryRequestModal: React.FC<RecoveryRequestModalProps> = ({
  isOpen,
  onClose,
  prefill,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState(VILLAGES[0].name);
  const [crop, setCrop] = useState<Crop>('wheat');
  const [area, setArea] = useState('12');
  const [pickup, setPickup] = useState('2026-11-10');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      if (prefill) {
        if (prefill.village) setVillage(prefill.village);
        if (prefill.crop) setCrop(prefill.crop);
        if (prefill.area) setArea(String(prefill.area));
        if (prefill.pickup) setPickup(prefill.pickup);
      }
    }
  }, [isOpen, prefill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitted(true);
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setName('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="fixed inset-0 bg-[#1A1B19]/55 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] rounded-[28px] bg-[#FBFBF6] border border-[#E4E8DB] p-6 sm:p-8 shadow-2xl relative my-8"
          >
            <button
              onClick={resetAndClose}
              aria-label="Close"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#E8F7D4] hover:bg-[#D9F99D] flex items-center justify-center text-[#1A2E12] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <span className="font-mono inline-block px-3 py-1 rounded-full bg-[#E8F7D4] border border-[#C6E89F] text-[#284D16] text-[10.5px] font-semibold tracking-wide uppercase mb-2.5">
                    Recovery Request · Demo Queue
                  </span>
                  <h3 className="font-display text-[25px] font-bold text-[#1A1B19] leading-tight">
                    Start a Recovery Request
                  </h3>
                  <p className="text-[13px] text-[#6C6E6A] mt-1 leading-relaxed">
                    Enter parcel details to preview how PARALICYCLE queues fields for baler
                    dispatch. No real pickup is scheduled in this prototype.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6C6E6A] mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Farmer / coordinator"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[14px] text-[#1A1B19]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6C6E6A] mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 …"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[14px] text-[#1A1B19]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6C6E6A] mb-1.5">
                    Village
                  </label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[14px] text-[#1A1B19] cursor-pointer"
                  >
                    {VILLAGES.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} · {v.block}
                      </option>
                    ))}
                    <option value="Other Punjab village">Other Punjab village</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6C6E6A] mb-1.5">
                      Crop
                    </label>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value as Crop)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[14px] text-[#1A1B19] cursor-pointer"
                    >
                      {(Object.keys(CROPS) as Crop[]).map((c) => (
                        <option key={c} value={c}>
                          {CROPS[c].short}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6C6E6A] mb-1.5">
                      Field area (ha)
                    </label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="font-mono w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[14px] text-[#1A1B19] tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6C6E6A] mb-1.5">
                    Preferred collection date
                  </label>
                  <input
                    type="date"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="font-mono w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[14px] text-[#1A1B19]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6C6E6A] mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Access road notes, moisture condition, urgency…"
                    className="w-full px-3.5 py-2 rounded-2xl bg-white border border-[#DFE4D5] focus:border-[#65A30D] outline-none text-[13px] text-[#1A1B19] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full inline-flex items-center justify-center cursor-pointer pt-1"
                >
                  <span className="flex-1 py-3.5 px-6 rounded-full bg-[#1C1D1B] group-hover:bg-[#365314] text-white text-[13.5px] font-semibold transition-colors text-center">
                    Submit to simulated triage queue
                  </span>
                  <span className="w-11 h-11 -ml-2 rounded-full bg-[#D9F99D] border-[1.5px] border-[#1C1D1B] text-[#1A2E12] group-hover:bg-[#A3E635] flex items-center justify-center transition-colors shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </button>

                <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#6C7366]">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#4D7C0F]" />
                  Demo submission only — nothing is persisted and no physical machinery is booked.
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#D9F99D] text-[#1A2E12] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display text-[23px] font-bold text-[#1A1B19]">
                  Request queued, {name.split(' ')[0] || 'partner'}
                </h3>
                <p className="text-[13.5px] text-[#5C5E59] leading-relaxed max-w-[380px] mx-auto">
                  Your <strong className="text-[#1A1B19]">{CROPS[crop].short.toLowerCase()}</strong>{' '}
                  parcel of <strong className="font-mono text-[#1A1B19] tabular-nums">{area} ha</strong> in{' '}
                  <strong className="text-[#1A1B19]">{village}</strong> was logged in the simulated
                  triage queue for <strong className="font-mono text-[#1A1B19]">{pickup}</strong>.
                  {prefill?.estimateT ? (
                    <>
                      {' '}
                      Estimated tonnage:{' '}
                      <strong className="font-mono text-[#3F6212] tabular-nums">
                        {prefill.estimateT} t
                      </strong>
                      .
                    </>
                  ) : null}
                </p>
                <div className="font-mono inline-block px-4 py-1.5 rounded-full bg-[#E8F7D4] border border-[#C6E89F] text-[11px] font-semibold text-[#284D16] tracking-wider">
                  DEMO REQUEST ID · RQ-1042
                </div>
                <div>
                  <button
                    onClick={resetAndClose}
                    className="px-7 py-3 rounded-full bg-[#1C1D1B] hover:bg-[#365314] text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
