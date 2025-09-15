# 🎭 Demo Data for Wedding Website

This directory contains sample data for demonstrating the wedding website functionality.

## 📋 Sample Guest List

The `demo_guest_list.csv` file contains 16 sample guests with various scenarios:

### 🎯 **Test RSVP Codes**

Use these hash codes to test the RSVP functionality:

| Hash Code  | Guest Name    | Party Size | Status       | Notes                      |
| ---------- | ------------- | ---------- | ------------ | -------------------------- |
| `DEMO2024` | Emma Johnson  | 2          | ✅ Confirmed | Basic confirmation         |
| `FAMILY01` | Michael Smith | 4          | ✅ Confirmed | Family with dietary needs  |
| `COUPLE99` | Sarah Davis   | 2          | ❌ Declined  | Polite decline message     |
| `FRIEND42` | James Wilson  | 1          | ⏳ Pending   | Accessibility needs        |
| `COLLEGE8` | Lisa Brown    | 3          | ✅ Confirmed | Enthusiastic response      |
| `WORK2023` | David Miller  | 2          | ⏳ Pending   | Vegan dietary restriction  |
| `BESTMAN1` | Alex Thompson | 1          | ✅ Confirmed | Best man with special role |
| `COUSIN77` | Marie Dubois  | 3          | ⏳ Pending   | International guest        |

### 🔄 **RSVP Response Statistics**

- **Total Guests**: 8 primary invitees
- **Confirmed Attending**: 5 guests (12 total attendees)
- **Declined**: 1 guest
- **Pending Response**: 2 guests
- **Response Rate**: 75%

## 📊 **Demo Dashboard Data**

The seeded data provides realistic admin dashboard statistics:

- **Guest Management**: Complete guest list with hash codes
- **RSVP Tracking**: Mix of confirmed, declined, and pending responses
- **Dietary Restrictions**: Various dietary needs represented
- **Special Requests**: Accessibility and logistical requirements
- **CSV Import History**: Sample upload record

## 🏨 **Accommodation Data**

Enhanced accommodation listings include:

1. **Hotel Renaissance Paris La Defense** (Recommended)
   - 4-star luxury hotel
   - €180-250/night
   - 15 minutes from venue

2. **Novotel Suites Paris Rueil Malmaison** (Recommended)
   - Family-friendly suites
   - €120-180/night
   - Kitchenette facilities

3. **Best Western Villa Henri IV**
   - Boutique hotel
   - €90-140/night
   - Classic French décor

4. **Airbnb Options**
   - Various apartments
   - €80-120/night
   - Local neighborhood experience

## 📅 **Wedding Program Events**

Sample timeline includes:

- **3:00 PM - 4:00 PM**: Wedding Ceremony
- **4:00 PM - 5:30 PM**: Cocktail Hour
- **5:30 PM - 11:00 PM**: Reception & Dinner
- **11:00 PM - 11:30 PM**: Late Night Snacks

## 🔐 **Admin Access**

- **Email**: `admin@wedding.com`
- **Password**: `admin123`

## 🚀 **Using the Demo Data**

### Method 1: Automatic (with migrations)

The demo data is automatically seeded when you start the backend for the first time.

### Method 2: Manual Seeding Script

```bash
cd backend
npm run build
npx ts-node src/scripts/seed-demo-data.ts
```

### Method 3: CSV Upload Test

1. Login to admin dashboard
2. Go to "Manage Guests"
3. Upload the `demo_guest_list.csv` file
4. Hash codes will be auto-generated

## 🎨 **Customization**

To create your own demo data:

1. Modify the guest list in `demo_guest_list.csv`
2. Update the seeding script in `src/scripts/seed-demo-data.ts`
3. Adjust wedding info and accommodations as needed
4. Re-run the seeding script

## 📝 **CSV Format**

Required columns for guest import:

- `firstName` (required)
- `lastName` (required)
- `email` (required)
- `phoneNumber` (optional)
- `partySize` (required, number)
- `dietaryRestrictions` (optional)
- `specialRequests` (optional)

Hash codes are automatically generated during import.

---

**Happy Testing!** 🎉

Use this demo data to explore all features of the wedding website before adding your real guest information.
