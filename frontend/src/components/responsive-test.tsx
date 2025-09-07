import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResponsiveTestProps {
  className?: string;
}

export function ResponsiveTest({ className }: ResponsiveTestProps) {
  const [screenSize, setScreenSize] = useState<string>('');
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      if (width < 640) {
        setScreenSize('Mobile (sm)');
      } else if (width < 768) {
        setScreenSize('Mobile Large (md)');
      } else if (width < 1024) {
        setScreenSize('Tablet (lg)');
      } else if (width < 1280) {
        setScreenSize('Desktop (xl)');
      } else {
        setScreenSize('Large Desktop (2xl)');
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const breakpoints = [
    {
      name: 'Mobile',
      icon: Smartphone,
      range: '< 640px',
      class: 'sm',
      color: 'bg-red-100 text-red-800',
    },
    {
      name: 'Mobile Large',
      icon: Smartphone,
      range: '640px - 768px',
      class: 'md',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      name: 'Tablet',
      icon: Tablet,
      range: '768px - 1024px',
      class: 'lg',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      name: 'Desktop',
      icon: Monitor,
      range: '1024px - 1280px',
      class: 'xl',
      color: 'bg-green-100 text-green-800',
    },
    {
      name: 'Large Desktop',
      icon: Monitor,
      range: '> 1280px',
      class: '2xl',
      color: 'bg-blue-100 text-blue-800',
    },
  ];

  const components = [
    {
      name: 'Navigation',
      status: 'good',
      notes: 'Collapsible menu, touch-friendly',
    },
    {
      name: 'Hero Section',
      status: 'good',
      notes: 'Responsive text sizing, proper spacing',
    },
    {
      name: 'Wedding Cards',
      status: 'good',
      notes: 'Stacks on mobile, grid on desktop',
    },
    {
      name: 'Accommodations',
      status: 'good',
      notes: '1-3 columns based on screen size',
    },
    {
      name: 'Program Timeline',
      status: 'good',
      notes: 'Vertical layout, readable on all sizes',
    },
    {
      name: 'RSVP Form',
      status: 'good',
      notes: 'Full-width on mobile, centered on desktop',
    },
    {
      name: 'Admin Dashboard',
      status: 'warning',
      notes: 'May need horizontal scroll on small screens',
    },
    { name: 'Admin Forms', status: 'good', notes: 'Responsive grid layouts' },
  ];

  return (
    <div className={className}>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Responsive Design Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Current Screen</h3>
              <div className="space-y-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {screenSize}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {windowSize.width} × {windowSize.height}px
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Breakpoints</h3>
              <div className="space-y-2">
                {breakpoints.map((bp) => {
                  const Icon = bp.icon;
                  const isActive = screenSize.includes(bp.name);
                  return (
                    <div
                      key={bp.name}
                      className={`flex items-center gap-2 p-2 rounded ${isActive ? 'bg-muted' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{bp.name}</span>
                      <Badge className={`text-xs ${bp.color}`}>
                        {bp.range}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Responsive Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((component) => (
              <div key={component.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{component.name}</h4>
                  {component.status === 'good' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {component.notes}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Test component for different screen sizes
export function ResponsiveTestGrid() {
  return (
    <div className="space-y-8 p-4">
      <h2 className="text-2xl font-bold">Responsive Grid Test</h2>

      {/* Grid that changes columns based on screen size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Item {i + 1}</h3>
              <p className="text-sm text-muted-foreground">
                This card adapts to screen size
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Typography test */}
      <div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
          Responsive Typography
        </h2>
        <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
          This text scales with screen size for optimal readability.
        </p>
      </div>

      {/* Button test */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="w-full sm:w-auto">Full Width on Mobile</Button>
        <Button variant="outline" className="w-full sm:w-auto">
          Auto Width on Desktop
        </Button>
      </div>
    </div>
  );
}
