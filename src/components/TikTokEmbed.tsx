import { useEffect } from 'react';

interface TikTokEmbedProps {
  urlOrId: string; // Bisa berupa link lengkap (https://www.tiktok.com/@...) ATAU videoId angka saja
  username?: string;
}

// Fungsi untuk mengekstrak videoId dan username dari link TikTok
export function parseTikTokUrl(input: string): { videoId: string | null; username: string } {
  if (!input) return { videoId: null, username: 'tiktok' };

  // 1. Jika input sudah berupa deretan angka (videoId saja)
  if (/^\d+$/.test(input.trim())) {
    return { videoId: input.trim(), username: 'tiktok' };
  }

  // 2. Ekstraksi dari link standar: https://www.tiktok.com/@username/video/1234567890123456789
  const regex = /tiktok\.com\/@([^\/\?]+)\/video\/(\d+)/;
  const match = input.match(regex);

  if (match) {
    return {
      username: match[1],
      videoId: match[2],
    };
  }

  return { videoId: null, username: 'tiktok' };
}

export default function TikTokEmbed({ urlOrId, username: customUsername }: TikTokEmbedProps) {
  // Ekstrak ID dan Username dari input
  const parsed = parseTikTokUrl(urlOrId);
  const videoId = parsed.videoId;
  const username = customUsername || parsed.username;

  useEffect(() => {
    if (!videoId) return;

    // Cek apakah script embed TikTok sudah ada
    const existingScript = document.getElementById('tiktok-embed-script');

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'tiktok-embed-script';
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      if (typeof window !== 'undefined' && (window as any).tiktokEmbed) {
        setTimeout(() => {
          (window as any).tiktokEmbed.render();
        }, 100);
      }
    }
  }, [videoId]);

  // Jika link/ID tidak valid
  if (!videoId) {
    return (
      <div className="w-full p-4 text-center text-red-400 bg-red-950/30 rounded-xl border border-red-800/50 text-sm">
        Link TikTok tidak valid. Pastikan formatnya seperti: <br />
        <code className="text-xs text-gray-300">https://www.tiktok.com/@user/video/1234567890...</code>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-[#111111] sm:bg-transparent rounded-xl overflow-hidden py-2">
      <blockquote
        className="tiktok-embed"
        cite={`https://www.tiktok.com/@${username}/video/${videoId}`}
        data-video-id={videoId}
        style={{ maxWidth: '605px', minWidth: '325px', width: '100%', margin: 0 }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            title={`@${username}`}
            href={`https://www.tiktok.com/@${username}?refer=embed`}
          >
            @{username}
          </a>
        </section>
      </blockquote>
    </div>
  );
}