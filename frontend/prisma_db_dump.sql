--
-- PostgreSQL database dump
--

\restrict YqfsEDoZZA3Hv9SqZO2hb9gFA4L4brz9ddeEBHR3Skk0MgwfqJNrChf4gPBvqCt

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: UploadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UploadStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: accommodations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accommodations (
    id text NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    address character varying(300) NOT NULL,
    contact_info character varying(200),
    latitude numeric(10,8),
    longitude numeric(11,8),
    price_range character varying(50),
    is_recommended boolean DEFAULT false NOT NULL,
    display_order integer NOT NULL,
    source_url text,
    images_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id text NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: csv_uploads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.csv_uploads (
    id text NOT NULL,
    filename character varying(200) NOT NULL,
    total_rows integer DEFAULT 0 NOT NULL,
    processed_rows integer DEFAULT 0 NOT NULL,
    error_rows integer DEFAULT 0 NOT NULL,
    status public."UploadStatus" DEFAULT 'PENDING'::public."UploadStatus" NOT NULL,
    error_log text,
    uploaded_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    id text NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(255),
    hash_code character varying(8) NOT NULL,
    phone_number character varying(20),
    party_size integer DEFAULT 1 NOT NULL,
    dietary_restrictions text,
    special_requests text,
    csv_upload_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: program_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.program_events (
    id text NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    start_time timestamp(3) without time zone NOT NULL,
    end_time timestamp(3) without time zone NOT NULL,
    location character varying(200) NOT NULL,
    display_order integer NOT NULL,
    include_in_calendar boolean DEFAULT true NOT NULL,
    icon character varying(50),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: rsvp_confirmations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rsvp_confirmations (
    id text NOT NULL,
    guest_id text NOT NULL,
    confirmed_at timestamp(3) without time zone NOT NULL,
    ip_address character varying(45) NOT NULL,
    user_agent text,
    is_attending boolean NOT NULL,
    confirmed_party_size integer NOT NULL,
    message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: uploaded_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uploaded_images (
    id text NOT NULL,
    original_name character varying(200) NOT NULL,
    filename character varying(200) NOT NULL,
    mime_type character varying(50) NOT NULL,
    size integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    alt_text character varying(200),
    usage_location character varying(100) NOT NULL,
    uploaded_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    cloudflare_key character varying(500),
    cloudflare_url character varying(500)
);


--
-- Name: wedding_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wedding_info (
    id text NOT NULL,
    "coupleNames" character varying(100) NOT NULL,
    "presentationMessage" text,
    "weddingAddress" character varying(300),
    "weddingDate" date NOT NULL,
    "locationDirections" jsonb,
    "heroImageId" character varying(255),
    "heroMessage" text,
    "heroAddress" character varying(200),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b55301a4-ca1c-4010-9fa7-2c14f3f96cd8	5e2ef7de8f11c37ccad47e5084c8ea07ea143276f21ec02271b90aa35d8fe40a	2025-09-15 21:20:32.910522+00	20250915211652_init	\N	\N	2025-09-15 21:20:32.782093+00	1
c1b11829-64c3-46a0-abaa-81d2d0fa1893	31ed158198bd6dd8857b496d173bec6ace151efe1d0f48e9747a54a058e47149	2025-09-16 09:45:07.768266+00	20250916080903_date_with_time	\N	\N	2025-09-16 09:45:07.61028+00	1
b99e4755-ddb3-404d-af12-0d91ddc12311	c26b5ed84f294d8e7788e67de5946f1f1eb1915a528d99ab474d4fbd3ed9514c	2025-09-16 09:45:08.049227+00	20250916084036_add_cloudflare_fields	\N	\N	2025-09-16 09:45:07.908975+00	1
\.


--
-- Data for Name: accommodations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accommodations (id, name, description, address, contact_info, latitude, longitude, price_range, is_recommended, display_order, source_url, images_url, created_at, updated_at) FROM stdin;
f85836c0-a277-49e0-9093-5860a31d597b	Le studio du Marquis	L’hébergement Le studio du Marquis se trouve à Marsanne, à respectivement 47 km, 14 km et 15 km de ces lieux d’intérêt : Parc des expositions de Valence, International Sweets Museum et Golf de la Valdaine. Il possède une connexion Wi-Fi gratuite. Cet appartement est à respectivement 35 km et 36 km de : Golf de la Drôme Provençale et Golf du Domaine de Sagnol.\n\nCet appartement compte 1 chambre, une cuisine avec un réfrigérateur et un four, une télévision à écran plat, un coin salon, ainsi que 1 salle de bains possédant une douche. Des serviettes et du linge de lit sont à disposition.\n\nVous séjournerez à respectivement 47 km et 47 km de ces lieux d’intérêt : IUT Valence et Joseph Fourier University.	6 Rue de la Marquise, 26740 Marsanne, France	\N	\N	\N	420	t	2	https://www.booking.com/hotel/fr/le-studio-du-marquis.fr.html?aid=318615&label=New_French_FR_FR_21427174585-hEaWFCx7dV%2AscGEcNhg_zgS217274308715%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=d70ad7f3b658e2006fadc323b5bb282d&all_sr_blocks=1171531901_389695441_1_0_0&checkin=2026-07-10&checkout=2026-07-15&dest_id=-1421402&dest_type=city&dist=0&group_adults=1&group_children=0&hapos=2&highlighted_blocks=1171531901_389695441_1_0_0&hpos=2&matching_block_id=1171531901_389695441_1_0_0&no_rooms=1&req_adults=1&req_children=0&room1=A&sb_price_type=total&sr_order=popularity&sr_pri_blocks=1171531901_389695441_1_0_0__40006&srepoch=1758005483&srpvid=67973032c966055e&type=total&ucfs=1&	https://cf.bstatic.com/xdata/images/hotel/max1024x768/536438301.jpg?k=99e1bcdf045cdeeedd8f3f687cda91fe0900b94631b09a99eac1de006c83af14&o=,https://cf.bstatic.com/xdata/images/hotel/max500/536438359.jpg?k=b80fd4b5d13ef78992b0440a0de5b6cfe832b889340cce72c548638d9a330db0&o=,https://cf.bstatic.com/xdata/images/hotel/max500/536438366.jpg?k=d44e2be67b2af95ec0ac36677f42b3b2e226fc332e5d194eed5e4fdf85e84ffd&o=,https://cf.bstatic.com/xdata/images/hotel/max300/536438375.jpg?k=104101e05f7ef3dadc7df5c28b8148324334d79347584be1f4e391588f51fcd3&o=,https://cf.bstatic.com/xdata/images/hotel/max300/536438345.jpg?k=38ec4bd6ae0c8dfe967c5ad65705c82214236abbbbde5f48311add0349c6f16e&o=	2025-09-16 06:52:07.519	2025-09-16 06:53:30.038
40f37764-b0b2-4c58-8404-ebcfaf34c5aa	La vigne	L’hébergement La vigne propose une piscine extérieure ouverte en saison et une terrasse. Il se situe à Sauzet, à respectivement 44 km, 7,8 km et 8,9 km de ces lieux d’intérêt : Parc des expositions de Valence, International Sweets Museum et Golf de la Valdaine. Cette maison de vacances possède une piscine privée, un jardin et un parking privé gratuit.\n\nCette maison de vacances avec climatisation se compose de 1 chambre séparée, d'une cuisine entièrement équipée et de 1 salle de bains. Une télévision à écran plat est à disposition.\n\nVous séjournerez à respectivement 31 km et 37 km de ces lieux d’intérêt : Golf de la Drôme Provençale et Crocodile Farm. L'aéroport le plus proche (Aéroport de Grenoble-Alpes-Isère) est à 125 km.	25 Allée des Chênes, 26740 Sauzet, France	\N	\N	\N	449	f	3	https://www.booking.com/hotel/fr/la-vigne-sauzet.fr.html?aid=318615&label=New_French_FR_FR_21427174585-hEaWFCx7dV%2AscGEcNhg_zgS217274308715%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=d70ad7f3b658e2006fadc323b5bb282d&all_sr_blocks=1390440501_411019375_1_0_0&checkin=2026-07-10&checkout=2026-07-15&dest_id=-1421402&dest_type=city&dist=0&group_adults=1&group_children=0&hapos=4&highlighted_blocks=1390440501_411019375_1_0_0&hpos=4&matching_block_id=1390440501_411019375_1_0_0&no_rooms=1&req_adults=1&req_children=0&room1=A&sb_price_type=total&sr_order=popularity&sr_pri_blocks=1390440501_411019375_1_0_0__44100&srepoch=1758005545&srpvid=041930502cdb041c&type=total&ucfs=1&	https://cf.bstatic.com/xdata/images/hotel/max1024x768/668600855.jpg?k=226877033d0541d4043861af5b3b9e8e5c8f1a68362dd65815da4b1132148c9e&o=,https://cf.bstatic.com/xdata/images/hotel/max500/668600907.jpg?k=435a08ca19f9edd33635c0659761777d061639ad7b100d994c53753410cec894&o=,https://cf.bstatic.com/xdata/images/hotel/max500/668600915.jpg?k=2c98467cc0d944db4c390fa022e36847c3a6b47ddc66c31c3e798972802c4cc4&o=,https://cf.bstatic.com/xdata/images/hotel/max300/668600918.jpg?k=2e5486b4e14b34208252e5ae372ca90b885f8fe325a8388dd623ece619ca6998&o=,https://cf.bstatic.com/xdata/images/hotel/max300/668600926.jpg?k=e2cfffbabe7dfbc2979fe15fcd606df37956fd3e195a59e0c6e3bdcba85e91e7&o=	2025-09-16 06:53:22.98	2025-09-16 06:53:22.98
105ee76a-74a3-4885-88db-2167992ff51e	Mirmande : les Micocouliers	Ce logement paisible offre un séjour détente pour toute la famille.	Mirmande, Auvergne-Rhône-Alpes, France	\N	\N	\N	474	f	4	https://www.airbnb.fr/rooms/664950015101707776?adults=4&check_in=2026-07-10&check_out=2026-07-14&search_mode=regular_search&source_impression_id=p3_1758005583_P3D_RClQ2aa2xEZH&previous_page_section_name=1000&federated_search_id=fc3e80e2-c13e-4f00-9f5f-7eaefa0f8642	https://a0.muscache.com/im/pictures/miso/Hosting-664950015101707776/original/91aec781-1b88-48f1-b949-d4abd16d278b.jpeg?im_w=720,https://a0.muscache.com/im/pictures/miso/Hosting-664950015101707776/original/f8df31a4-dedd-4f33-8aad-5d1f94f71197.jpeg?im_w=720,https://a0.muscache.com/im/pictures/miso/Hosting-664950015101707776/original/9eadd793-bdb8-4212-8101-48a2c2b4e84b.jpeg?im_w=720,https://a0.muscache.com/im/pictures/miso/Hosting-664950015101707776/original/3e932b54-828c-42de-974a-aa2293b1983a.jpeg?im_w=720,https://a0.muscache.com/im/pictures/miso/Hosting-664950015101707776/original/f9a6308c-c6e2-4d7d-b63f-693ca567a9e2.jpeg?im_w=720	2025-09-16 06:54:34.495	2025-09-16 06:54:34.495
cf223b72-0432-4bfe-bb78-03744d2d8a85	Charme et Confort - Maison Rénovée avec Piscine	Situé à Condillac, l’hébergement Charme et Confort - Maison Rénovée avec Piscine - offre une vue sur le jardin. Il possède une piscine extérieure ouverte en saison, une terrasse et une connexion Wi-Fi gratuite. Cette villa comprend une piscine privée, un jardin et un parking privé gratuit.\n\nCette villa comporte 1 chambre, une télévision à écran plat, ainsi qu’une cuisine entièrement équipée avec un réfrigérateur, un lave-vaisselle, un lave-linge, un four et un micro-ondes. Cet hébergement met à votre disposition des serviettes et du linge de lit.\n\nVous séjournerez à respectivement 42 km et 12 km de ces lieux d’intérêt : Parc des expositions de Valence et International Sweets Museum. L'aéroport le plus proche (Aéroport de Grenoble-Alpes-Isère) est à 123 km.	180 La Grand Grange, 26740 Condillac, France	\N	\N	\N	2 452	f	1	https://www.booking.com/hotel/fr/charme-et-confort-maison-renovee-avec-piscine.fr.html?aid=318615&label=New_French_FR_FR_21427174585-hEaWFCx7dV%2AscGEcNhg_zgS217274308715%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg&sid=d70ad7f3b658e2006fadc323b5bb282d&all_sr_blocks=1376369301_409770310_10_0_0&checkin=2026-07-10&checkout=2026-07-15&dest_id=-1421402&dest_type=city&dist=0&group_adults=1&group_children=0&hapos=1&highlighted_blocks=1376369301_409770310_10_0_0&hpos=1&matching_block_id=1376369301_409770310_10_0_0&no_rooms=1&req_adults=1&req_children=0&room1=A&sb_price_type=total&sr_order=popularity&sr_pri_blocks=1376369301_409770310_10_0_0__228820&srepoch=1757972512&srpvid=44c2988ed3a30205&type=total&ucfs=1&	https://cf.bstatic.com/xdata/images/hotel/max1024x768/657741531.jpg?k=56009a7c4f5ada52feccd20f1e091cdda62049dabc9c5fc994262bd0c2ffc973&o=,https://cf.bstatic.com/xdata/images/hotel/max500/657741578.jpg?k=f92658c0411e1c3dfc9426689c5bcbf1255a49fb7ceefa0a2cb1e4407ca79626&o=,https://cf.bstatic.com/xdata/images/hotel/max500/657741588.jpg?k=f362c1a1205beeb89ca06837d9af6261542675ca8d43376f6d1abeefd3bfd780&o=,https://cf.bstatic.com/xdata/images/hotel/max300/657741371.jpg?k=7ac8b68db05808b440e9a7d8c023084c9b437a9ca6248c082b4a95996399a3e2&o=,https://cf.bstatic.com/xdata/images/hotel/max300/657741600.jpg?k=de87f56cb4d38a7deffcd83ea3cf3dc8271413741a483bc70eef52cef9660d3f&o=	2025-09-15 21:57:24.503	2025-09-17 09:32:27.591
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, email, password_hash, created_at, updated_at) FROM stdin;
247f83e5-4e40-44af-8966-51984519dadf	ariane@email.com	$2b$10$7rZoyq/itTxnr1M8HQe8D.6.ckeLZzfRl/zFeO0vJUbyxk/wIhwGC	2025-09-15 21:37:27.169	2025-09-15 21:37:27.169
aaaf3a1d-1f9c-4daf-a49e-5a062ebe688c	timothe@email.com	$2b$10$O1kEPWYQEJc0PyHqSEOeb.KyiBSSpy96AhaeHu9L4qzSzzEQDstny	2025-09-15 21:37:27.285	2025-09-15 21:37:27.285
6905a83b-88fc-49be-b74f-c80c8e452122	chicco@email.com	$2b$10$1RKNEOaaP0WMiscpqYPYwe84mtLujj3/Os8DUEnMNvZpKr5UtPbZS	2025-09-15 21:37:27.38	2025-09-15 21:37:27.38
\.


--
-- Data for Name: csv_uploads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.csv_uploads (id, filename, total_rows, processed_rows, error_rows, status, error_log, uploaded_by, created_at, updated_at) FROM stdin;
5ace14fd-a709-42c0-913a-1054177cde5a	demo_guest_list.csv	17	17	0	COMPLETED	{"simpleErrors":[],"detailedErrors":[],"warnings":[],"summary":{"totalGuests":17,"totalPartySize":35,"emailsProvided":17,"phoneNumbersProvided":17,"dietaryRestrictionsProvided":10,"specialRequestsProvided":6}}	6905a83b-88fc-49be-b74f-c80c8e452122	2025-09-15 22:01:25.75	2025-09-15 22:01:29.914
9a278f85-75d2-4c08-820a-ab1f01b9281d	demo_guest_list_short.csv	1	1	0	COMPLETED	{"simpleErrors":[],"detailedErrors":[],"warnings":[],"summary":{"totalGuests":1,"totalPartySize":2,"emailsProvided":1,"phoneNumbersProvided":1,"dietaryRestrictionsProvided":0,"specialRequestsProvided":0}}	6905a83b-88fc-49be-b74f-c80c8e452122	2025-09-16 10:25:49.335	2025-09-16 10:25:50.243
2fbead87-ff61-41d3-aca2-85544c0ca128	demo_guest_list_short.csv	2	2	0	COMPLETED	{"simpleErrors":[],"detailedErrors":[],"warnings":[],"summary":{"totalGuests":2,"totalPartySize":6,"emailsProvided":2,"phoneNumbersProvided":2,"dietaryRestrictionsProvided":1,"specialRequestsProvided":1}}	6905a83b-88fc-49be-b74f-c80c8e452122	2025-09-16 18:49:37.305	2025-09-16 18:49:38.71
\.


--
-- Data for Name: guests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guests (id, first_name, last_name, email, hash_code, phone_number, party_size, dietary_restrictions, special_requests, csv_upload_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: program_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.program_events (id, title, description, start_time, end_time, location, display_order, include_in_calendar, icon, created_at, updated_at) FROM stdin;
ece289d3-3824-4de2-bb85-05a4165dbaab	Soirée		2026-07-13 22:30:00	2026-07-13 22:30:00	Lauziers, Condillac	5	t		2025-09-16 07:10:36.161	2025-09-16 16:15:44.178
a98affda-a7bb-40a6-ad75-f2e499387b64	Cérémonie Religieuse		2026-07-13 15:00:00	2026-07-13 15:00:00	Église, Saint-Marcel les Sauzet	2	t		2025-09-16 07:08:18.882	2025-10-08 14:18:36.455
2cb327d5-e054-4890-945a-fdec6e427641	Cérémonie Civile		2026-07-11 16:00:00	2026-07-11 16:00:00	Mairie, Condillac	1	t		2025-09-16 07:07:46.732	2025-10-08 14:18:54.497
772c82e0-1f9f-4c41-96d8-b6348ff906f2	Vin d'honneur		2026-07-13 17:30:00	2026-07-13 17:30:00	Chez les Holroyd aux Lauziers, Condillac	3	t		2025-09-16 07:09:32.606	2025-10-08 14:19:23.684
44240ac6-c20b-42c7-9e4c-2b07cb54a7ca	Diner		2026-07-13 20:30:00	2026-07-13 20:30:00	Lauziers, Condillac	4	t		2025-09-16 07:10:11.749	2025-10-08 14:19:33.287
\.


--
-- Data for Name: rsvp_confirmations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rsvp_confirmations (id, guest_id, confirmed_at, ip_address, user_agent, is_attending, confirmed_party_size, message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: uploaded_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.uploaded_images (id, original_name, filename, mime_type, size, width, height, alt_text, usage_location, uploaded_by, created_at, updated_at, cloudflare_key, cloudflare_url) FROM stdin;
5354afbf-533b-42fd-8d89-1d3842056c3c	spot-lavande-chateau-grignan.jpg	1758101575652_megq8vdglha_spot-lavande-chateau-grignan.jpg	image/webp	174412	1200	900	logements	accommodation	6905a83b-88fc-49be-b74f-c80c8e452122	2025-09-17 09:32:56.889	2025-09-17 09:32:56.889	\N	https://pub-391d3ec6f199406cab58155c9db19a30.r2.dev/production/images/1758101575895_xsjnwn_1758101575652_megq8vdglha_spot_lavande_chateau_grignan.jpg
\.


--
-- Data for Name: wedding_info; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wedding_info (id, "coupleNames", "presentationMessage", "weddingAddress", "weddingDate", "locationDirections", "heroImageId", "heroMessage", "heroAddress", created_at, updated_at) FROM stdin;
default-wedding-info	Ariane & Timothé	Chère famille, \nCher.es ami.es, \nCher.es toutes et tous, \n\nQuelle joie nous aurions de vous avoir à nos côtés pour célébrer cet évènement qui est si important pour nous et qui arrive à grands pas : celui de notre engagement l'un envers l'autre. \nC'est aux Lauziers, au pays des lavandes et du nougat, que nous aurons le plaisir de vous réunir lundi 13 juillet 2026. \nAdresse, déroulé, possibilités de logement : vous trouverez toutes les informations importantes sur ce site. \nDans la hâte de vous retrouver, \n\n	625B chemin des Lauziers, 26740, Condillac	2026-07-13	[{"type": "car", "location": {"link": "https://maps.app.goo.gl/a8et7BmYQCfyKEDXA", "address": "Condillac, France"}, "information": "Condillac est situé à quelques kilomètres de Montélimar sur l'A7 (sortie Montélimar-Nord)"}, {"type": "train", "location": {"link": "https://maps.app.goo.gl/BAx9n6craGs91Xum7", "address": "Gare de Montélimar"}, "information": "Depuis Paris : TGV direct depuis la Gare de Lyon (3h)\\nDepuis Lyon : TER (1h40)"}]	\N	13 juillet 2026	Lauziers, Condillac	2025-09-15 21:37:27.425	2025-10-10 13:39:49.577
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accommodations accommodations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accommodations
    ADD CONSTRAINT accommodations_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: csv_uploads csv_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.csv_uploads
    ADD CONSTRAINT csv_uploads_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: program_events program_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_events
    ADD CONSTRAINT program_events_pkey PRIMARY KEY (id);


--
-- Name: rsvp_confirmations rsvp_confirmations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvp_confirmations
    ADD CONSTRAINT rsvp_confirmations_pkey PRIMARY KEY (id);


--
-- Name: uploaded_images uploaded_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_pkey PRIMARY KEY (id);


--
-- Name: wedding_info wedding_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wedding_info
    ADD CONSTRAINT wedding_info_pkey PRIMARY KEY (id);


--
-- Name: accommodations_display_order_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX accommodations_display_order_key ON public.accommodations USING btree (display_order);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: guests_hash_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX guests_hash_code_key ON public.guests USING btree (hash_code);


--
-- Name: program_events_display_order_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX program_events_display_order_key ON public.program_events USING btree (display_order);


--
-- Name: rsvp_confirmations_guest_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX rsvp_confirmations_guest_id_key ON public.rsvp_confirmations USING btree (guest_id);


--
-- Name: uploaded_images_filename_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uploaded_images_filename_key ON public.uploaded_images USING btree (filename);


--
-- Name: csv_uploads csv_uploads_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.csv_uploads
    ADD CONSTRAINT csv_uploads_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: guests guests_csv_upload_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_csv_upload_id_fkey FOREIGN KEY (csv_upload_id) REFERENCES public.csv_uploads(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rsvp_confirmations rsvp_confirmations_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvp_confirmations
    ADD CONSTRAINT rsvp_confirmations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: uploaded_images uploaded_images_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict YqfsEDoZZA3Hv9SqZO2hb9gFA4L4brz9ddeEBHR3Skk0MgwfqJNrChf4gPBvqCt

