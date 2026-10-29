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
  Send,
  Loader2,
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

  // Google Apps Script Webhook field
  const [gasUrl, setGasUrl] = useState<string>('');
  const [gasSaved, setGasSaved] = useState<boolean>(false);
  const [isTestingGas, setIsTestingGas] = useState<boolean>(false);
  const [gasTestResult, setGasTestResult] = useState<{ success: boolean; message: string; fileUrl?: string } | null>(null);

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
      const savedGas = localStorage.getItem('baswara_gas_url') || '';
      setGasUrl(savedGas);
    }
  }, [isOpen]);

  const handleSaveGasUrl = () => {
    const trimmed = gasUrl.trim();
    if (trimmed) {
      localStorage.setItem('baswara_gas_url', trimmed);
      setGasSaved(true);
      setTimeout(() => setGasSaved(false), 2500);
    } else {
      localStorage.removeItem('baswara_gas_url');
    }
  };

  const handleTestGasWebhook = async () => {
    const trimmed = gasUrl.trim();
    if (!trimmed) {
      setGasTestResult({ success: false, message: 'Harap masukkan URL Webhook terlebih dahulu.' });
      return;
    }

    setIsTestingGas(true);
    setGasTestResult(null);

    try {
      // 1x1 transparent PNG / tiny JPEG as base64
      const tinyBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
      
      const payload = {
        base64: tinyBase64,
        fileName: `Test_Connection_${Date.now()}.jpg`,
      };

      const res = await fetch(trimmed, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json && json.success) {
        localStorage.setItem('baswara_gas_url', trimmed);
        setGasTestResult({
          success: true,
          message: 'Koneksi Berhasil! File test berhasil dibuat di Google Drive Anda (folder "Baswara Sky Suites - Invoices").',
          fileUrl: json.url,
        });
      } else {
        const errMsg = json?.error || `Server merespon dengan status ${res.status}.`;
        let guidance = '';
        if (errMsg.includes('Access denied') || errMsg.includes('DriveApp')) {
          guidance = 'PENTING: Di script.google.com, pilih fungsi "testAuth" lalu klik "Jalankan (Run)". Klik "Tinjau Izin" -> "Lanjutan (Advanced)" -> "Buka Untitled project (tidak aman)" -> "Izinkan". Setelah itu klik Deploy > Manage deployments > Edit > Version: New version!';
        } else {
          guidance = 'Pastikan opsi "Who has access" disetel "Anyone" saat deploy Web App.';
        }
        setGasTestResult({
          success: false,
          message: `${errMsg} ${guidance}`,
        });
      }
    } catch (err: any) {
      setGasTestResult({
        success: false,
        message: `Gagal memanggil Webhook: ${err.message}. Pastikan URL berakhiran /exec dan memiliki izin akses Publik.`,
      });
    } finally {
      setIsTestingGas(false);
    }
  };

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

  const gasSampleCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Simpan otomatis ke folder "Baswara Sky Suites - Invoices" di Google Drive pribadi Anda
    var folderName = "Baswara Sky Suites - Invoices";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var cleanBase64 = (data.base64 || "").replace(/^data:image\\/[a-z]+;base64,/, "");
    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, "image/jpeg", data.fileName || ("Invoice_" + new Date().getTime() + ".jpg"));
    
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
}

