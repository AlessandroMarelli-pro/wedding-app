import { LoginForm, schema } from '@/components/login-form';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import z from 'zod';

export default function AdminLogin() {
  const router = useRouter();
  // If already connected, redirect to dashboard

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        router.replace('/admin/dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        },
      );

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        // Store the token
        localStorage.setItem('adminToken', data.accessToken);

        // Redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        toast.error('La connexion a échoué', {
          description: data.message,
        });
      }
    } catch (error: any) {
      console.log('Error logging in:', error?.data?.message);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login - Wedding Management</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <LoginForm handleSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
}
