import Head from 'next/head';
import { useState } from 'react';
import { SidebarLayout } from '../components/sidebar-layout';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export default function SidebarDemo() {
  const [currentSection, setCurrentSection] = useState('home');
  const [layoutType, setLayoutType] = useState<'public' | 'admin'>('public');

  const demoContent = {
    home: {
      title: 'Home',
      content:
        'Welcome to our wedding website! This is the home section with beautiful content.',
    },
    'our-story': {
      title: 'Our Story',
      content:
        'This is where we share our beautiful love story and how we met.',
    },
    details: {
      title: 'Wedding Details',
      content:
        'All the important information about our special day, including date, time, and location.',
    },
    accommodations: {
      title: 'Accommodations',
      content:
        "We've selected some wonderful places for you to stay during our celebration.",
    },
    program: {
      title: 'Wedding Program',
      content:
        "Here's how our special day will unfold with all the events and timing.",
    },
    rsvp: {
      title: 'RSVP',
      content:
        "We can't wait to celebrate with you! Please confirm your attendance.",
    },
  };

  return (
    <>
      <Head>
        <title>Sidebar Demo - Wedding App</title>
        <meta
          name="description"
          content="Demonstration of the new sidebar navigation"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SidebarLayout
        type={layoutType}
        currentSection={currentSection}
        currentPath={layoutType === 'admin' ? '/admin/dashboard' : undefined}
        onSectionChange={setCurrentSection}
      >
        <div className="p-6 space-y-6">
          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Demo Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={layoutType === 'public' ? 'default' : 'outline'}
                  onClick={() => setLayoutType('public')}
                >
                  Public Sidebar
                </Button>
                <Button
                  variant={layoutType === 'admin' ? 'default' : 'outline'}
                  onClick={() => setLayoutType('admin')}
                >
                  Admin Sidebar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Switch between public and admin sidebar layouts to see the
                differences.
              </p>
            </CardContent>
          </Card>

          {/* Current Section Display */}
          <Card>
            <CardHeader>
              <CardTitle>
                Current Section:{' '}
                {demoContent[currentSection as keyof typeof demoContent]
                  ?.title || 'Unknown'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {demoContent[currentSection as keyof typeof demoContent]
                  ?.content || 'No content available for this section.'}
              </p>
            </CardContent>
          </Card>

          {/* Features List */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Desktop Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Hover to expand/collapse</li>
                    <li>• Smooth animations</li>
                    <li>• Icon + text navigation</li>
                    <li>• Active state indicators</li>
                    <li>• Dark mode support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Mobile Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full-screen overlay</li>
                    <li>• Slide-in animation</li>
                    <li>• Touch-friendly interface</li>
                    <li>• Easy close functionality</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Public Sidebar:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Navigation for wedding website sections</li>
                  <li>• Brand logo with couple names</li>
                  <li>• Links to Home, Our Story, Details, etc.</li>
                  <li>• "View Full Site" action</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Admin Sidebar:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Navigation for admin panel sections</li>
                  <li>• Admin branding with settings icon</li>
                  <li>• Links to Dashboard, Wedding Info, Guests, etc.</li>
                  <li>• "View Site" and "Logout" actions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    </>
  );
}
