## Architecture Overview

At a high level, the **React + Vite frontend** talks to the **Express backend controllers** over REST and Socket.IO.  
The backend persists bills, users, sessions, and splits in **MongoDB**, connects to **payment gateways (eSewa / Khalti)** to verify payments and callbacks, and uses **Socket.IO** to push real-time updates (status changes, new participants, settlements) back to all connected group members.  
You can see this flow summarized in the `Architecture.md` diagram: Frontend → Backend Controllers → MongoDB / Payment Gateway / Socket.IO → back to members.

![BaadFaad System Architecture](../assets/BaadFaad%20System%20Architecture.drawio.png)



---