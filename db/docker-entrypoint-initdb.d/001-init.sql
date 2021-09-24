--
-- PostgreSQL database dump
--

-- Dumped from database version 12.5
-- Dumped by pg_dump version 12.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE wai_ethiopia;
--
-- Name: wai_ethiopia; Type: DATABASE; Schema: -; Owner: wai
--

CREATE DATABASE wai_ethiopia WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


ALTER DATABASE wai_ethiopia OWNER TO wai;

\connect wai_ethiopia

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: questiontype; Type: TYPE; Schema: public; Owner: wai
--

CREATE TYPE public.questiontype AS ENUM (
    'text',
    'number',
    'option',
    'multiple_option',
    'photo',
    'date',
    'geo',
    'administration'
);


ALTER TYPE public.questiontype OWNER TO wai;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: wai
--

CREATE TYPE public.userrole AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.userrole OWNER TO wai;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.access (
    id integer NOT NULL,
    "user" integer,
    administration integer
);


ALTER TABLE public.access OWNER TO wai;

--
-- Name: access_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.access_id_seq OWNER TO wai;

--
-- Name: access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.access_id_seq OWNED BY public.access.id;


--
-- Name: administration; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.administration (
    id integer NOT NULL,
    parent integer,
    name character varying
);


ALTER TABLE public.administration OWNER TO wai;

--
-- Name: administration_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.administration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.administration_id_seq OWNER TO wai;

--
-- Name: administration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.administration_id_seq OWNED BY public.administration.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO wai;

--
-- Name: answer; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.answer (
    id integer NOT NULL,
    question integer,
    data integer,
    value double precision,
    text text,
    options character varying[],
    created_by integer,
    updated_by integer,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp without time zone
);


ALTER TABLE public.answer OWNER TO wai;

--
-- Name: answer_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.answer_id_seq OWNER TO wai;

--
-- Name: answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.answer_id_seq OWNED BY public.answer.id;


--
-- Name: data; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.data (
    id integer NOT NULL,
    name character varying,
    form integer,
    administration integer,
    created_by integer,
    updated_by integer,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp without time zone
);


ALTER TABLE public.data OWNER TO wai;

--
-- Name: data_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_id_seq OWNER TO wai;

--
-- Name: data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.data_id_seq OWNED BY public.data.id;


--
-- Name: form; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.form (
    id integer NOT NULL,
    name character varying
);


ALTER TABLE public.form OWNER TO wai;

--
-- Name: form_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.form_id_seq OWNER TO wai;

--
-- Name: form_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.form_id_seq OWNED BY public.form.id;


--
-- Name: option; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.option (
    id integer NOT NULL,
    name character varying,
    question integer,
    "order" integer
);


ALTER TABLE public.option OWNER TO wai;

--
-- Name: option_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.option_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.option_id_seq OWNER TO wai;

--
-- Name: option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.option_id_seq OWNED BY public.option.id;


--
-- Name: question; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.question (
    id integer NOT NULL,
    name character varying,
    form integer,
    meta boolean NOT NULL,
    type public.questiontype,
    question_group integer,
    "order" integer
);


ALTER TABLE public.question OWNER TO wai;

--
-- Name: question_group; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public.question_group (
    id integer NOT NULL,
    name character varying,
    form integer,
    "order" integer
);


ALTER TABLE public.question_group OWNER TO wai;

--
-- Name: question_group_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.question_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.question_group_id_seq OWNER TO wai;

--
-- Name: question_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.question_group_id_seq OWNED BY public.question_group.id;


--
-- Name: question_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.question_id_seq OWNER TO wai;

--
-- Name: question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.question_id_seq OWNED BY public.question.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: wai
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying(254),
    active boolean,
    role public.userrole,
    created timestamp without time zone
);


ALTER TABLE public."user" OWNER TO wai;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: wai
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO wai;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wai
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: access id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.access ALTER COLUMN id SET DEFAULT nextval('public.access_id_seq'::regclass);


--
-- Name: administration id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.administration ALTER COLUMN id SET DEFAULT nextval('public.administration_id_seq'::regclass);


--
-- Name: answer id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer ALTER COLUMN id SET DEFAULT nextval('public.answer_id_seq'::regclass);


--
-- Name: data id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data ALTER COLUMN id SET DEFAULT nextval('public.data_id_seq'::regclass);


--
-- Name: form id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.form ALTER COLUMN id SET DEFAULT nextval('public.form_id_seq'::regclass);


--
-- Name: option id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.option ALTER COLUMN id SET DEFAULT nextval('public.option_id_seq'::regclass);


--
-- Name: question id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);


