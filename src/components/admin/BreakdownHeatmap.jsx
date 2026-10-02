import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Layers, 
  Truck, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Maximize2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { isGoogleMapsConfigured, getGoogleMapsLoader } from '../../services/mapsService';

export default function BreakdownHeatmap() {
  const [viewMode, setViewMode] = useState('HEATMAP'); // 'HEATMAP' or 'FLEET'
  const [timeRange, setTimeRange] = useState('WEEK'); // 'TODAY', 'WEEK', 'MONTH'
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const hotspots = [
    {
      id: 1,
      name: "Outer Ring Road (Bellandur - Marathahalli)",
      incidents: 64,
      severity: "CRITICAL",
      x: 68,
      y: 52,
      lat: 12.9279,
      lng: 77.6833,
      avgResponseMin: 7.2,
      topIssue: "Evening Peak Traffic Fuel Depletion"
    },
    {
      id: 2,
      name: "Silk Board - Electronic City Elevated Express",
      incidents: 58,
      severity: "HIGH",
      x: 52,
      y: 78,
      lat: 12.9176,
      lng: 77.6238,
      avgResponseMin: 8.5,
      topIssue: "Elevated Expressway Stranded Motorists"
    },
    {
      id: 3,
      name: "Central MG Road - Residency Road Corridor",
      incidents: 42,
      severity: "MEDIUM",
      x: 48,
      y: 38,
      lat: 12.9756,
      lng: 77.6066,
      avgResponseMin: 6.1,
      topIssue: "Weekend Night Out Fuel Exhaustion"
    },
    {
      id: 4,
      name: "Hebbal Flyover - Airport Expressway",
      incidents: 39,
      severity: "HIGH",
      x: 45,
      y: 18,
      lat: 13.0358,
      lng: 77.5970,
      avgResponseMin: 9.4,
      topIssue: "Highway High-Speed Tank Empties"
    },
    {
      id: 5,
      name: "Indiranagar 100ft Road & CMH Road",
      incidents: 35,
      severity: "MEDIUM",
      x: 58,
      y: 42,
      lat: 12.9784,
      lng: 77.6408,
      avgResponseMin: 6.8,
      topIssue: "Commuter Gridlock Stoppages"
    }
  ];

  const fleetUnits = [
    {
      id: "FR-01",
      partner: "Rajesh Kumar",
      vehicle: "KA-01-EQ-9021 (Safety Van)",
      fuelLiters: 180,
      x: 46,
      y: 40,
      status: "ON_THE_WAY",
      speed: "42 km/h"
    },
    {
      id: "FR-02",
      partner: "Vikram Singh",
      vehicle: "KA-05-MK-4412 (Quick Bike)",
      fuelLiters: 40,
      x: 66,
      y: 54,
      status: "PATROLLING",
      speed: "28 km/h"
    },
    {
      id: "FR-03",
      partner: "Pooja Patel",
      vehicle: "KA-03-JJ-8819 (Heavy Tender)",
      fuelLiters: 350,
      x: 50,
      y: 74,
      status: "STANDBY",
      speed: "0 km/h"
    }
  ];

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 space-y-6">
      
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center shadow-glow">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                Geographic Incident Intelligence
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Live Radar
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
              Breakdown Density Heatmap & Fleet Radar
            </h2>
          </div>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('HEATMAP')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'HEATMAP'
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Incident Heatmap</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('FLEET')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'FLEET'
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Live Fleet Radar</span>
            </button>
          </div>

          {/* Time Filter */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            {['TODAY', 'WEEK', 'MONTH'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-xl font-semibold transition ${
                  timeRange === t ? 'bg-slate-800 text-brand-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-slate-400 text-[11px] block">Total Grid Incidents</span>
          <span className="text-lg font-black text-white mt-0.5 block">238 Calls</span>
          <span className="text-[10px] text-emerald-400 font-bold">↑ 14% vs last week</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-slate-400 text-[11px] block">Avg Response Speed</span>
          <span className="text-lg font-black text-brand-400 mt-0.5 block">7.6 mins</span>
          <span className="text-[10px] text-emerald-400 font-bold">Fastest: 4.8m in MG Rd</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-slate-400 text-[11px] block">Highest Risk Hotspot</span>
          <span className="text-sm font-bold text-white mt-0.5 block truncate">Outer Ring Road</span>
          <span className="text-[10px] text-amber-400 font-semibold">64 stranded vehicles</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-slate-400 text-[11px] block">Active Fleet Density</span>
          <span className="text-lg font-black text-emerald-400 mt-0.5 block">100% Safe</span>
          <span className="text-[10px] text-slate-400">All PESO Certified Units</span>
        </div>
      </div>

      {/* Main Map Radar Stage */}
      <div className="relative w-full h-[420px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        {/* Dark City Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70" />

        {/* Vector Roadways and Corridors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Ring Road Vector */}
          <path
            d="M 120,60 C 260,70 380,140 370,280 C 350,380 200,390 100,320 C 60,260 70,120 120,60 Z"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Arterial Corridors */}
          <path d="M 220,20 L 220,380" fill="none" stroke="#334155" strokeWidth="6" strokeDasharray="6 4" />
          <path d="M 20,200 L 440,200" fill="none" stroke="#334155" strokeWidth="6" strokeDasharray="6 4" />
          <path d="M 60,340 L 380,80" fill="none" stroke="#1e293b" strokeWidth="8" />
        </svg>

        {/* HEATMAP LAYER: Gaussian Glow Circles */}
        {viewMode === 'HEATMAP' && (
          <div className="absolute inset-0 pointer-events-auto">
            {hotspots.map((spot) => {
              const size = spot.severity === 'CRITICAL' ? 140 : spot.severity === 'HIGH' ? 110 : 80;
              const isSelected = selectedHotspot?.id === spot.id;

              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedHotspot(spot)}
                  className="absolute cursor-pointer transition-transform hover:scale-110 -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  {/* Radiant Heat Blur Gradient */}
                  <div
                    className={`rounded-full blur-2xl opacity-60 animate-pulse ${
                      spot.severity === 'CRITICAL'
                        ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500'
                        : spot.severity === 'HIGH'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-500'
                    }`}
                    style={{ width: `${size}px`, height: `${size}px` }}
                  />

                  {/* Core Incident Marker */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg font-black text-[11px] text-white ${
                      spot.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-600'
                    }`}>
                      {spot.incidents}
                    </div>
                  </div>

                  {/* Floating Tag */}
                  <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-950/95 border border-slate-700 text-[10px] font-bold text-white shadow-xl opacity-90 group-hover:opacity-100">
                    {spot.name.split(' ')[0]} ({spot.incidents})
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FLEET RADAR LAYER: Moving Responders */}
        {viewMode === 'FLEET' && (
          <div className="absolute inset-0 pointer-events-auto">
            {fleetUnits.map((unit) => (
              <div
                key={unit.id}
                className="absolute cursor-pointer transition-all duration-1000 -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${unit.x}%`, top: `${unit.y}%` }}
              >
                {/* Radar Ping Rings */}
                <div className="w-12 h-12 rounded-full border border-brand-500/40 animate-ping absolute -inset-1" />

                <div className="relative w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-glow border-2 border-white">
                  <Truck className="w-5 h-5" />
                </div>

                {/* Fleet Card */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-44 p-2.5 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl text-[10px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>{unit.partner}</span>
                    <span className="text-emerald-400 font-mono">{unit.status}</span>
                  </div>
                  <p className="text-slate-400 truncate">{unit.vehicle}</p>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-800">
                    <span>Speed: {unit.speed}</span>
                    <span>Fuel: {unit.fuelLiters}L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Heatmap Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[10px] space-y-1.5 shadow-xl">
          <span className="font-bold text-white block uppercase tracking-wider">Breakdown Severity Scale</span>
          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
              <span>Critical (&gt;50)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span>High (35-50)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              <span>Moderate (&lt;35)</span>
            </span>
          </div>
        </div>

        {/* Live GPS Stamp */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Bengaluru City Emergency Perimeter</span>
        </div>
      </div>

      {/* Selected Hotspot Deep Dive Card */}
      {selectedHotspot && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-brand-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase">
                {selectedHotspot.severity} HOTSPOT
              </span>
              <h4 className="text-sm font-bold text-white">{selectedHotspot.name}</h4>
            </div>
            <p className="text-xs text-slate-400">
              Primary Cause: <span className="text-slate-200">{selectedHotspot.topIssue}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Avg Response</span>
              <span className="font-bold text-emerald-400">{selectedHotspot.avgResponseMin} mins</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Volume</span>
              <span className="font-bold text-white">{selectedHotspot.incidents} Incidents</span>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
