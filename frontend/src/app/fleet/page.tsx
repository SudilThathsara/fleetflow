'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Car,
  Truck,
  Users,
  Fuel,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PublicFleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchFleet(selectedCategory);
  }, [selectedCategory]);

  const fetchFleet = (category: string) => {
    setLoading(true);
    const url = category === 'all' ? '/api/public/fleet' : `/api/public/fleet?category=${encodeURIComponent(category)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setVehicles(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const categories = [
    { label: 'All Fleet Categories', value: 'all' },
    { label: 'Double Cab Pickups (4x4)', value: 'Double Cab' },
    { label: 'Passenger Vans', value: 'Van' },
    { label: 'Sedans & Cars', value: 'Car' },
    { label: 'SUVs & 4WD', value: 'SUV' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <PublicHeader />

      {/* Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 flex flex-col items-center">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
              Fleet Catalogue
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Our Approved Vehicle Fleet
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Explore vehicle models approved for public hire, seating capacities, and service categories. All vehicles undergo scheduled preventative maintenance and safety fitness verifications.
            </p>
          </div>
        </div>
      </section>

      {/* Fleet Catalogue Body */}
      <section className="py-12 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-6">
            <Filter size={16} className="text-slate-400 mr-2" />
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notice of Fleet Privacy */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
            <ShieldCheck size={18} className="text-sky-600 shrink-0" />
            <span>
              <strong>Operational Privacy Notice:</strong> For client safety and commercial privacy, private registration numbers, driver phone numbers, and real-time operational GPS locations are withheld from public display.
            </span>
          </div>

          {/* Vehicles Grid */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading verified fleet catalogue...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-3">
              <Car size={36} className="text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Public Vehicles in this Category</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The absence of a published listing does not imply lack of operational availability. Contact our operations desk for custom vehicle assignments.
              </p>
              <Link
                href="/request-quotation"
                className="inline-block mt-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold"
              >
                Request Custom Vehicle Quotation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl hover:border-sky-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Vehicle Photo */}
                    <div className="aspect-16/10 bg-slate-900 overflow-hidden relative">
                      <img
                        src={
                          v.publicPhotos?.[0] ||
                          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
                        }
                        alt={`${v.make} ${v.model}`}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                        {v.vehicleType}
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        Available
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {v.make} {v.model}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {v.manufacturingYear ? `Model Year: ${v.manufacturingYear}` : 'Verified Fleet Spec'} • {v.color || 'Standard Corporate Color'}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {v.publicDescription ||
                          `Approved ${v.make} ${v.model} for corporate monthly rental, project field mobility, and tour hire in Sri Lanka.`}
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Users size={14} className="text-sky-600" />
                          <span>{v.seatingCapacity || 4} Passengers</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Fuel size={14} className="text-sky-600" />
                          <span>{v.fuelType || 'Diesel'}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-1">
                        {(v.publicFeatures || [
                          'Full Comprehensive Commercial Insurance',
                          'A/C & Climate Control',
                          'Vetted Chauffeur Included',
                        ]).map((feat: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0">
                    <Link
                      href={`/request-quotation?vehicle=${encodeURIComponent(`${v.make} ${v.model}`)}`}
                      className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition"
                    >
                      <span>Inquire Availability</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
