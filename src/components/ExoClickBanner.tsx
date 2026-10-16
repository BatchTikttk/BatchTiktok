import { useEffect, useRef } from 'react';

interface ExoClickBannerProps {
  zoneId?: string;
  subId?: string;
}

export default function ExoClickBanner({ zoneId = "6057316", subId = "123450000" }: ExoClickBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    // 1. Buat elemen <ins> dengan Zone ID yang dikirim lewat props
    const ins = document.createElement('ins');
    ins.className = 'eas6a97888e2';
    ins.setAttribute('data-zoneid', zoneId);
    ins.setAttribute('data-sub', subId);

    // 2. Buat script pemanggil iklan
    const scriptServe = document.createElement('script');
    scriptServe.innerHTML = '(AdProvider = window.AdProvider || []).push({"serve": {}});';

    // 3. Masukkan ke dalam container
    bannerRef.current.appendChild(ins);
    bannerRef.current.appendChild(scriptServe);

    // 4. Load script provider utama jika belum ada
    if (!document.getElementById('exoclick-provider-script')) {
      const script = document.createElement('script');
      script.id = 'exoclick-provider-script';
      script.async = true;
      script.type = 'application/javascript';
      script.src = 'https://a.magsrv.com/ad-provider.js';
      document.body.appendChild(script);
    }
  }, [zoneId, subId]);

  return (
    <div className="flex justify-center items-center my-4 overflow-hidden w-full min-h-[90px]">
      <div ref={bannerRef} />
    </div>
  );
}