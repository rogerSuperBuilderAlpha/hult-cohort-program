# Week 2 Submission: 3-Minute Pitch Script

### **0:00 - 0:30 | The Hook & The Problem**
"Hey everyone! For Week 2, our challenge was to build a communications platform that could handle all 67 enrolled participants without breaking a sweat, while seamlessly integrating with Forth. The biggest issue with most hackathon chat apps? They rely on messy intervals to fetch messages, creating lag and killing the flow of conversation. I knew we needed something better. Something real-time, production-ready, and scalable from day one."

### **0:30 - 1:30 | The Solution & Demo**
"Enter **HultChat**. Instead of relying on a clunky WebSocket server or polling, I built the entire architecture on **Supabase Realtime subscriptions** with a **Next.js App Router** frontend. 

*(Show the live demo on screen)*

As you can see, the moment I send a message in a channel or direct message, it broadcasts instantly to all connected clients. We’ve got dedicated channels for Announcements and General banter, all secured with strict Row Level Security (RLS) directly at the database level. It’s blazingly fast because there is almost zero middleware overhead."

### **1:30 - 2:30 | The Forth Integration & Architecture**
"But a chat app is useless if it's siloed. The spec required integration with Forth, our Week 1 winner. 

I designed the data model to include a `forth_user_id` mapping. This allows shared authentication so users migrating from Forth don’t feel friction. Furthermore, any message containing a Forth link automatically unfurls into a deep-linked Task Card, and a backend Webhook receiver route is ready to capture task state changes from Forth and broadcast them as real-time notifications right into your chat feed."

### **2:30 - 3:00 | The Close**
"HultChat isn't just a prototype; it's a fully deployed, edge-rendered application hosted on Vercel, utilizing an enterprise-grade Postgres backend. It's built to securely support our entire cohort for the remainder of the pilot with zero downtime.

Thank you, and I’m looking forward to your feedback!"
