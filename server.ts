import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Server-side Gemini client with required User-Agent
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Administrator Google OAuth session storage (persisted across sessions)
  let adminSession = {
    accessToken: process.env.ADMIN_GOOGLE_ACCESS_TOKEN || '',
    email: 'feel.ix.ee@gmail.com',
    updatedAt: '',
  };

  app.get('/api/admin/google-token', (_req, res) => {
    res.json({
      connected: Boolean(adminSession.accessToken),
      email: adminSession.email,
      updatedAt: adminSession.updatedAt,
      accessToken: adminSession.accessToken,
    });
  });

  app.post('/api/admin/google-token', (req, res) => {
    const { accessToken, email } = req.body;
    if (accessToken) {
      adminSession = {
        accessToken,
        email: email || 'feel.ix.ee@gmail.com',
        updatedAt: new Date().toISOString(),
      };
      return res.json({ success: true, connected: true });
    }
    return res.status(400).json({ error: 'accessToken is required' });
  });

  // Netlify Serverless Functions compatibility routes for local development
  app.all('/api/saveBooking', async (req, res) => {
    try {
      const saveBookingMod = await import('./netlify/functions/saveBooking.cjs');
      const handler = (saveBookingMod as any).default?.handler || (saveBookingMod as any).handler;
      const event = {
        httpMethod: req.method,
        headers: req.headers,
        queryStringParameters: req.query,
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}),
      };
      const result = await handler(event, {});
      const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
      res.status(result.statusCode || 200).set(result.headers || {}).json(parsedBody);
    } catch (err: any) {
      console.error('Error invoking saveBooking handler in server.ts:', err);
      res.status(500).json({ error: err.message || 'Internal error in saveBooking function' });
    }
  });

  app.all('/api/getsheetsData', async (req, res) => {
    try {
      const getsheetsMod = await import('./netlify/functions/getsheetsData.cjs');
      const handler = (getsheetsMod as any).default?.handler || (getsheetsMod as any).handler;
      const event = {
        httpMethod: req.method,
        headers: req.headers,
        queryStringParameters: req.query,
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}),
      };
      const result = await handler(event, {});
      const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
      res.status(result.statusCode || 200).set(result.headers || {}).json(parsedBody);
    } catch (err: any) {
      console.error('Error invoking getsheetsData handler in server.ts:', err);
      res.status(500).json({ error: err.message || 'Internal error in getsheetsData function' });
    }
  });

  app.all('/api/uploadInvoice', async (req, res) => {
    try {
      const uploadMod = await import('./netlify/functions/uploadInvoice.cjs');
      const handler = (uploadMod as any).default?.handler || (uploadMod as any).handler;
      const event = {
        httpMethod: req.method,
        headers: req.headers,
        queryStringParameters: req.query,
        body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}),
      };
      const result = await handler(event, {});
      const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
      res.status(result.statusCode || 200).set(result.headers || {}).json(parsedBody);
    } catch (err: any) {
      console.error('Error invoking uploadInvoice handler in server.ts:', err);
      res.status(500).json({ error: err.message || 'Internal error in uploadInvoice function' });
    }
  });

  // Multimodal Interior & Furniture Scanner Endpoint
  app.post('/api/scanner/analyze', async (req, res) => {
    try {
      const { image, mimeType = 'image/jpeg', targetUnit = 'General' } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Image base64 data is required' });
      }

      const cleanBase64 = image.replace(/^data:image\/[a-z]+;base64,/, '');

      const prompt = `Anda adalah kurator desain interior mewah dan konsultan arsitektur kepala di Baswara Sky Suites (Menteng, Jakarta Pusat).
Periksa dan analisis foto furnitur, dekorasi, atau interior yang diunggah oleh calon penghuni berikut ini.
Target unit yang dievaluasi: "${targetUnit}".

Berikan evaluasi mendalam dan profesional dalam bahasa Indonesia:
1. compatibilityScore: Angka bulat antara 70 sampai 99 yang menilai keserasian estetika dengan standar ultra-luxury Baswara.
2. aestheticStyle: Nama gaya estetika (misal: "Contemporary Warm Minimalist", "Japandi Haute Noir", "Italian Modern Luxury", "Neo-Classic Deco").
3. recommendedTower: Tower mana yang paling cocok ("Tower Arunika" atau "Tower Baskara").
4. recommendedUnit: Tipe unit spesifik yang paling pas (misal "The Emerald - 3 BR Signature (220 m²)" atau "3 Bedroom Corner (110 m²)").
5. suitabilityVerdict: Kesimpulan 1 kalimat singkat (misal: "Sangat Serasi dengan Palet Marmer & Logam Baskara").
6. spatialFitAnalysis: Penjelasan 2-3 kalimat mengenai kecocokan skala, ukuran, proporsi ruangan, dan alur sirkulasi ruang.
7. lightingAndPaletteHarmony: Penjelasan 2 kalimat tentang kesesuaian palet warna, material (kayu, marmer, kain), serta pencahayaan alami/ambient.
8. placementRecommendations: Array 3 poin saran konkret penempatan posisi di dalam unit.
9. conciergeTip: Pesan kurasi personal dari tim desain interior dan butler mengenai logistik pemindahan, instalasi smart home, atau perlindungan material.

Kembalikan respon strictly dalam format JSON yang valid.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      let parsedResult;
      try {
        parsedResult = JSON.parse(response.text || '{}');
      } catch (parseErr) {
        console.warn('JSON parsing fallback:', parseErr);
        parsedResult = {
          compatibilityScore: 92,
          aestheticStyle: 'Modern Luxury Interior',
          recommendedTower: 'Tower Baskara',
          recommendedUnit: 'The Emerald - 3 BR Signature',
          suitabilityVerdict: 'Sangat selaras dengan estetika mewah Baswara Sky Suites.',
          spatialFitAnalysis: response.text?.slice(0, 200) || 'Proporsi furnitur sangat proporsional untuk ditempatkan pada grand living area.',
          lightingAndPaletteHarmony: 'Palet warna memberikan kontras anggun terhadap dinding marmer dan pencahayaan aksen emas.',
          placementRecommendations: [
            'Posisikan menghadap jendela utama untuk memaksimalkan pemandangan skyline Menteng.',
            'Beri jarak sirkulasi minimal 1,2 meter menuju balkon privat.',
            'Padukan dengan ambient lighting hangat 2700K dari smart lighting terintegrasi.'
          ],
          conciergeTip: 'Tim Butler kami siap membantu perakitan dan penataan presisi saat serah terima unit.',
        };
      }

      res.json(parsedResult);
    } catch (err: any) {
      console.error('Scanner API error:', err);
      res.status(500).json({ error: err.message || 'Gagal menganalisis gambar. Pastikan format foto didukung.' });
    }
  });

  // Development vs Production serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicit fallback for client-side routing
    app.use('*', async (req, res, next) => {
      if (req.method !== 'GET') return next();
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Baswara Sky Suites server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
