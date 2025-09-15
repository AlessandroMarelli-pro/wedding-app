import Head from 'next/head';
import { AdminStats } from '../../../components/admin/admin-stats';

interface RSVPStats {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  confirmationRate: number;
}

interface RecentConfirmation {
  id: string;
  guestName: string;
  confirmedAt: string;
}

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>Admin - Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="">
        {/* Advanced Analytics */}
        <div className="">
          <AdminStats />
        </div>
      </div>
    </>
  );
}