function testAuth() {
  // Jalankan fungsi ini di editor Apps Script untuk memicu persetujuan izin pertama kali (OAuth)
  var folderName = "Baswara Sky Suites - Invoices";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  Logger.log("SUKSES! Akses Google Drive Berhasil Aktif. Folder: " + folder.getName() + " (ID: " + folder.getId() + ")");
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
            Solusi Kuota Google Drive (0 GB Service Account)
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Data Google Sheets sudah 100% masuk. Untuk menyimpan file gambar JPG ke Google Drive Anda tanpa kendala kuota 0 GB, hubungkan Webhook Google Apps Script di bawah ini.
          </p>
        </div>

        {/* Section 1: Google Apps Script Webhook Input (Paling Instan) */}
        <div className="p-4 bg-[#111827] border-2 border-[#D4AF37]/60 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-bold flex items-center gap-1.5">
              <FolderSync size={15} />
              <span>Input URL Google Apps Script Webhook:</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/30">
              100% Menggunakan Kuota 15 GB Anda
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            Tempel URL Web App dari Google Apps Script Anda (yang berakhiran <code className="text-[#F3E5AB]">/exec</code>). URL ini akan otomatis dipakai untuk mengunggah semua invoice & kuitansi langsung ke Google Drive Anda:
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 bg-[#080C14] border border-slate-700 text-slate-100 p-2.5 text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveGasUrl}
                className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-[#0B0F19] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                {gasSaved ? 'Tersimpan!' : 'Simpan'}
              </button>

              <button
                type="button"
                onClick={handleTestGasWebhook}
                disabled={isTestingGas || !gasUrl.trim()}
                className="px-3.5 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingGas ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>{isTestingGas ? 'Menguji...' : 'Uji Webhook'}</span>
              </button>
            </div>
          </div>

          {gasTestResult && (
            <div className={`p-2.5 text-xs flex items-start gap-2 border ${
              gasTestResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              {gasTestResult.success ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />}
              <div className="space-y-1">
                <span>{gasTestResult.message}</span>
                {gasTestResult.fileUrl && (
                  <div>
                    <a
                      href={gasTestResult.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D4AF37] underline inline-flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Lihat file test di Google Drive</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Code Snippet to Copy */}
        <div className="p-4 bg-[#080C14] border border-slate-800 space-y-3 text-xs mb-6">
          <div className="flex items-center justify-between">
            <div className="font-serif text-[#F3E5AB] text-sm flex items-center gap-1.5">
              <HelpCircle size={15} className="text-[#D4AF37]" />
              <span>Kode Google Apps Script Siap Salin (1-Click)</span>
            </div>
            <button
              onClick={handleCopyGas}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              {copiedScript ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedScript ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
          </div>

          <div className="text-slate-300 text-[11px] leading-relaxed space-y-1.5 font-light">
            <p>1. Buka <strong className="text-white">script.google.com</strong> login dengan akun <code className="text-[#D4AF37] font-semibold">feel.ix.ee@gmail.com</code>.</p>
            <p>2. Buat Project Baru (atau buka project yang ada), hapus semua kode bawaan, lalu <strong>tempel kode di bawah</strong>.</p>
            <p className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-200">
              3. <strong className="text-white">PENTING (Mengatasi 'Access denied: DriveApp'):</strong> Di toolbar atas, pilih fungsi <strong className="font-mono text-white">testAuth</strong> lalu klik tombol <strong className="text-white">Jalankan (Run)</strong>.<br />
              &bull; Muncul kotak <em>"Otorisasi Diperlukan"</em> &rarr; klik <strong className="text-white">Tinjau Izin</strong> &rarr; Pilih akun Anda.<br />
              &bull; Muncul <em>"Google belum memverifikasi..."</em> &rarr; klik tulisan kecil <strong className="text-[#D4AF37]">Lanjutan (Advanced)</strong> di kiri bawah &rarr; klik <strong className="text-[#D4AF37]">Buka Untitled project (tidak aman)</strong> &rarr; klik <strong className="text-emerald-400">Izinkan (Allow)</strong>.<br />
              &bull; Di log eksekusi akan muncul status <em>SUKSES</em>.
            </p>
            <p>4. Klik <strong className="text-white">Deploy</strong> &gt; <strong className="text-white">New deployment</strong> (atau <em>Manage deployments &gt; Edit &gt; Version: New version</em>).<br />
              Pilih: <strong>Web app</strong> | Execute as: <strong className="text-[#D4AF37]">Me (feel.ix.ee@gmail.com)</strong> | Who has access: <strong className="text-emerald-400">Anyone (Siapa saja)</strong>.<br />
              Klik <strong>Deploy</strong>, lalu salin URL Web App yang berakhiran <code className="text-[#F3E5AB]">/exec</code> ke kolom di atas.
            </p>
          </div>

          <pre className="p-3 bg-black/60 border border-slate-800 text-slate-300 font-mono text-[10px] overflow-x-auto max-h-40 overflow-y-auto leading-relaxed">
            {gasSampleCode}
          </pre>
        </div>

        {/* Section 3: Status Diagnostics */}
        {data && (
          <div className="p-3.5 bg-[#111827] border border-slate-800 text-xs space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Status Koneksi Service Account:</span>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 font-mono text-[10px] cursor-pointer"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span>Refresh Status</span>
              </button>
            </div>
            <div className="text-slate-300 text-[11px]">
              {data.serviceAccountDiagnosis}
            </div>
          </div>
        )}

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
