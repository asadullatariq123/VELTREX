import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { GPSCapture } from './GPSCapture';
import { MediaCapture, MediaCaptureItem } from './MediaCapture';
import { offlineQueue } from '../../services/offlineReportQueue';
import { apiClient } from '../../services/apiClient';
import { liveStore } from '../../services/liveSimulationStore';

export const FieldReportForm: React.FC = () => {
  const selectedLoc = liveStore.getSelectedLocation();
  const [latitude, setLatitude] = useState(selectedLoc.coordinates?.lat || 23.7271);
  const [longitude, setLongitude] = useState(selectedLoc.coordinates?.lng || 92.7176);
  const [accuracy, setAccuracy] = useState<number | undefined>(12);
  const [reportType, setReportType] = useState('LANDSLIDE');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Inspector Lalthanga');
  const [reporterRole, setReporterRole] = useState('FIELD_OFFICER');
  const [mediaItems, setMediaItems] = useState<MediaCaptureItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description for the observation.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);

    const clientReportId = offlineQueue.generateClientReportId();
    const isOnline = navigator.onLine;

    if (!isOnline) {
      // Save offline to IndexedDB
      await offlineQueue.saveReportOffline({
        clientReportId,
        latitude,
        longitude,
        reportType,
        severity,
        description,
        observedAt: new Date().toISOString(),
        locationId: selectedLoc.id,
        reporterName,
        reporterRole,
        accuracy,
        mediaItems,
      });

      setSuccessMsg('Report saved offline! It will sync automatically when network connection returns.');
      resetForm();
      setSubmitting(false);
      return;
    }

    // Try online API submission
    try {
      const res = await apiClient.createFieldReport({
        clientReportId,
        latitude,
        longitude,
        reportType,
        severity,
        description,
        observedAt: new Date().toISOString(),
        locationId: selectedLoc.id,
        reporterName,
        reporterRole,
        accuracy,
      });

      if (res.success && res.data) {
        const reportId = res.data.id;
        // Upload media attachments if any
        if (mediaItems.length > 0) {
          for (const item of mediaItems) {
            await apiClient.uploadFieldReportMedia(reportId, item.base64Data, item.fileName).catch(() => {});
          }
        }
        setSuccessMsg(`Field Report submitted successfully (ID: ${clientReportId.substring(0, 16)}...). Verification status: PENDING.`);
        resetForm();
      }
    } catch {
      // Fallback offline queue if API call fails
      await offlineQueue.saveReportOffline({
        clientReportId,
        latitude,
        longitude,
        reportType,
        severity,
        description,
        observedAt: new Date().toISOString(),
        locationId: selectedLoc.id,
        reporterName,
        reporterRole,
        accuracy,
        mediaItems,
      });
      setSuccessMsg('Network issue detected. Report queued offline for automatic retry.');
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setMediaItems([]);
  };

  return (
    <form onSubmit={handleSubmit} className="veltrex-card p-6 rounded-2xl space-y-6 font-sans">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-veltrex-cobalt text-white flex items-center justify-center font-bold">
          <ShieldAlert className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-veltrex-cobalt tracking-tight">SUBMIT FIELD OBSERVATION REPORT</h2>
          <p className="text-xs text-slate-500 font-mono">Geo-tagged Citizen & Field Officer Intelligence Signal</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{successMsg}</p>
        </div>
      )}

      {/* GPS Capture */}
      <GPSCapture
        latitude={latitude}
        longitude={longitude}
        accuracy={accuracy}
        onChange={(lat, lng, acc) => {
          setLatitude(lat);
          setLongitude(lng);
          setAccuracy(acc);
        }}
      />

      {/* Report Type & Severity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase font-mono">OBSERVATION TYPE</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-veltrex-cobalt"
          >
            <option value="LANDSLIDE">LANDSLIDE OBSERVATION</option>
            <option value="CRACK">SLOPE CRACK / FISSURE</option>
            <option value="ROCKFALL">ROCKFALL / DEBRIS FALL</option>
            <option value="ROAD_BLOCKAGE">ROAD / HIGHWAY BLOCKAGE</option>
            <option value="SLOPE_FAILURE">SLOPE INSTABILITY</option>
            <option value="FLOODING">FLASH FLOODING / RUNOFF</option>
            <option value="DRAINAGE_FAILURE">DRAINAGE SYSTEM FAILURE</option>
            <option value="OTHER">OTHER HAZARD</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase font-mono">SEVERITY LEVEL</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-veltrex-cobalt"
          >
            <option value="LOW">LOW — Minor observation</option>
            <option value="MODERATE">MODERATE — Potential hazard</option>
            <option value="HIGH">HIGH — Active movement</option>
            <option value="CRITICAL">CRITICAL — Severe risk to life/road</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase font-mono">OBSERVATION DETAILS & NARRATIVE</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe ground cracks, soil displacement, weather conditions, or affected infrastructure..."
          className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-veltrex-cobalt"
          required
        />
      </div>

      {/* Media Evidence Upload */}
      <MediaCapture mediaItems={mediaItems} onChange={setMediaItems} />

      {/* Reporter Details Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1">REPORTER NAME</label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1">REPORTER ROLE</label>
          <select
            value={reporterRole}
            onChange={(e) => setReporterRole(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
          >
            <option value="FIELD_OFFICER">FIELD OFFICER</option>
            <option value="DISTRICT_AUTHORITY">DISTRICT AUTHORITY</option>
            <option value="COMMUNITY_USER">COMMUNITY CITIZEN</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-veltrex-cobalt text-white rounded-xl font-bold font-mono text-sm flex items-center justify-center space-x-2 hover:bg-sky-900 transition-all shadow-md"
      >
        <Send className={`w-4 h-4 ${submitting ? 'animate-pulse' : ''}`} />
        <span>{submitting ? 'SUBMITTING FIELD REPORT...' : 'SUBMIT FIELD REPORT'}</span>
      </button>
    </form>
  );
};
