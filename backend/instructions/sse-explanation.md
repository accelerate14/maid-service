# Understanding Server-Sent Events (SSE) & Database Connections

You brought up an excellent and very common concern regarding real-time connections! Let's break down exactly what is happening under the hood and why your database is completely safe.

## The Concern: "Will this exhaust the database connection pool?"

**Short Answer:** No, it will not!

**Long Answer:** 
It is easy to confuse **HTTP Connections** with **Database Connections**. 
When a user connects to the Live Status SSE endpoint, they are keeping an **HTTP Connection** open with your Node.js server. 

However, they are **NOT** keeping a connection open with MySQL. 

Here is exactly what happens when the `setupSSE` endpoint is hit:
1. The Express route receives the request.
2. Node.js adds the user's `res` (response) object to a simple Javascript Map in memory (`sseClients`).
3. Node.js writes the HTTP headers to keep the browser connection open.
4. **That's it.** There is absolutely zero database interaction required to keep the SSE connection open.

Because Node.js is asynchronous and event-driven, it can comfortably hold tens of thousands of idle HTTP connections open at the same time with extremely low memory overhead. Your MySQL database connection pool remains completely untouched and free for other users.

---

## How Our Code Works

Our implementation relies on an **Event-Driven Architecture** rather than Polling.

### 1. Connecting to SSE (`customerController.js`)
When the frontend loads, it calls `/api/customer/bookings/live`. 

```javascript
const setupSSE = (req, res) => {
  const customerId = req.user.id;

  // 1. Tell the browser to keep the HTTP connection alive indefinitely
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 2. Store this connection in Node.js memory (NO DATABASE INVOLVED)
  if (!sseClients.has(customerId)) {
    sseClients.set(customerId, new Set());
  }
  sseClients.get(customerId).add(res);

  // 3. Clean up memory if the user closes the tab
  req.on('close', () => {
    // remove from sseClients map
  });
};
```

### 2. Triggering the Update (`adminController.js`)
When an Admin updates a booking, the API performs a standard, quick database query. Only *after* the query is finished does Node.js push the update to the SSE clients.

```javascript
const updateBookingStatus = async (req, res) => {
  // ... validation ...

  // 1. Open DB Connection -> Run Update Query -> Close DB Connection
  await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

  // 2. Look up the specific user in our Memory Map and send them a message!
  emitBookingUpdate(customerId, id, status);

  res.json({ message: 'Success' });
};
```

### 3. Emitting the Message (`customerController.js`)
```javascript
const emitBookingUpdate = (customerId, bookingId, newStatus) => {
  // Check our memory map to see if the user is currently online
  const clientSet = sseClients.get(customerId);
  
  if (clientSet) {
    // If they are online, write a text string to their open HTTP connection
    const message = `data: ${JSON.stringify({ type: 'status_update', bookingId, newStatus })}\n\n`;
    clientSet.forEach(res => res.write(message));
  }
};
```

## Summary
By using SSE this way, we get true real-time updates pushed from the server. It is vastly superior to polling (where the frontend asks the backend "Are we there yet?" every 5 seconds, which *would* spam your database). Because the connection is just an idle HTTP socket managed by Node.js, your MySQL server is completely safe from exhaustion!
