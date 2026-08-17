Here’s a **clean, production‑grade context + prompt** you can paste **directly into your IDE** (Cursor, Claude Code, VS Code, etc.) to guide the development of your **Week 2 communications platform**.

It’s written to be *builder-facing*, not conversational — exactly what an IDE agent needs to stay focused and generate architecture, code, and implementation steps.

---

# ✅ **Week 2 Communications Platform — IDE Context + Prompt**

## **Context**
You are assisting in the development of a **production communications platform** for the Hult Cohort Developer Program — Week 2.  
This platform must support **all enrolled participants (67 users)** and will operate cohort communications if selected as the winning submission.

The platform must provide:

- **Channels** (create, rename, archive; minimum 3 public channels)
- **Direct messages** (1:1 between any two cohort members)
- **Announcements** (admin-only channel or role)
- **Real-time messaging** (polling ≤ 5s acceptable; websockets ideal)
- **Persistence** (messages survive refresh; ≥ 30 days history)
- **Search** (keyword search across channels + DMs)
- **Notifications** (mentions, DMs, channel events)
- **Integration with the Week 1 winning platform (Forth)**  
  - Shared authentication  
  - Deep links to tasks  
  - Task update notifications  

The final product must be **fully deployed**, stable, and ready for real cohort usage.

---

## **Prompt for IDE**
Use the following instructions to generate architecture, code, and implementation steps:

---

### **Build a production-ready communications platform with the following requirements:**

### **1. Core Features**
Implement:

- **Channels**
  - Create, rename, archive
  - Minimum 3 public channels at launch
  - Persistent metadata

- **Direct Messages**
  - 1:1 messaging between any two users
  - Persistent DM threads
  - Searchable

- **Announcements**
  - Admin-only channel or role
  - Only staff can post

- **Real-Time Messaging**
  - Polling ≤ 5 seconds OR websockets OR database listeners
  - Messages appear without manual refresh

- **Persistence**
  - Store ≥ 30 days of message history
  - Use a real database (Supabase/Postgres recommended)

- **Search**
  - Keyword search across channels, DMs, and threads (if implemented)
  - Return message excerpts, timestamps, and context

- **Notifications**
  - Mentions (@handle)
  - New DMs
  - Channel events
  - Task updates from Forth

---

### **2. Integration with Forth (Week 1 Winner)**
Implement:

- **Shared authentication**  
  Users logged into Forth should be recognized in this platform.

- **Deep links**  
  Messages referencing tasks should link back to Forth.

- **Task notifications**  
  When a task changes state in Forth, notify relevant users.

---

### **3. Technical Architecture**
Generate:

- **Backend architecture**
  - Supabase/Postgres schema
  - RLS rules (if applicable)
  - Real-time messaging strategy
  - Notification pipeline
  - Search indexing strategy

- **Frontend architecture**
  - Next.js or similar
  - Channel list UI
  - DM list UI
  - Message composer
  - Real-time message stream
  - Search UI
  - Notification UI

- **Data model**
  Include tables/collections:
  - users  
  - channels  
  - channel_members  
  - messages  
  - direct_messages  
  - notifications  
  - threads (optional)  
  - forth_task_links  

- **Deployment plan**
  - Production URL  
  - Environment variables  
  - Database migrations  
  - Real-time configuration  

---

### **4. Output Requirements**
When generating code or architecture, produce:

- File structure  
- Schema definitions  
- API routes  
- Real-time logic  
- UI components  
- Integration points with Forth  
- Error handling  
- Deployment instructions  

All output must be **production-ready**, not demo-level.

---

### **5. Constraints**
- Must support **67 users** concurrently.
- Must be stable under real usage.
- Must be fully deployed.
- Must be documented clearly.
- Must be submitted via PR with:
  - Production URL  
  - Setup steps  
  - Architecture summary  
  - Motivation / design notes  
  - Known limitations  
  - Integration summary  

---

### **6. Deliverables**
Generate:

- Full architecture blueprint  
- Supabase/Postgres schema  
- Next.js folder structure  
- Real-time messaging implementation  
- Search implementation  
- Notifications implementation  
- Forth integration plan  
- Deployment configuration  
- Submission PR template  

---