--
-- Name: question_group id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question_group ALTER COLUMN id SET DEFAULT nextval('public.question_group_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: access; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.access (id, "user", administration) FROM stdin;
\.


--
-- Data for Name: administration; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.administration (id, parent, name) FROM stdin;
1	\N	Arsi Negele
2	\N	Shashemene Town
3	\N	Shashemene
4	1	Arsi Negele Town
5	1	Golije  Town
6	2	Shashemene Town
7	3	Kuyera Town
8	1	Muda Arja
9	1	Alge
10	1	Shala Bila
11	1	Balena Kilo
12	1	Dega Argemo
13	1	Dega Hora Kilo
14	1	Hadi Bossa
15	1	Kerero
16	1	Kelo Tulu
17	1	Sirba Lenda
18	1	Gerbi Arba
19	1	Gebta Arjo
20	1	Rafa Hrgesa
21	1	Ali Wayo
22	1	Edo Jagesa
23	1	Gerbo Derar
24	1	Meko Oda
25	1	Chri Elalu
26	1	Besko Elala
27	1	Lepeso
28	1	Gambelto
29	1	Sayo Menja
30	1	Kersa Meja
31	1	Kersa Gera
32	1	Kersa Elala
33	1	Terge Galo
34	1	Danshe
35	1	Adeba Tita
36	1	Bombaso Rja
37	1	Asheka
38	1	Aga
39	1	Gude Dura
40	1	Werro Awelo
41	1	Gunde Gurate
42	1	Wetera
43	1	Tufa
44	1	Amibagodasideni
45	1	Semiberorogicha
46	1	Dawe
47	1	Bukuwelida
48	1	Degaga
49	1	Arigedashalido
50	1	Shababulitumi
51	3	Chulule Habera
52	3	Kubi guta
53	3	Obenso Jilo
54	3	Jelo Dida
55	3	Faji Gole
56	3	Chefageta
57	3	Korerogicha
58	3	Fajigeba
59	3	Hagugeta Keni
60	3	Ilalal Korke
61	3	Wetera Shegule
62	3	Turre Wetera Elemo
63	3	kerara Felicha
64	3	Bute Felicha
65	3	Ale Luilu
66	3	Oine Chefo Unbule
67	3	Chebidi Dangata
68	3	Bura Borema
69	3	Tatesa Dedesa
70	3	Kori Borejeta
71	3	Daleti Guracha Bishen
72	3	Toga Weransa
73	3	Meja Dema
74	3	Bulchana Deneba
75	3	Sheleche Harlate
76	3	Shere Borara
77	3	Mudeta
78	3	Ido Laburka
79	3	Owa Shodongu
80	3	Jegesa Korke
81	3	Meraro
82	3	Faji Sole
83	3	Abaro
84	3	Jengele Wendere
85	3	Hursa Sinbo
86	3	Danisa
87	3	Gonde Kerso
88	3	Aredano Shifa
89	3	Ethiopia Adventist College
90	3	Toga Military Camp
91	3	Yeasa Den
92	3	Kure Beke Den
93	3	Hamele Den
94	3	Hansewe Den
95	3	Sole Den
96	3	Bejetu Den
97	3	Baro Den
98	3	Alamudin Gtosh Meret (Elfora)
99	3	Shalo Mrt Drjit
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.alembic_version (version_num) FROM stdin;
40799b50f65c
\.


--
-- Data for Name: answer; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.answer (id, question, data, value, text, options, created_by, updated_by, created, updated) FROM stdin;
\.


--
-- Data for Name: data; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.data (id, name, form, administration, created_by, updated_by, created, updated) FROM stdin;
\.


--
-- Data for Name: form; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.form (id, name) FROM stdin;
\.


--
-- Data for Name: option; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.option (id, name, question, "order") FROM stdin;
\.


--
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.question (id, name, form, meta, type, question_group, "order") FROM stdin;
\.


--
-- Data for Name: question_group; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public.question_group (id, name, form, "order") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: wai
--

COPY public."user" (id, email, active, role, created) FROM stdin;
\.


--
-- Name: access_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.access_id_seq', 1, false);


--
-- Name: administration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.administration_id_seq', 1, false);


--
-- Name: answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.answer_id_seq', 1, false);


--
-- Name: data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.data_id_seq', 1, false);


--
-- Name: form_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.form_id_seq', 1, false);


--
-- Name: option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.option_id_seq', 1, false);


--
-- Name: question_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.question_group_id_seq', 1, false);


--
-- Name: question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.question_id_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wai
--

SELECT pg_catalog.setval('public.user_id_seq', 1, false);


--
-- Name: access access_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT access_pkey PRIMARY KEY (id);


--
-- Name: access access_user_administration_key; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT access_user_administration_key UNIQUE ("user", administration);


--
-- Name: administration administration_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.administration
    ADD CONSTRAINT administration_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: answer answer_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (id);


--
-- Name: data data_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_pkey PRIMARY KEY (id);


--
-- Name: form form_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT form_pkey PRIMARY KEY (id);


--
-- Name: option option_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT option_pkey PRIMARY KEY (id);


--
-- Name: question_group question_group_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question_group
    ADD CONSTRAINT question_group_pkey PRIMARY KEY (id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: ix_access_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_access_id ON public.access USING btree (id);


--
-- Name: ix_administration_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_administration_id ON public.administration USING btree (id);


--
-- Name: ix_answer_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_answer_id ON public.answer USING btree (id);


--
-- Name: ix_data_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_data_id ON public.data USING btree (id);


--
-- Name: ix_form_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_form_id ON public.form USING btree (id);


--
-- Name: ix_option_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_option_id ON public.option USING btree (id);


--
-- Name: ix_question_group_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_question_group_id ON public.question_group USING btree (id);


--
-- Name: ix_question_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_question_id ON public.question USING btree (id);


--
-- Name: ix_user_email; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_user_email ON public."user" USING btree (email);


--
-- Name: ix_user_id; Type: INDEX; Schema: public; Owner: wai
--

CREATE UNIQUE INDEX ix_user_id ON public."user" USING btree (id);


--
-- Name: access access_administration_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT access_administration_fkey FOREIGN KEY (administration) REFERENCES public.administration(id);


--
-- Name: access access_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT access_user_fkey FOREIGN KEY ("user") REFERENCES public."user"(id);


--
-- Name: access administration_access_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT administration_access_constraint FOREIGN KEY (administration) REFERENCES public.administration(id) ON DELETE CASCADE;


--
-- Name: data administration_data_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT administration_data_constraint FOREIGN KEY (administration) REFERENCES public.administration(id) ON DELETE CASCADE;


--
-- Name: administration administration_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.administration
    ADD CONSTRAINT administration_parent_fkey FOREIGN KEY (parent) REFERENCES public.administration(id);


--
-- Name: answer answer_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id);


--
-- Name: answer answer_data_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_data_fkey FOREIGN KEY (data) REFERENCES public.data(id);


--
-- Name: answer answer_question_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_question_fkey FOREIGN KEY (question) REFERENCES public.question(id);


--
-- Name: answer answer_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public."user"(id);


--
-- Name: answer created_by_answer_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT created_by_answer_constraint FOREIGN KEY (created_by) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: data created_by_data_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT created_by_data_constraint FOREIGN KEY (created_by) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: data data_administration_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_administration_fkey FOREIGN KEY (administration) REFERENCES public.administration(id);


--
-- Name: answer data_answer_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT data_answer_constraint FOREIGN KEY (data) REFERENCES public.data(id) ON DELETE CASCADE;


--
-- Name: data data_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id);


