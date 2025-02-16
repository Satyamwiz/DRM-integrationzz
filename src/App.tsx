import React, { useState, useEffect, useRef } from 'react';
import ShakaPlayer from 'shaka-player-react';
import 'shaka-player/dist/controls.css';



const DRM_VIDEOS = [
  {
    url: 'https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd',
    title: 'Sintel (Protected)',
    drmConfig: {
      drm: {
        servers: {
          'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth'
        }
      }
    }
  }
];

function App() {
  const [currentVideo, setCurrentVideo] = useState(DRM_VIDEOS[0]);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Add screen recording prevention
    const style = document.createElement('style');
    style.textContent = `
      video::-internal-media-controls-overlay-cast-button {
        display: none;
      }
      video::-webkit-media-controls {
        display: none !important;
      }
      video {
        -webkit-filter: none !important;
      }
    `;
    document.head.appendChild(style);

    // Prevent screen capture
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = async function(constraints) {
        try {
          const stream = await originalGetDisplayMedia.call(navigator.mediaDevices, constraints);
          stream.getTracks().forEach(track => track.stop());
          throw new Error('Screen recording is not allowed');
        } catch (err) {
          throw new Error('Screen recording is not allowed');
        }
      };
    }

    return () => {
      document.head.removeChild(style);
    };
  }, []);

 

  const onPlayerRef = (player: any) => {
    playerRef.current = player;

    if (player) {
      const shakaInstance = player.player;
      
      if (shakaInstance) {
        // Configure DRM
        shakaInstance.configure(currentVideo.drmConfig);

        // Add error handler
        shakaInstance.addEventListener('error', (event: any) => {
          console.error('Error code', event.detail.code, 'object', event);
          setError(`Playback Error: ${event.detail.message}`);
        });
      }

      // Prevent screen capture using JavaScript
      const video = player.video;
      if (video) {
        video.addEventListener('contextmenu', (e: Event) => e.preventDefault());
        video.style.webkitUserSelect = 'none';
        video.style.userSelect = 'none';
        video.style.webkitTouchCallout = 'none';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Protected Video Player</h1>
          <p className="text-gray-400 text-center">DRM-Protected Content</p>
        </header>

        <div className="max-w-4xl mx-auto">
          {error ? (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          ) : null}

          <div className="bg-black rounded-lg overflow-hidden shadow-xl relative">
            <div className="aspect-video">
              <ShakaPlayer 
                ref={onPlayerRef}
                src={currentVideo.url}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold">{currentVideo.title}</h2>
            
          
          </div> 
        </div>

        
      </div>
    </div>
  );
}

export default App;