import { Guest } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withAuth } from '../../../../../lib/middleware';
import { prisma } from '../../../../../lib/prisma';

/**
 * Analyze guest demographics
 */
function analyzeDemographics(guests: Guest[]) {
  // Dietary restrictions analysis
  const dietaryMap: { [key: string]: number } = {};
  const specialRequestsList: string[] = [];
  let phoneCount = 0;
  let emailCount = 0;

  guests.forEach((guest) => {
    // Count dietary restrictions
    if (guest.dietaryRestrictions) {
      const restrictions = guest.dietaryRestrictions
        .split(',')
        .map((r) => r.trim().toLowerCase())
        .filter((r) => r.length > 0);

      restrictions.forEach((restriction) => {
        dietaryMap[restriction] = (dietaryMap[restriction] || 0) + 1;
      });
    }

    // Collect special requests
    if (guest.specialRequests) {
      specialRequestsList.push(guest.specialRequests);
    }

    // Count contact info
    if (guest.phoneNumber) phoneCount++;
    if (guest.email) emailCount++;
  });

  const totalGuests = guests.length;
  const dietaryRestrictions = Object.entries(dietaryMap)
    .map(([restriction, count]) => ({
      restriction,
      count,
      percentage: Math.round((count / totalGuests) * 10000) / 100,
    }))
    .sort((a, b) => b.count - a.count);

  // Analyze special requests (simple frequency count)
  const requestMap: { [key: string]: number } = {};
  specialRequestsList.forEach((request) => {
    const words = request.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      if (word.length > 3) {
        // Only count meaningful words
        requestMap[word] = (requestMap[word] || 0) + 1;
      }
    });
  });

  const specialRequests = Object.entries(requestMap)
    .map(([request, count]) => ({ request, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 most common words

  return {
    dietaryRestrictions,
    specialRequests,
    phoneNumberProvided: {
      count: phoneCount,
      percentage: Math.round((phoneCount / totalGuests) * 10000) / 100,
    },
    emailProvided: {
      count: emailCount,
      percentage: Math.round((emailCount / totalGuests) * 10000) / 100,
    },
  };
}

async function getRSVPStats(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        rsvpConfirmation: true,
      },
    });
    const confirmations = await prisma.rSVPConfirmation.findMany({
      include: { guest: true },
      orderBy: { confirmedAt: 'desc' },
    });

    // Overview statistics
    const totalGuests = guests.reduce(
      (sum, guest) => sum + (guest.partySize || 0),
      0,
    );
    const confirmedGuests = guests.filter(
      (g) => g.rsvpConfirmation?.isAttending === true,
    );
    const declinedGuests = guests.filter(
      (g) => g.rsvpConfirmation?.isAttending === false,
    );

    const pendingGuests = guests.filter((g) => !g.rsvpConfirmation);

    const totalConfirmed = confirmedGuests.reduce(
      (sum, guest) => sum + (guest.rsvpConfirmation?.confirmedPartySize || 0),
      0,
    );
    const totalDeclined = declinedGuests.reduce(
      (sum, guest) => sum + (guest.partySize || 0),
      0,
    );
    const totalPending = pendingGuests.reduce(
      (sum, guest) => sum + (guest.partySize || 0),
      0,
    );
    const totalResponded = totalConfirmed + totalDeclined;

    const responseRate = Math.round((totalResponded / totalGuests) * 1000) / 10;
    const attendanceRate =
      totalGuests > 0
        ? Math.round((totalConfirmed / totalGuests) * 1000) / 10
        : 0;

    // Attendance statistics
    const confirmedAttendees = confirmedGuests.reduce(
      (sum, guest) => sum + (guest.rsvpConfirmation?.confirmedPartySize || 0),
      0,
    );
    const totalExpectedAttendees = guests.reduce(
      (sum, guest) => sum + guest.partySize,
      0,
    );
    const averagePartySize =
      confirmedGuests.length > 0
        ? confirmedAttendees / confirmedGuests.length
        : 0;

    // Party size distribution
    const partySizeDistribution: { [size: number]: number } = {};
    confirmedGuests.forEach((guest) => {
      const size = guest.rsvpConfirmation?.confirmedPartySize || 0;
      partySizeDistribution[size] = (partySizeDistribution[size] || 0) + 1;
    });

    // Demographics analysis
    const demographics = analyzeDemographics(guests);

    // Recent activity
    const recentActivity = confirmations.map((confirmation) => ({
      guestName: `${confirmation.guest.firstName} ${confirmation.guest.lastName}`,
      action: confirmation.isAttending
        ? ('confirmed' as const)
        : ('declined' as const),
      confirmedPartySize: confirmation.confirmedPartySize,
      message: confirmation.message,
      timestamp: confirmation.confirmedAt,
    }));

    // Count recent responses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentResponses = recentActivity.filter(
      (activity) => activity.timestamp > sevenDaysAgo,
    );

    const stats = {
      overview: {
        totalGuests,
        totalInvited: totalGuests,
        totalConfirmed,
        totalDeclined,
        totalPending,
        responseRate: Math.round(responseRate * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      attendance: {
        totalExpectedAttendees,
        confirmedAttendees,
        averagePartySize: Math.round(averagePartySize * 100) / 100,
        partySizeDistribution,
      },
      demographics,
      recentActivity: recentResponses,
    };

    res.json(stats);
  } catch (error) {
    console.error('Get RSVP stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return withAuth(getRSVPStats)(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