--
-- Name: data data_form_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_form_fkey FOREIGN KEY (form) REFERENCES public.form(id);


--
-- Name: data data_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT data_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public."user"(id);


--
-- Name: data form_data_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT form_data_constraint FOREIGN KEY (form) REFERENCES public.form(id) ON DELETE CASCADE;


--
-- Name: question form_question_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT form_question_constraint FOREIGN KEY (form) REFERENCES public.form(id) ON DELETE CASCADE;


--
-- Name: question_group form_question_group_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question_group
    ADD CONSTRAINT form_question_group_constraint FOREIGN KEY (form) REFERENCES public.form(id) ON DELETE CASCADE;


--
-- Name: option option_question_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT option_question_fkey FOREIGN KEY (question) REFERENCES public.question(id);


--
-- Name: answer question_answer_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT question_answer_constraint FOREIGN KEY (question) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: question question_form_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_form_fkey FOREIGN KEY (form) REFERENCES public.form(id);


--
-- Name: question_group question_group_form_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question_group
    ADD CONSTRAINT question_group_form_fkey FOREIGN KEY (form) REFERENCES public.form(id);


--
-- Name: question question_group_question_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_group_question_constraint FOREIGN KEY (question_group) REFERENCES public.question_group(id) ON DELETE CASCADE;


--
-- Name: option question_option_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT question_option_constraint FOREIGN KEY (question) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: question question_question_group_fkey; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_question_group_fkey FOREIGN KEY (question_group) REFERENCES public.question_group(id);


--
-- Name: answer updated_by_answer_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT updated_by_answer_constraint FOREIGN KEY (updated_by) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: data updated_by_data_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.data
    ADD CONSTRAINT updated_by_data_constraint FOREIGN KEY (updated_by) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: access user_access_constraint; Type: FK CONSTRAINT; Schema: public; Owner: wai
--

ALTER TABLE ONLY public.access
    ADD CONSTRAINT user_access_constraint FOREIGN KEY ("user") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

