'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePWA } from './pwa-provider';

export function InstallBanner() {
  const { canInstall, installApp, isInstalled } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show banner if app can be installed, hasn't been dismissed, and is on mobile
    const checkVisibility = () => {
      const isMobile = window.innerWidth < 768;
      if (canInstall && !isInstalled && !isDismissed && isMobile) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkVisibility();

    // Listen for window resize
    window.addEventListener('resize', checkVisibility);
    return () => window.removeEventListener('resize', checkVisibility);
  }, [canInstall, isInstalled, isDismissed]);

  const handleInstall = async () => {
    try {
      await installApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    // Store dismissal in localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  useEffect(() => {
    // Check if user previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Card className="bg-card/95 backdrop-blur-sm border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Install Wedding App
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Add to your home screen for quick access to wedding details and
                RSVP.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  className="px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UpdateBanner() {
  const { updateAvailable, updateApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(updateAvailable);
  }, [updateAvailable]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:hidden">
      <Card className="bg-card/95 backdrop-blur-sm border shadow-lg border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Update Available
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                A new version of the wedding app is available with improvements.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={updateApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Update Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsVisible(false)}
                  className="px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
