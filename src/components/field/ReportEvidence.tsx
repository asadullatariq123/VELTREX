import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Clock, Camera, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface ReportEvidenceProps {
  locationId?: string;
}

export const ReportEvidence: React.FC<ReportEvidenceProps> = ({ locationId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [locationId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getFieldReports({ locationId, limit: 10 });
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const sampleReports = [
    {
      id: 'fr-demo-01',
      clientReportId: 'VELTREX-2026-901',
      reportType: 'LANDSLIDE',
      severity: 'CRITICAL',
      description: 'Active slope soil slump observed blocking 20 meters of local NH-54 shoulder near Aizawl.',
      observedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'RECEIVED',
      verificationStatus: 'VERIFIED',
      aiVerificationStatus: 'VERIFIED',
      aiConfidence: 0.94,
      reporterName: 'Inspector Lalthanga',
      reporterRole: 'FIELD_OFFICER',
      latitude: 23.7271,
      longitude: 92.7176,
      media: [{ publicUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' }],
    },
    {
      id: 'fr-demo-02',
      clientReportId: 'VELTREX-2026-902',
      reportType: 'CRACK',
      severity: 'HIGH',
      description: 'Long longitudinal tension crack opening on upper slope embankment.',
      observedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'RECEIVED',
      verificationStatus: 'PENDING',
      aiVerificationStatus: 'FLAGGED',
      aiConfidence: 0.78,
      reporterName: 'Pema Dorjee',
      reporterRole: 'COMMUNITY_USER',
      latitude: 27.5861,
      longitude: 91.8594,
      media: [{ publicUrl: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=400&q=80' }],
    },
  ];

  const displayReports = reports.length > 0 ? reports : sampleReports;

  return (
    <div className="veltrex-card p-5 rounded-2xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <h3 className="text-xs font-black text-veltrex-cobalt uppercase tracking-wider">
            RECENT FIELD OBSERVATION SIGNALS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 font-bold">
          {displayReports.length} REPORTS RECEIVED
        </span>
      </div>

      <div className="space-y-3">
        {displayReports.map((r) => (
          <div
            key={r.id}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5 hover:bg-slate-100/80 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-extrabold text-sm text-slate-900">{r.reportType}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : r.severity === 'HIGH'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {r.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                    {r.verificationStatus}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-1">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(r.observedAt).toLocaleTimeString()}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}</span>
                  </span>
                  <span>•</span>
                  <span>By {r.reporterName} ({r.reporterRole})</span>
                </div>
              </div>

              {r.aiConfidence !== undefined && (
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block">AI VERIFICATION</span>
                  <span className="font-bold text-sky-700">{Math.round((r.aiConfidence || 0) * 100)}% Match</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">{r.description}</p>

            {/* Media thumbnail if present */}
            {r.media && r.media.length > 0 && (
              <div className="flex items-center space-x-2 pt-1">
                {r.media.map((m: any, idx: number) => (
                  <div key={idx} className="w-14 h-14 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shadow-sm">
                    <img 
                      src={m.publicUrl} 
                      alt="Evidence thumbnail" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
