import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Shield,
  ExternalLink,
  HelpCircle,
  FolderSync,
} from 'lucide-react';
import { googleSignIn, saveAdminToken, auth, getAccessToken } from '../lib/googleAuth';

interface AdminDriveStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiagResult {
  hasClientEmail: boolean;
  hasPrivateKey: boolean;
  spreadsheetId: string;
  folderId: string;
  spreadsheetAccessible?: boolean;
  folderAccessible?: boolean;
  folderName?: string;
  serviceAccountDiagnosis?: string;
  recommendations?: string[];
  error?: string;
}

export const AdminDriveStatusModal: React.FC<AdminDriveStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiagResult | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drive-check');
      const json = await res.json();
      setData(json);
      const token = await getAccessToken();
      setAdminToken(token);
    } catch (err: any) {
      setData({
        hasClientEmail: false,
        hasPrivateKey: false,
        spreadsheetId: '1stru_AZYdNuEfAW6euxwkuYUPbNBCGb38oWEgIKJ03A',
        folderId: '1P7txSenSZUnfOy7QCFLLo6tsPHk3nKjM',
        serviceAccountDiagnosis: `Gagal memanggil endpoint /api/admin/drive-check: ${err.message}`,
        recommendations: [
          'Pastikan fungsi Netlify "driveCheck.cjs" telah ter-deploy dengan baik di netlify/functions.',
          'Pastikan konfigurasi netlify.toml memetakan /api/admin/drive-check ke /.netlify/functions/driveCheck.',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleConnectAdmin = async () => {
    setIsConnectingGoogle(true);
    try {
      const res = await googleSignIn();
      if (res.user && res.accessToken) {
        await saveAdminToken(res.accessToken, res.user.email || 'feel.ix.ee@gmail.com');
        setAdminToken(res.accessToken);
        await fetchStatus();
      }
    } catch {
      // Graceful error handle
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const gasSampleCode = `// Buka script.google.com dengan akun feel.ix.ee@gmail.com
// Buat project baru, tempel kode berikut, lalu Deploy > New deployment > Web app:
// - Execute as: Me (feel.ix.ee@gmail.com)
// - Who has access: Anyone
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folder = DriveApp.getFolderById(data.folderId || "1P7txSenSZUnfOy7QCFLLo6tsPHk3nKjM");
    var decoded = Utilities.base64Decode(data.base64.replace(/^data:image\\/[a-z]+;base64,/, ""));
    var blob = Utilities.newBlob(decoded, "image/jpeg", data.fileName || "Invoice.jpg");
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: file.getId(),
      url: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyGas = () => {
    navigator.clipboard.writeText(gasSampleCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex justify-center items-center">
      <div className="bg-[#0D111A] border border-[#D4AF37]/50 w-full max-w-2xl p-6 sm:p-8 relative my-6 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 cursor-pointer"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono mb-1.5 flex items-center gap-2">
            <HardDrive size={15} />
            <span>Netlify & Google Drive Integration Inspector</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-[#F3E5AB]">
            Diagnostik Koneksi Google Drive & Sheets
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Gunakan panel ini untuk memeriksa status variabel lingkungan Netlify dan koneksi Google Drive Anda.
          </p>
        </div>

        {/* Refresh & Connect Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#111827] border border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${adminToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs text-slate-200">
              Status Admin OAuth: <strong className={adminToken ? 'text-emerald-400' : 'text-amber-400'}>
                {adminToken ? 'Aktif (feel.ix.ee@gmail.com)' : 'Belum Login'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConnectAdmin}
              disabled={isConnectingGoogle}
              className="py-1.5 px-3 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] font-semibold text-xs transition-colors cursor-pointer"
            >
              {isConnectingGoogle ? 'Menghubungkan...' : 'Hubungkan Akun Google'}
            </button>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh Diagnostik"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Live Diagnostics Card */}
        {data && (
          <div className="space-y-4 text-xs mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Service Account Email */}
              <div className="p-3 bg-[#080C14] border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 uppercase font-mono text-[10px]">GOOGLE_CLIENT_EMAIL</span>
                  {data.hasClientEmail ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                      <CheckCircle2 size={12} /> Terisi
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-mono text-[10px]">
                      <AlertCircle size={12} /> Kosong
                    </span>
                  )}
                </div>
                <div className="text-slate-200 font-mono text-[11px] truncate">
                  {data.hasClientEmail ? 'Service Account Terkonfigurasi' : 'Belum diisi di Netlify'}
                </div>
              </div>

              {/* Private Key */}
              <div className="p-3 bg-[#080C14] border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 uppercase font-mono text-[10px]">GOOGLE_PRIVATE_KEY</span>
                  {data.hasPrivateKey ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                      <CheckCircle2 size={12} /> Terisi
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-mono text-[10px]">
                      <AlertCircle size={12} /> Kosong
                    </span>
                  )}
                </div>
                <div className="text-slate-200 font-mono text-[11px]">
                  {data.hasPrivateKey ? 'Private Key Terformat' : 'Belum diisi di Netlify'}
                </div>
              </div>

              {/* Spreadsheet */}
              <div className="p-3 bg-[#080C14] border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 uppercase font-mono text-[10px]">GOOGLE_SPREADSHEET_ID</span>
                  {data.spreadsheetAccessible ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                      <CheckCircle2 size={12} /> Terhubung
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-mono text-[10px]">
                      <AlertCircle size={12} /> Belum Izin
                    </span>
                  )}
                </div>
                <div className="text-slate-300 text-[11px] font-mono truncate">
                  {data.spreadsheetId}
                </div>
              </div>

              {/* Drive Folder */}
              <div className="p-3 bg-[#080C14] border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 uppercase font-mono text-[10px]">GOOGLE_DRIVE_FOLDER_ID</span>
                  {data.folderAccessible ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                      <CheckCircle2 size={12} /> Ditemukan
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-mono text-[10px]">
                      <AlertCircle size={12} /> Belum Di-share
                    </span>
                  )}
                </div>
                <div className="text-slate-300 text-[11px] font-mono truncate">
                  {data.folderName || data.folderId}
                </div>
              </div>
            </div>

            {/* Diagnosis Message */}
            <div className="p-4 bg-[#111827] border border-[#D4AF37]/30 space-y-2">
              <div className="font-semibold text-[#F3E5AB] flex items-center gap-2">
                <Shield size={14} className="text-[#D4AF37]" />
                <span>Analisis Koneksi:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {data.serviceAccountDiagnosis}
              </p>
              {data.recommendations && data.recommendations.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="font-mono text-[11px] uppercase text-[#D4AF37]">
                    Langkah Perbaikan yang Diperlukan:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    {data.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Why Google Drive fails with 0GB quota explanation */}
        <div className="p-4 bg-[#080C14] border border-slate-800 space-y-3 text-xs mb-6">
          <div className="font-serif text-[#F3E5AB] text-sm flex items-center gap-1.5">
            <HelpCircle size={15} className="text-[#D4AF37]" />
            <span>Mengapa di Google Sheets Muncul "Belum diunggah" di Netlify?</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-light">
            Google Cloud <strong>Service Account</strong> di akun Google pribadi (<code className="text-[#D4AF37]">@gmail.com</code>) memiliki kuota penyimpanan <strong>0 GB</strong>. Ketika Service Account mencoba mengunggah file JPG ke folder pribadi Anda, Google menolak dengan error <code className="text-rose-400">403: Service accounts do not have storage quota</code>.
          </p>

          <div className="space-y-2 pt-1">
            <div className="text-slate-200 font-medium">3 Solusi Praktis:</div>
            <div className="space-y-1.5 pl-2 text-slate-300">
              <div>
                <strong className="text-[#F3E5AB]">1. Hubungkan Akun Google Admin:</strong> Klik tombol kuning di atas. Ini memberikan token langsung untuk mengunggah menggunakan kuota 15 GB akun Anda.
              </div>
              <div>
                <strong className="text-[#F3E5AB]">2. Gunakan Shared Drive (Drive Bersama):</strong> Buat Shared Drive di Google Drive, undang email Service Account sebagai Content Manager.
              </div>
              <div>
                <strong className="text-[#F3E5AB]">3. Gunakan Google Apps Script Webhook (Paling Praktis):</strong> Buat script di bawah di akun Google Anda, deploy sebagai Web App, lalu tambahkan URL-nya ke Environment Variable Netlify: <code className="text-[#D4AF37]">GOOGLE_APPS_SCRIPT_URL</code>.
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={handleCopyGas}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              {copiedScript ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedScript ? 'Kode Script Tersalin!' : 'Salin Kode Google Apps Script'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
