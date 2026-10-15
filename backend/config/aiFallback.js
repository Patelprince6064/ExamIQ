/**
 * Offline / Fallback AI engine for ExamIQ
 * Provides rich, comprehensive, long educational responses when GROQ_API_KEY is not configured or fails.
 * Formatted cleanly with bold headers and bullet points (NO raw markdown hashes like ###).
 */

const CS_KNOWLEDGE_BASE = [
  // ─── BINARY TREES & DATA STRUCTURES ───
  {
    keywords: ["binary tree", "tree", "bst", "traversal", "inorder", "preorder", "postorder", "avl"],
    title: "Binary Trees & Tree Data Structures",
    response: `📌 Comprehensive Overview: Binary Trees & Tree Data Structures

A Binary Tree is a hierarchical non-linear data structure in which each node has at most two children, referred to as the left child and the right child. Binary trees form the foundational architecture for search trees, expression parsers, heap-based priority queues, and database indexing engines.

---

🔹 Core Types of Binary Trees:

1. Full (Strict) Binary Tree: Every node has either 0 or 2 children. No node contains exactly one child.
2. Complete Binary Tree: All levels are completely filled except possibly the last level, and all nodes in the last level are as far left as possible (critical for array-based Binary Heaps).
3. Perfect Binary Tree: All interior nodes have two children and all leaf nodes are strictly at the same depth. Total nodes for height h = 2^(h+1) - 1.
4. Balanced Binary Tree (AVL / Red-Black): The height difference between the left and right subtrees of any node (Balance Factor) is at most 1, guaranteeing O(log n) worst-case search, insertion, and deletion.
5. Binary Search Tree (BST): Enforces the BST invariant: For any node X, all keys in the left subtree are strictly smaller than X.key, and all keys in the right subtree are strictly greater than X.key.

---

⚙️ Tree Traversals & Mathematical Properties:

• Depth-First Traversals:
  - Inorder (Left → Root → Right): Produces sorted ascending order when executed on a Binary Search Tree (BST). Time Complexity: O(n).
  - Preorder (Root → Left → Right): Used for creating a copy of the tree or serializing tree structures into prefix expressions. Time Complexity: O(n).
  - Postorder (Left → Right → Root): Used for deleting/freeing tree nodes and evaluating postfix expressions (bottom-up processing). Time Complexity: O(n).

• Breadth-First Traversal (Level Order):
  - Traverses the tree level-by-level using a FIFO Queue. Time Complexity: O(n), Auxiliary Space: O(w) where w is the maximum width of the tree.

• Key Mathematical Formulas for University Exams:
  - Maximum nodes at level l (root at level 0) = 2^l
  - Maximum total nodes in a binary tree of height h = 2^(h+1) - 1
  - Minimum possible height for n nodes = ⌊log2(n)⌋
  - In any non-empty binary tree, if n0 is the number of leaf nodes and n2 is the number of nodes with two children, then: n0 = n2 + 1.

---

⚖️ Time Complexity Analysis:

• Standard BST:
  - Average Case: Search = O(log n), Insertion = O(log n), Deletion = O(log n)
  - Worst Case (Skewed Tree): Search = O(n), Insertion = O(n), Deletion = O(n)
• Self-Balancing Trees (AVL / Red-Black):
  - Guaranteed Worst Case: Search = O(log n), Insertion = O(log n), Deletion = O(log n)

---

📝 Practice Exam MCQs on Binary Trees:

1. Which traversal of a Binary Search Tree (BST) outputs keys in sorted ascending order?
   - A) Preorder Traversal
   - B) Inorder Traversal (Correct)
   - C) Postorder Traversal
   - D) Level Order Traversal
   Explanation: Inorder traversal visits Left Subtree → Root → Right Subtree. Because a BST guarantees that all left subtree values are smaller than the root and all right subtree values are larger, this recursive ordering inherently visits elements in strictly ascending numerical order.

2. A full binary tree with n leaf nodes contains how many total nodes?
   - A) 2n - 1 (Correct)
   - B) 2n
   - C) 2n + 1
   - D) n^2
   Explanation: In a strict full binary tree, every internal node has exactly 2 children. Since n0 = n2 + 1, internal nodes n2 = n - 1. Total nodes = n0 + n2 = n + (n - 1) = 2n - 1.

3. What is the maximum number of nodes in a binary tree of height h (where a root-only tree has height 0)?
   - A) 2^h
   - B) 2^(h+1) - 1 (Correct)
   - C) 2^h - 1
   - D) 2^(h-1)
   Explanation: The sum of geometric progression of nodes from level 0 to h is 1 + 2 + 4 + ... + 2^h = 2^(h+1) - 1.

4. What is the worst-case time complexity of searching an element in an un-balanced Binary Search Tree?
   - A) O(1)
   - B) O(log n)
   - C) O(n) (Correct)
   - D) O(n log n)
   Explanation: If elements are inserted in strictly ascending or descending order, the BST degenerates into a linear singly-linked list (skewed tree) of height n, resulting in O(n) search time.

5. Which tree rotation is required in an AVL tree when a new node is inserted into the right subtree of the right child?
   - A) Left-Right (LR) Rotation
   - B) Right-Left (RL) Rotation
   - C) Single Left (LL) Rotation (Correct)
   - D) Single Right (RR) Rotation
   Explanation: An insertion into the Right subtree of a Right child creates an RR imbalance. To restore balance, a single Left rotation around the unbalanced node is performed.`,
  },

  // ─── TCP 3-WAY HANDSHAKE & NETWORKING ───
  {
    keywords: ["tcp", "3-way", "three-way", "handshake", "syn", "ack", "osi", "transport", "udp"],
    title: "TCP 3-Way Handshake & Transport Layer",
    response: `📌 Comprehensive Overview: TCP 3-Way Handshake & Connection Management

The Transmission Control Protocol (TCP) is a connection-oriented, reliable, byte-stream transport layer protocol defined in RFC 793. Before any application data (such as HTTP, SMTP, or FTP) can be transmitted between two hosts, TCP establishes a virtual connection using a synchronized 3-Way Handshake mechanism.

---

🔹 The 3 Steps of Connection Establishment:

1. Step 1: SYN (Synchronize Segment)
   - The Client initiates connection by sending a TCP segment with the SYN flag set to 1.
   - The Client selects a pseudo-random Initial Sequence Number (ISN_Client = X).
   - Control flags: SYN = 1, ACK = 0.
   - Client state transitions from CLOSED → SYN-SENT.
   - Purpose: Informs the server of the client's initial sequence number and negotiates TCP options such as Maximum Segment Size (MSS) and Window Scale.

2. Step 2: SYN-ACK (Synchronize + Acknowledge Segment)
   - Upon receiving the SYN segment, the Server allocates transmission buffers and variables.
   - The Server responds with a segment having both SYN = 1 and ACK = 1.
   - It acknowledges client's ISN by setting Acknowledgment Number = X + 1.
   - The Server generates its own independent Initial Sequence Number (ISN_Server = Y).
   - Server state transitions from LISTEN → SYN-RCVD.

3. Step 3: ACK (Acknowledgment Segment)
   - The Client receives the SYN-ACK and confirms connection establishment.
   - The Client sends an ACK segment with ACK = 1, SYN = 0.
   - Sequence Number = X + 1, Acknowledgment Number = Y + 1.
   - Client state transitions from SYN-SENT → ESTABLISHED.
   - Upon receiving this segment, Server state transitions from SYN-RCVD → ESTABLISHED.
   - Note: Application payload data may be bundled with this third segment.

---

⚙️ Connection Teardown: TCP 4-Way Handshake:

Because TCP is full-duplex (data can flow in both directions independently), terminating a connection requires closing each half-connection separately:
1. Client sends FIN segment (state: FIN-WAIT-1).
2. Server responds with ACK (state: CLOSE-WAIT; Client enters FIN-WAIT-2).
3. Server finishes sending remaining data and transmits its own FIN segment (state: LAST-ACK).
4. Client responds with ACK and enters TIME-WAIT state for 2MSL (Maximum Segment Lifetime, typically 120s) to ensure the server received the final ACK before fully releasing socket resources.

---

⚖️ Key Architectural Principles for College Exams:

• Sequence Numbers: Prevent packet duplication, identify missing packets, and restore original ordering of out-of-order packets.
• Flow Control (Sliding Window): Receiver advertises its available buffer space (Receive Window rwnd) in the TCP header to prevent fast senders from overwhelming slow receivers.
• Congestion Control: Prevents network collapse using four algorithms: Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery.
• Security Vulnerability (SYN Flood Attack): Attackers send massive SYN requests with spoofed IPs without returning the final ACK, consuming server connection tables. Mitigated using SYN Cookies.

---

📝 Practice Exam MCQs on TCP & Networking:

1. Which flag combination is active during the second step of the TCP 3-way handshake?
   - A) SYN = 1, ACK = 0
   - B) SYN = 1, ACK = 1 (Correct)
   - C) FIN = 1, ACK = 1
   - D) RST = 1, ACK = 0
   Explanation: In Step 2, the server simultaneously acknowledges the client's initial sequence number (ACK = 1) and sends its own synchronized sequence number (SYN = 1).

2. Why does a TCP client enter the TIME-WAIT state after terminating a connection?
   - A) To buffer incoming application data
   - B) To ensure the final ACK reached the server and prevent delayed duplicate packets from interfering with new connections (Correct)
   - C) To calculate the Round Trip Time (RTT)
   - D) To negotiate window scaling
   Explanation: TIME-WAIT lasts for 2 MSL (Maximum Segment Lifetime). It ensures that if the final ACK is lost in transit, the server's retransmitted FIN can be acknowledged properly rather than corrupting a newly spawned connection on the same socket pair.

3. Which layer of the OSI model provides end-to-end reliable data delivery, flow control, and error correction?
   - A) Network Layer
   - B) Transport Layer (Correct)
   - C) Data Link Layer
   - D) Session Layer
   Explanation: The Transport Layer (Layer 4) is directly responsible for process-to-process (end-to-end) delivery, reliability, flow control, and packet reordering.`,
  },

  // ─── DEADLOCKS IN OPERATING SYSTEMS ───
  {
    keywords: ["deadlock", "banker", "resource", "prevention", "avoidance", "coffman"],
    title: "Deadlocks in Operating Systems",
    response: `📌 Comprehensive Overview: Deadlocks in Operating Systems

A Deadlock is an operating system state in which a set of concurrent processes are permanently blocked because each process holds resources that another process needs, and none can proceed without acquiring them.

---

🔹 The 4 Necessary Coffman Conditions:

A deadlock can occur if and only if all four Coffman conditions hold simultaneously in the system:

1. Mutual Exclusion: At least one resource must be non-shareable. Only one process can hold the resource at any given instant.
2. Hold and Wait: A process must currently hold at least one resource while waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly revoked from a process holding them; they can only be released voluntarily upon task completion.
4. Circular Wait: A closed chain of processes exists: P0 waits for a resource held by P1, P1 waits for P2, ..., and Pn waits for P0.

---

⚙️ Methods for Handling Deadlocks:

1. Deadlock Prevention (Negate at least one Coffman condition):
   - Invalidate Mutual Exclusion: Make resources shareable (e.g. read-only files). However, hardware resources like printers cannot be shared.
   - Invalidate Hold and Wait: Require processes to request all needed resources at once before execution begins, or release current resources before requesting new ones (causes low resource utilization and starvation).
   - Invalidate No Preemption: If a process requesting a resource cannot be allocated, preempt all resources currently held by it.
   - Invalidate Circular Wait: Impose a global linear ordering on all resource types using a numbering function F(R). A process can only request resources in strictly increasing order of enumeration.

2. Deadlock Avoidance (Dynamic Safety Checking):
   - The OS dynamically analyzes each resource allocation request to verify that granting it will leave the system in a Safe State.
   - Banker's Algorithm (Edsger Dijkstra):
     - Matrices: Available[m], Max[n][m], Allocation[n][m], Need[n][m].
     - Need calculation: Need[i][j] = Max[i][j] - Allocation[i][j].
     - Safety Algorithm: Searches for a safe execution sequence <P0, P1, ..., Pn-1> where Need[i] ≤ Available. If such a sequence exists, the system is safe and no deadlock can occur.

3. Deadlock Detection & Recovery:
   - System allows deadlocks to occur, periodically runs a Wait-For Graph (WFG) cycle detection algorithm (O(V^2)), and initiates recovery via process termination or resource rollback.

4. Deadlock Ignorance (The Ostrich Algorithm):
   - Assume deadlocks occur infrequently enough that the cost of prevention/avoidance outweighs the inconvenience of a system reboot (standard in Windows, Linux, and macOS).

---

📝 Practice Exam MCQs on Deadlocks:

1. Which technique permanently eliminates Circular Wait?
   - A) Banker's Algorithm
   - B) Imposing a global strict linear ordering on resource allocation (Correct)
   - C) Spooling all non-shareable devices
   - D) Virtual memory paging
   Explanation: By assigning an integer priority to every resource and requiring that processes request resources only in strictly ascending numerical order, closed circular loops in the resource allocation graph become mathematically impossible.

2. What is the fundamental formula used to compute process need in Banker's Algorithm?
   - A) Need = Max + Allocation
   - B) Need = Max - Allocation (Correct)
   - C) Need = Available - Allocation
   - D) Need = Max - Available
   Explanation: The Need matrix represents remaining resources required by each process to complete execution, calculated as its maximum declared demand minus its currently allocated resources: Need[i][j] = Max[i][j] - Allocation[i][j].

3. If a Resource Allocation Graph contains a cycle and all resource types have only a SINGLE instance, what does the cycle indicate?
   - A) A deadlock might occur
   - B) A deadlock definitely exists (Correct)
   - C) System is completely safe
   - D) Starvation is prevented
   Explanation: In a Resource Allocation Graph where every resource has strictly one instance, the existence of a cycle is both a necessary and sufficient condition for a deadlock.`,
  },

  // ─── SQL JOINS, NORMALIZATION & DBMS ───
  {
    keywords: ["sql", "join", "inner", "left", "right", "outer", "dbms", "normalization", "normal form", "1nf", "2nf", "3nf", "bcnf", "acid"],
    title: "SQL Joins, Normalization & Database Management",
    response: `📌 Comprehensive Overview: SQL Joins, Normalization & Database Architecture

Database Management Systems (DBMS) organize structured relational records using relational algebra. Mastering table join operations, functional dependencies, and normalization forms is essential for database schema optimization and exam success.

---

🔹 SQL Joins Explained in Detail:

1. INNER JOIN:
   - Returns only rows that satisfy the matching join predicate in both tables. Unmatched rows from both sides are discarded.
   - Syntax:
     SELECT S.name, C.course_title
     FROM Students S
     INNER JOIN Enrollments E ON S.student_id = E.student_id
     INNER JOIN Courses C ON E.course_id = C.course_id;

2. LEFT OUTER JOIN:
   - Returns all rows from the Left table, paired with matched rows from the Right table. Where no match exists, NULL values are populated for the right table columns.

3. RIGHT OUTER JOIN:
   - Returns all rows from the Right table, along with matched records from the Left table. Non-matching left columns evaluate to NULL.

4. FULL OUTER JOIN:
   - Returns all records whenever a match exists in either table. If there is no match, NULL values fill the unmatched side.

5. CROSS JOIN (Cartesian Product):
   - Computes the mathematical Cartesian product of two tables. If Table A has M rows and Table B has N rows, the result contains M × N rows.

6. SELF JOIN:
   - Joins a table to itself using distinct table aliases (e.g. Employee table joined with Manager table on Employee.manager_id = Manager.emp_id).

---

⚙️ Database Normalization: Forms & Rules:

Normalization minimizes data redundancy and prevents insertion, update, and deletion anomalies:

• 1NF (First Normal Form):
  - Rule: Every table attribute must hold atomic (indivisible) values. Multi-valued attributes, repeating groups, and arrays are prohibited.

• 2NF (Second Normal Form):
  - Rule: Must be in 1NF AND have No Partial Dependencies.
  - Partial Dependency: A non-prime attribute depends on only a subset of a composite candidate key. If the candidate key is a single attribute, 2NF is automatically satisfied.

• 3NF (Third Normal Form):
  - Rule: Must be in 2NF AND have No Transitive Dependencies (X → Y where Y is non-prime and X is not a superkey).
  - Formal Condition: For every functional dependency X → A, either X is a superkey OR A is a prime attribute.

• BCNF (Boyce-Codd Normal Form / 3.5NF):
  - Rule: Strictly stronger than 3NF. For every non-trivial functional dependency X → A, X must strictly be a Superkey.

---

⚖️ ACID Properties in Transaction Processing:

• Atomicity: "All or nothing". Either all operations in a transaction execute successfully or the entire transaction is rolled back. Managed by Recovery Manager (write-ahead log).
• Consistency: A transaction preserves database integrity constraints from one valid state to another.
• Isolation: Concurrent transactions execute without mutual interference. Enforced by Concurrency Control protocols (2-Phase Locking, Timestamp Ordering).
• Durability: Once a transaction commits, its modifications persist permanently, even through system crashes and power loss.

---

📝 Practice Exam MCQs on DBMS & SQL:

1. Which normal form eliminates transitive functional dependencies?
   - A) 1NF
   - B) 2NF
   - C) 3NF (Correct)
   - D) BCNF
   Explanation: Third Normal Form (3NF) requires that no non-prime attribute is transitively dependent on the primary key via another non-prime attribute (X → Y → Z).

2. In SQL, what result does a FULL OUTER JOIN produce?
   - A) Only records where both tables match
   - B) All records from both tables, filling with NULL where join conditions fail (Correct)
   - C) Cartesian product of tables
   - D) Eliminates all duplicate primary keys
   Explanation: FULL OUTER JOIN combines the results of both LEFT JOIN and RIGHT JOIN. Rows with no match on either side are included with NULL values.

3. Which component of ACID ensures changes made by committed transactions persist across power outages?
   - A) Atomicity
   - B) Consistency
   - C) Isolation
   - D) Durability (Correct)
   Explanation: Durability guarantees that committed database updates are written to non-volatile storage (disk/WAL) and survive system crashes.`,
  },

  // ─── CPU PROCESS SCHEDULING (OS) ───
  {
    keywords: ["process", "scheduling", "fcfs", "sjf", "round robin", "cpu", "preemptive", "aging", "turnaround"],
    title: "CPU Process Scheduling & Algorithms",
    response: `📌 Comprehensive Overview: CPU Process Scheduling & Algorithms

CPU Scheduling is the process by which the operating system's Short-Term Scheduler (CPU Scheduler) selects a process from the Ready Queue and allocates the CPU core to execute its instructions. Efficient scheduling maximizes CPU utilization, maximizes throughput, and minimizes process latency.

---

🔹 Primary Scheduling Criteria & Formulas:

• Arrival Time (AT): Time instant when a process enters the Ready Queue.
• Burst Time (BT): Total CPU execution time required by the process.
• Completion Time (CT): Time instant when process finishes execution.
• Turnaround Time (TAT): Total elapsed time from arrival to completion:
  Formula: TAT = Completion Time (CT) - Arrival Time (AT)
• Waiting Time (WT): Total time spent waiting in the ready queue:
  Formula: WT = Turnaround Time (TAT) - Burst Time (BT)
• Response Time (RT): Time elapsed between process arrival and first CPU execution allocation.

---

⚙️ Key Scheduling Algorithms:

1. First-Come, First-Served (FCFS):
   - Mechanism: Non-preemptive. Processes are dispatched strictly in arrival sequence via a FIFO queue.
   - Limitation: Convoy Effect (a CPU-bound process with long burst time blocks multiple short I/O-bound processes, drastically inflating average waiting time).

2. Shortest Job First (SJF) & Shortest Remaining Time First (SRTF):
   - Mechanism: Selects the process with smallest CPU burst time.
   - SJF is Non-preemptive; SRTF is its Preemptive variant.
   - Theoretical Advantage: Mathematically proven to yield the minimum average waiting time for any given set of processes.
   - Limitation: Impossible to implement perfectly in general OS kernels because upcoming CPU burst lengths cannot be known in advance (must be estimated using exponential smoothing).
   - Risk: Long burst jobs suffer from Starvation.

3. Round Robin (RR):
   - Mechanism: Preemptive scheduling designed for time-sharing systems. Each process is allocated a fixed time slice (Time Quantum q).
   - If process completes within q, it terminates; otherwise, an interrupt occurs and the process is placed at the tail of the ready queue.
   - Critical Trade-off: If quantum q is too large, RR behaves like FCFS. If q is too small, context-switching overhead dominates and degrades throughput. Rule of thumb: 80% of CPU bursts should be shorter than q.

4. Priority Scheduling & The Aging Technique:
   - Mechanism: Each process is assigned an integer priority. CPU is allocated to the highest priority process.
   - Vulnerability: Low-priority processes may wait indefinitely (Starvation / Indefinite Blocking).
   - Solution (Aging): The OS gradually increments the priority of waiting processes as time progresses, guaranteeing eventual execution.

---

📝 Practice Exam MCQs on CPU Scheduling:

1. What problem in Priority Scheduling is solved by the 'Aging' technique?
   - A) Memory Fragmentation
   - B) Starvation of low-priority processes (Correct)
   - C) Convoy Effect
   - D) Thrashing in Virtual Memory
   Explanation: Aging periodically increases the priority of waiting processes over time. Consequently, even the lowest-priority process eventually achieves high enough priority to be dispatched, eliminating starvation.

2. Which CPU scheduling algorithm guarantees the minimum average waiting time?
   - A) Round Robin
   - B) Shortest Job First / Shortest Remaining Time First (Correct)
   - C) First-Come First-Served
   - D) Multilevel Queue
   Explanation: By executing shorter processes ahead of longer ones, average waiting time is minimized mathematically under SJF/SRTF.

3. What happens in Round Robin scheduling if the Time Quantum is set extremely large?
   - A) High context switching overhead
   - B) Degenerates into First-Come, First-Served (FCFS) (Correct)
   - C) Deadlock occurs
   - D) Throughput drops to zero
   Explanation: When the time quantum exceeds the longest process burst time, no process is preempted before completion, making the algorithm execute identically to FCFS.`,
  },

  // ─── GENERAL MCQS / QUIZ GENERATION ───
  {
    keywords: ["mcq", "question", "quiz", "generate"],
    title: "High-Yield Computer Science Practice MCQs",
    response: `📌 High-Yield Computer Science Practice MCQs (With In-Depth Explanations)

Here is a curated set of university and technical interview exam questions covering Computer Networks, Operating Systems, Database Management Systems, Data Structures, and Algorithm Design:

---

1. Which layer of the OSI model handles end-to-end reliability, flow control, and sequence numbers?
   - A) Network Layer
   - B) Transport Layer (Correct)
   - C) Data Link Layer
   - D) Session Layer
   Detailed Explanation: The Transport Layer (Layer 4) is responsible for host-to-host process communication, packet segmentation, reassembly, error control, and end-to-end reliable delivery using protocols like TCP. The Network Layer handles logical IP routing between hops, while Data Link manages node-to-node frame delivery.

2. In Operating Systems, what problem does the 'Aging' technique solve?
   - A) Memory Leakage
   - B) Starvation in Priority Scheduling (Correct)
   - C) Cache Invalidation
   - D) Page Fault Overhead
   Detailed Explanation: Aging is a scheduling strategy where the priority of processes waiting in the ready queue is systematically increased as waiting time elapses. This prevents low-priority processes from waiting indefinitely (starvation).

3. Which SQL normal form eliminates transitive functional dependencies?
   - A) 1NF
   - B) 2NF
   - C) 3NF (Correct)
   - D) BCNF
   Detailed Explanation: 3NF requires a relation to be in 2NF and ensure that no non-prime attribute is transitively dependent on the primary key (i.e. X → Y and Y → Z where Z is non-prime). 2NF eliminates partial dependencies, while BCNF enforces that every determinant is a superkey.

4. What is the worst-case time complexity of QuickSort when a poor pivot is selected?
   - A) O(n log n)
   - B) O(n)
   - C) O(n^2) (Correct)
   - D) O(log n)
   Detailed Explanation: When the chosen pivot is consistently the smallest or largest element (such as in an already sorted array when choosing the first/last element), the partitioning splits the array into subarrays of sizes 0 and n - 1. This results in the recurrence T(n) = T(n - 1) + O(n), which solves to O(n^2).

5. Which algorithm is used in Operating Systems for Deadlock Avoidance?
   - A) Round Robin Algorithm
   - B) Banker's Algorithm (Correct)
   - C) Dijkstra's Shortest Path Algorithm
   - D) Kruskal's Minimum Spanning Tree
   Detailed Explanation: Banker's Algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources, and then makes an s-state check to see if all processes can eventually complete without entering an unsafe deadlock state.`,
  },
];

// Helper to sanitize text: strip any leading markdown hashes like ###, ##, #
function sanitizeText(str) {
  if (!str) return "";
  return str
    .replace(/^#{1,6}\s*(.*)$/gm, "$1")
    .replace(/###+/g, "")
    .trim();
}

/**
 * Conversational replies for greetings / small-talk / vague input.
 * The tutor must chat like a human — never dump an "Exam Guide" for "hi".
 */
const CONVERSATIONAL_PATTERNS = [
  { match: /^(hi+|hii+|hey+|hello+|yo|hola|namaste|good\s?(morning|afternoon|evening)|gm|gn)\b/, reply: `👋 Hey there! Great to see you.\n\nI'm your AI study partner for **DSA, OS, DBMS, CN and AI**. Tell me what's on your mind — for example:\n\n• "Explain Deadlock in OS"\n• "Generate 5 MCQs on Binary Trees"\n• "What is the TCP 3-way handshake?"\n\nWhat would you like to learn today?` },
  { match: /^(thanks?|thank\s?you|thx|shukriya|dhanyavad)/, reply: `You're most welcome! 😊\n\nWant me to quiz you on this topic, explain it deeper, or move to the next one? Just say the word.` },
  { match: /^(bye|goodbye|see\s?you|alvida|good\s?night)/, reply: `Goodbye and good luck with your prep! 👋\n\nQuick tip before you go: revise one weak topic today — consistency beats cramming. Come back anytime!` },
  { match: /^(who\s?are\s?you|what\s?can\s?you\s?do|help|how\s?do\s?(you|u)\s?work|features)/, reply: `🤖 I'm your **AI Practice Tutor** — here to make exam prep feel like chatting with a friendly professor.\n\nI can:\n\n1. **Explain** any DSA / OS / DBMS / CN / AI concept with examples\n2. **Generate MCQs** and practice questions on any topic\n3. **Build study plans** around your exam date and weak topics\n\nTry: "Explain SQL Joins with examples" or "Generate 5 MCQs on OS Deadlocks".` },
  { match: /^(ok|okay|cool|nice|great|awesome|hmm|oh|ah|yeah|yes|no|fine)\b/, reply: `Got it! 👍\n\nTell me which topic to dive into — e.g. "Explain process scheduling" or "Quiz me on DBMS normalization". What shall we tackle next?` },
];

function conversationalReply(message) {
  const text = (message || "").trim().toLowerCase();
  if (!text) return null;
  for (const p of CONVERSATIONAL_PATTERNS) {
    if (p.match.test(text)) return p.reply;
  }
  // Ultra-short / vague input (1-2 chars, single generic word) → ask, don't lecture
  // (CS abbreviations like TCP / SQL / DSA / OS are real topics — let them through)
  const words = text.split(/\s+/).filter(Boolean);
  const isCsAbbr = /^(tcp|udp|sql|dsa|os|cn|ai|dbms|bst|avl|sjf|fcfs|acid|bcnf|1nf|2nf|3nf)$/.test(text);
  if (text.length <= 2 || (words.length === 1 && words[0].length <= 4 && !isCsAbbr)) {
    return `Hey! 👋 I didn't quite catch the topic.\n\nCould you tell me a little more? For example:\n\n• "Explain Binary Trees with an example"\n• "What is process scheduling?"\n• "Generate MCQs on SQL Joins"\n\nWhat would you like to study?`;
  }
  // A bare CS topic ("Binary Trees", "Deadlocks", "TCP") is a real question — let the knowledge base answer it
  if (/(tree|bst|deadlock|banker|tcp|handshake|syn|ack|osi|sql|join|normal|acid|dbms|schedul|process|fcfs|round\s?robin|array|stack|queue|graph|heap|dsa|os\b|cn\b|ai\b|mcq|quiz|explain)/.test(text)) return null;
  if (words.length <= 2) {
    return `Interesting — "${(message || "").trim()}" could mean a few things! 🤔\n\nAre you asking about a **concept** (I'll explain it), or do you want **practice questions** on it? Give me a topic like "Deadlock in OS" and I'll take it from there.`;
  }
  return null;
}

/**
 * Generate fallback response for chat
 */
function generateFallbackChatResponse(message) {
  const lowerMsg = (message || "").toLowerCase();

  // 0. Conversational first — greetings & small-talk never get an exam dump
  const convo = conversationalReply(message);
  if (convo) return sanitizeText(convo);

  // 1. Check for specific topic MCQs first if user asked for MCQs + Topic
  if (lowerMsg.includes("mcq") || lowerMsg.includes("quiz") || lowerMsg.includes("question")) {
    if (lowerMsg.includes("tree") || lowerMsg.includes("bst") || lowerMsg.includes("dsa") || lowerMsg.includes("binary")) {
      const match = CS_KNOWLEDGE_BASE.find((k) => k.title.includes("Binary Trees"));
      if (match) return sanitizeText(match.response);
    }
    if (lowerMsg.includes("tcp") || lowerMsg.includes("network") || lowerMsg.includes("handshake") || lowerMsg.includes("osi")) {
      const match = CS_KNOWLEDGE_BASE.find((k) => k.title.includes("TCP"));
      if (match) return sanitizeText(match.response);
    }
    if (lowerMsg.includes("deadlock") || lowerMsg.includes("banker") || lowerMsg.includes("os")) {
      const match = CS_KNOWLEDGE_BASE.find((k) => k.title.includes("Deadlocks"));
      if (match) return sanitizeText(match.response);
    }
    if (lowerMsg.includes("sql") || lowerMsg.includes("join") || lowerMsg.includes("dbms") || lowerMsg.includes("normal")) {
      const match = CS_KNOWLEDGE_BASE.find((k) => k.title.includes("SQL"));
      if (match) return sanitizeText(match.response);
    }
    if (lowerMsg.includes("schedul") || lowerMsg.includes("process") || lowerMsg.includes("round robin") || lowerMsg.includes("fcfs")) {
      const match = CS_KNOWLEDGE_BASE.find((k) => k.title.includes("Process Scheduling"));
      if (match) return sanitizeText(match.response);
    }
    const mcqMatch = CS_KNOWLEDGE_BASE.find((k) => k.keywords.includes("mcq"));
    if (mcqMatch) return sanitizeText(mcqMatch.response);
  }

  // 2. Regular Knowledge base lookup
  for (const item of CS_KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => lowerMsg.includes(kw))) {
      return sanitizeText(item.response);
    }
  }

  // 3. Comprehensive, long educational response for any prompt
  const topicTitle = message.trim();
  const genericResponse = `📌 Comprehensive Exam Guide: ${topicTitle}

Thank you for your question on "${topicTitle}". Below is a structured, in-depth academic breakdown prepared specifically for university semester exams and technical interviews:

---

🔹 1. Formal Definition & Core Concepts:
${topicTitle} is an essential concept in Computer Science. It provides foundational mechanics for efficient system operation, algorithmic resource optimization, and data governance. In technical evaluations, examiners assess your ability to define the concept precisely, diagram its components, and discuss computational trade-offs.

• Primary Objectives:
  - Maximize execution throughput and operational reliability.
  - Enforce data integrity and deterministic system state transitions.
  - Optimize memory footprint and CPU instruction cycles.

---

⚙️ 2. Architectural Mechanics & Step-by-Step Working:
To answer long-form examination questions on ${topicTitle}, follow this structured 4-stage breakdown:

1. Initialization & State Validation:
   - The environment establishes required parameters, memory buffers, and pointers.
   - Input bounds and preconditions are checked to eliminate edge-case vulnerabilities.

2. Execution & State Transformation:
   - Primary operations execute systematically according to defined algorithmic rules.
   - Concurrency constraints, locking mechanisms, and resource contention protocols are respected.

3. Verification & Termination:
   - Output correctness is confirmed against validation specifications.
   - Allocated volatile resources, socket descriptors, or heap buffers are safely released.

---

⚖️ 3. Computational Complexity & Trade-Offs:
• Time Complexity: Typically ranges between O(log n) for balanced hierarchical models and O(n) for linear operations.
• Space Complexity: Depends on recursive call-stack depth or auxiliary storage overhead (O(1) auxiliary space is optimal).
• Trade-offs: Higher abstraction reduces implementation friction but can introduce runtime overhead; lower-level direct management boosts throughput at the cost of manual synchronization.

---

📝 4. High-Yield University Exam Questions & Model Answers:

Q1: What are the primary differences between ${topicTitle} and alternative approaches?
Answer: Traditional approaches often incur higher resource overhead or lack strict synchronization guarantees. In contrast, modern implementations utilize optimized data layouts and non-blocking invariants to achieve predictable execution times.

Q2: What common pitfalls must be addressed during implementation?
Answer: Key challenges include handling edge cases (null inputs, empty data structures, concurrent modifications), preventing memory leaks, and managing latency bottlenecks.

---

🎯 5. Quick Revision Takeaways:
• Always state formal definitions and draw labelled architectural diagrams in semester exams.
• Clearly analyze best-case, average-case, and worst-case time complexities.
• Mention real-world industry applications (e.g. distributed systems, kernel drivers, cloud databases).`;

  return sanitizeText(genericResponse);
}

/**
 * Generate fallback response for Deep Explain
 */
function generateFallbackExplainResponse(topic, subject) {
  const cleanTopic = topic || "Computer Science Concept";
  const cleanSub = subject || "Computer Science";

  const response = `📌 Comprehensive Topic Explanation: ${cleanTopic} (${cleanSub})

1. Academic Definition & Core Intuition:
${cleanTopic} represents a fundamental concept within the field of ${cleanSub}. In system design and software engineering, mastering this topic enables engineers and students to design fault-tolerant, high-performance systems that adhere to industry standards.

---

2. Architectural Components & Key Principles:
• Core Structural Foundation: Organizes system components into decoupled modules to optimize throughput and fault isolation.
• Execution Flow: System states transition deterministically based on defined input invariants and boundary conditions.
• Memory & Compute Utilization: Minimizes instruction stalls and reduces auxiliary memory overhead during peak execution workloads.

---

3. Step-by-Step Working Mechanism:
1. Setup & Preconditions: Necessary state structures, memory pages, or network sockets are allocated and initialized.
2. Core Processing Cycle: Algorithms execute state transformations while checking safety invariants.
3. Post-Processing & Output Generation: Results are validated, and resources are returned to system pools.

---

4. High-Yield Exam Preparation Notes:
• Key Question: "Explain ${cleanTopic} with a neat block diagram, state its operational advantages, and discuss its primary constraints."
• Model Answer Tip: Always include a labeled step-by-step diagram, cite the underlying asymptotic complexity (Big-O notation), and contrast against alternative techniques.`;

  return sanitizeText(response);
}

/**
 * Generate fallback response for Study Plan
 */
function generateFallbackStudyPlan(user, startDate, examDate) {
  const subjects = user?.subjects?.length ? user.subjects.join(", ") : "DSA, OS, DBMS, Computer Networks, AI";
  const hours = user?.studyGoalHours || 4;

  const response = `📅 Comprehensive Exam Preparation Study Plan

Target Subjects: ${subjects}
Daily Study Commitment: ${hours} Hours / Day
Timeline: ${startDate || "Today"} to ${examDate || "Exam Date"}

---

📆 Phase 1: Foundational Theory & Core Algorithms (Days 1 - 4)
• Focus: Data Structures & Algorithms + Operating Systems
• Key Topics:
  - Binary Trees, BSTs, Traversals, Heaps, AVL Trees, Dynamic Programming.
  - Process Scheduling (FCFS, SJF, Round Robin), Deadlock Coffman Conditions, Banker's Algorithm.
• Daily Tasks: 2 Hours Theory Review + 2 Hours Hands-on Coding / Past-year Questions.

---

📆 Phase 2: System Architecture & Data Systems (Days 5 - 8)
• Focus: DBMS + Computer Networks
• Key Topics:
  - Relational Schema, SQL Joins, Normalization (1NF through BCNF), ACID Transactions.
  - OSI 7-Layer Model, TCP 3-Way Handshake, Sliding Window Protocol, Subnetting.
• Daily Tasks: Solve 20 Subject-specific MCQs daily + Practice SQL query writing.

---

📆 Phase 3: Advanced Topics & Comprehensive Mock Exams (Days 9 - Final)
• Focus: AI/ML Fundamentals + Full-Length Timed Mocks
• Key Topics:
  - Search Algorithms (BFS, DFS, A*), Machine Learning Classifiers, Model Evaluation.
  - Complete timed previous-year exam papers under examination conditions.
  - Targeted revision of weak topics identified during practice quizzes.`;

  return sanitizeText(response);
}

function generateFallbackRoadmap(skill) {
  const s = skill || "General CS";
  return [
    {
      step: 1,
      title: `Orientation & ${s} Environment Setup`,
      description: `Understand what ${s} is used for, where it fits in real projects and exams, and set up a clean practice environment with essential tools and resources.`,
      topics: [`Why learn ${s}: use-cases & career scope`, "Install tools, editors & extensions", "Hello-world first program / setup check", "How to use docs & community help"],
    },
    {
      step: 2,
      title: `${s} Core Syntax & Fundamentals`,
      description: `Master the absolute basics — syntax, core vocabulary and mental models of ${s} — so every later stage feels intuitive instead of memorized.`,
      topics: [`${s} syntax & code structure`, "Variables, data types & operators", "Conditionals & loops in practice", "10 tiny drills to build fluency"],
    },
    {
      step: 3,
      title: `Essential ${s} Building Blocks`,
      description: `Learn the everyday building blocks of ${s}: functions/modules, collections and file or component handling through guided mini-exercises.`,
      topics: ["Functions, scope & modular code", "Arrays / lists / objects & iteration", "Error handling & edge cases", "Build 5 micro-exercises"],
    },
    {
      step: 4,
      title: `Intermediate ${s} Concepts & Patterns`,
      description: `Move beyond basics into the patterns professionals use daily in ${s} — structuring logic cleanly and reusing proven approaches.`,
      topics: ["Common design patterns in " + s, "Async / event-driven thinking", "Working with APIs / libraries", "Refactor a messy script cleanly"],
    },
    {
      step: 5,
      title: `${s} Data Handling & State Management`,
      description: `Learn how ${s} manages data at scale — storage, state, and flow — plus how to avoid the most common data bugs in exams and projects.`,
      topics: ["State / data flow fundamentals", "CRUD operations & persistence", "Validation & sanitization", "Debug a data-flow bug end-to-end"],
    },
    {
      step: 6,
      title: `${s} Tooling, Libraries & Ecosystem`,
      description: `Get productive with the real ecosystem around ${s}: package managers, frameworks, testing helpers and productivity shortcuts.`,
      topics: ["Package managers & project scaffolding", "Must-know libraries for " + s, "Version control (Git) workflow", "Linting, formatting & docs habits"],
    },
    {
      step: 7,
      title: `Mini Projects in ${s}`,
      description: `Consolidate stages 1–6 by building two small but complete ${s} projects — the fastest way to convert theory into durable skill.`,
      topics: [`Guided project 1: ${s} starter app`, "Guided project 2 with a twist", "Read & review someone else's code", "Write a project README & demo"],
    },
    {
      step: 8,
      title: `${s} Testing, Debugging & Optimization`,
      description: `Learn to prove your ${s} code works and runs fast: systematic debugging, writing tests, and profiling performance bottlenecks.`,
      topics: ["Debugging strategy: reproduce → isolate → fix", "Unit tests for core logic", "Performance profiling basics", "Fix 3 buggy programs on purpose"],
    },
    {
      step: 9,
      title: `Advanced ${s} & Best Practices`,
      description: `Study the advanced 20% of ${s} that separates beginners from professionals — security, scalability, and clean architecture habits.`,
      topics: ["Security & common pitfalls", "Scalability & clean architecture", "Code reviews & style guides", "Solve 5 advanced scenario questions"],
    },
    {
      step: 10,
      title: `${s} Portfolio, Interview & Mastery Plan`,
      description: `Turn your skill into outcomes: a portfolio piece, interview-ready explanations, and a 30-day retention plan to keep ${s} sharp.`,
      topics: ["Polish 1 flagship portfolio project", "Mock interview Q&A on " + s, "Previous-year / PYQ practice set", "30-day revision & streak plan"],
    },
  ];
}

const TOPIC_MCQ_POOLS = {
  arrays: [
    {
      question: "What is the time complexity of accessing an element at index i in an array of size n?",
      options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n^2)"],
      correctAnswer: "A) O(1)",
      explanation: "Arrays store elements in contiguous memory. The memory address of any index i is calculated directly using Base Address + (i * element_size), enabling constant O(1) random access.",
      topic: "Arrays",
      difficulty: "easy",
    },
    {
      question: "In a 2D array A[M][N] stored in Row-Major order with base address B and element size S, what is the address formula for A[i][j] (0-indexed)?",
      options: [
        "A) B + (i * N + j) * S",
        "B) B + (j * M + i) * S",
        "C) B + (i + j) * S",
        "D) B + (i * M + j) * S",
      ],
      correctAnswer: "A) B + (i * N + j) * S",
      explanation: "In Row-Major order, rows are stored consecutively. To reach row i, we skip i complete rows each having N elements, then add j offset columns: Address = B + (i * N + j) * S.",
      topic: "Arrays",
      difficulty: "medium",
    },
    {
      question: "What is the worst-case time complexity of inserting an element at the beginning of an array of size n?",
      options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n log n)"],
      correctAnswer: "C) O(n)",
      explanation: "Inserting at the beginning requires shifting all existing n elements one position to the right to create an empty slot at index 0, resulting in O(n) operations.",
      topic: "Arrays",
      difficulty: "easy",
    },
    {
      question: "Which algorithm finds the contiguous subarray with the largest sum in O(n) time and O(1) space?",
      options: ["A) Dijkstra's Algorithm", "B) Kadane's Algorithm", "C) Floyd-Warshall Algorithm", "D) Kruskal's Algorithm"],
      correctAnswer: "B) Kadane's Algorithm",
      explanation: "Kadane's algorithm maintains the maximum subarray sum ending at each position, resetting the running sum when it becomes negative, achieving O(n) linear time.",
      topic: "Arrays",
      difficulty: "medium",
    },
    {
      question: "What is the prerequisite condition required before applying Binary Search on an array?",
      options: [
        "A) The array must contain unique elements",
        "B) The array must be sorted in monotonic order",
        "C) The array must be dynamically allocated",
        "D) The array size must be a power of two",
      ],
      correctAnswer: "B) The array must be sorted in monotonic order",
      explanation: "Binary Search relies on dividing the search space in half based on comparing the target with the midpoint value. This divide-and-conquer strategy only holds if elements are monotonically sorted.",
      topic: "Arrays",
      difficulty: "easy",
    },
  ],
  deadlock: [
    {
      question: "Which of the following is NOT one of the four mandatory Coffman conditions for a deadlock?",
      options: ["A) Mutual Exclusion", "B) Hold and Wait", "C) Preemption", "D) Circular Wait"],
      correctAnswer: "C) Preemption",
      explanation: "The condition is 'No Preemption'. Resources cannot be forcibly taken from a process holding them; they must be released voluntarily.",
      topic: "Deadlock",
      difficulty: "easy",
    },
    {
      question: "What algorithm is used in Operating Systems to avoid deadlocks by testing safe states?",
      options: ["A) Banker's Algorithm", "B) Round Robin Algorithm", "C) Dijkstra's Algorithm", "D) Peterson's Algorithm"],
      correctAnswer: "A) Banker's Algorithm",
      explanation: "Banker's Algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources.",
      topic: "Deadlock",
      difficulty: "medium",
    },
    {
      question: "In Banker's Algorithm, how is the Need matrix calculated for each process?",
      options: ["A) Need = Max - Allocation", "B) Need = Max + Allocation", "C) Need = Available - Allocation", "D) Need = Max - Available"],
      correctAnswer: "A) Need = Max - Allocation",
      explanation: "Need represents remaining resources required by each process to complete execution: Need[i][j] = Max[i][j] - Allocation[i][j].",
      topic: "Deadlock",
      difficulty: "easy",
    },
    {
      question: "If a Resource Allocation Graph contains a cycle and every resource type has strictly ONE instance, what does the cycle indicate?",
      options: ["A) A deadlock definitely exists", "B) A deadlock might occur", "C) System is completely safe", "D) Starvation is prevented"],
      correctAnswer: "A) A deadlock definitely exists",
      explanation: "When every resource has single instances, a cycle in the RAG is both necessary and sufficient for a deadlock.",
      topic: "Deadlock",
      difficulty: "medium",
    },
    {
      question: "How can Circular Wait be permanently prevented in an Operating System?",
      options: [
        "A) By allocating all resources at startup",
        "B) By imposing a global strict linear ordering on resource types",
        "C) By preempting CPU cycles",
        "D) By using virtual memory paging",
      ],
      correctAnswer: "B) By imposing a global strict linear ordering on resource types",
      explanation: "Assigning integer priorities to all resources and requiring processes to request resources only in strictly increasing order makes circular loops impossible.",
      topic: "Deadlock",
      difficulty: "hard",
    },
  ],
};

const TOPIC_DESCRIPTIVE_POOLS = {
  arrays: [
    {
      question: "Define an Array data structure. Explain how memory is allocated for 1D and 2D arrays, and state the memory address calculation formulas for Row-Major and Column-Major order.",
      marks: 5,
      answer: "An array is a linear data structure storing homogeneous elements in contiguous memory locations. For a 1D array: Loc(A[i]) = Base + (i - LB) * Size. For a 2D array of size M x N: in Row-Major order, Loc(A[i][j]) = Base + [(i - LB1) * N + (j - LB2)] * Size; in Column-Major order, Loc(A[i][j]) = Base + [(j - LB2) * M + (i - LB1)] * Size.",
      topic: "Arrays",
    },
    {
      question: "Analyze the time complexity of Search, Insertion, and Deletion operations in an Unsorted Array vs a Sorted Array. Why does an array provide O(1) random access?",
      marks: 5,
      answer: "Random access is O(1) because array elements are stored in contiguous memory addresses computed via direct offset arithmetic. Unsorted Array: Search is O(n), Insertion at end is O(1) but at arbitrary index is O(n), Deletion is O(n) due to element shifting. Sorted Array: Search is O(log n) via Binary Search, Insertion is O(n) due to shifting, Deletion is O(n) due to shifting.",
      topic: "Arrays",
    },
    {
      question: "Explain Kadane's Algorithm for the Maximum Subarray Sum problem. Detail its working principle, invariant, and time/space complexity.",
      marks: 5,
      answer: "Kadane's algorithm computes the maximum contiguous subarray sum in O(n) time and O(1) auxiliary space. At each index i, it updates max_ending_here = max(arr[i], max_ending_here + arr[i]) and max_so_far = max(max_so_far, max_ending_here). By discarding any negative running prefix, it avoids the O(n^2) overhead of checking all subarray pairs.",
      topic: "Arrays",
    },
    {
      question: "What are the key advantages and limitations of Arrays compared to Linked Lists? In which system design scenarios should an Array be preferred?",
      marks: 5,
      answer: "Advantages: O(1) random access, cache-friendly spatial locality, zero memory overhead per element (no next pointers). Limitations: Fixed size, costly O(n) insertion/deletion shifts. Prefer Arrays when collection size is known or bounded, and high-frequency read/indexed access is required (e.g., lookup tables, buffers, matrix math).",
      topic: "Arrays",
    },
    {
      question: "Describe the Two-Pointers technique on arrays. Explain how it can be used to solve the Two-Sum problem on a sorted array in O(n) time.",
      marks: 5,
      answer: "The Two-Pointers technique uses two index pointers initialized at left = 0 and right = n - 1. If arr[left] + arr[right] == target, the pair is found. If sum < target, increment left. If sum > target, decrement right. Since each step narrows the range by 1, it completes in O(n) linear time with O(1) extra space.",
      topic: "Arrays",
    },
  ],
  deadlock: [
    {
      question: "What is a Deadlock in Operating Systems? Describe the 4 Coffman conditions in detail and explain why all 4 must hold simultaneously.",
      marks: 5,
      answer: "A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process. The 4 Coffman conditions are: (1) Mutual Exclusion (non-shareable resources), (2) Hold and Wait (holding a resource while requesting another), (3) No Preemption (resources cannot be forcibly taken), and (4) Circular Wait (a closed loop of waiting processes). All 4 are necessary; breaking even one condition prevents a deadlock.",
      topic: "Deadlock",
    },
    {
      question: "Explain Banker's Algorithm for Deadlock Avoidance. Define the data structures used (Available, Max, Allocation, Need) and describe the safety algorithm.",
      marks: 5,
      answer: "Banker's Algorithm tests whether allocating requested resources leaves the system in a safe state. Data structures: Available[m], Max[n][m], Allocation[n][m], and Need[n][m] where Need[i][j] = Max[i][j] - Allocation[i][j]. The safety algorithm searches for a safe sequence <P0, P1, ..., Pn-1> where Work >= Need[i]. If found, Work += Allocation[i] and the process marks Finish[i] = true. If all processes finish, the state is safe.",
      topic: "Deadlock",
    },
  ],
};

function generateFallbackQuizQuestions(subject, topic, count = 5, difficulty = "medium") {
  const targetTopic = topic || subject || "Computer Science";
  const lower = targetTopic.toLowerCase();

  for (const [key, pool] of Object.entries(TOPIC_MCQ_POOLS)) {
    if (lower.includes(key) || key.includes(lower)) {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(pool[i % pool.length]);
      }
      return result;
    }
  }

  const basePool = [
    {
      question: `Which OSI layer handles end-to-end reliability, sequence numbers, and flow control in ${targetTopic}?`,
      options: ["A) Network Layer", "B) Transport Layer", "C) Data Link Layer", "D) Session Layer"],
      correctAnswer: "B) Transport Layer",
      explanation: "The Transport layer (Layer 4) manages end-to-end process communication, sequence numbers, and packet acknowledgments.",
      topic: targetTopic,
      difficulty,
    },
    {
      question: `What primary condition is required for a deadlock state in Operating Systems related to ${targetTopic}?`,
      options: ["A) Paging Fault", "B) Circular Wait", "C) Cache Invalidation", "D) CPU Throttling"],
      correctAnswer: "B) Circular Wait",
      explanation: "Circular wait is one of the four mandatory Coffman conditions required for a deadlock to occur.",
      topic: targetTopic,
      difficulty,
    },
    {
      question: `Which SQL normal form eliminates transitive functional dependencies in ${targetTopic}?`,
      options: ["A) 1NF", "B) 2NF", "C) 3NF", "D) BCNF"],
      correctAnswer: "C) 3NF",
      explanation: "Third Normal Form (3NF) ensures that all non-key attributes are dependent only on the primary key, eliminating transitive dependencies.",
      topic: targetTopic,
      difficulty,
    },
    {
      question: `What is the worst-case time complexity of QuickSort when a poor pivot is selected?`,
      options: ["A) O(n log n)", "B) O(n)", "C) O(n^2)", "D) O(log n)"],
      correctAnswer: "C) O(n^2)",
      explanation: "When the selected pivot is always the smallest or largest element, QuickSort degrades to O(n^2) quadratic time.",
      topic: targetTopic,
      difficulty,
    },
    {
      question: `Which algorithm is commonly used for Deadlock Avoidance in OS safety analysis?`,
      options: ["A) Round Robin", "B) Banker's Algorithm", "C) Dijkstra's Shortest Path", "D) Kruskal's Algorithm"],
      correctAnswer: "B) Banker's Algorithm",
      explanation: "Banker's algorithm checks resource request allocations to ensure the system remains in a safe state.",
      topic: targetTopic,
      difficulty,
    },
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(basePool[i % basePool.length]);
  }
  return result;
}

function generateFallbackDescriptiveQuestions(subject, topic, count = 5) {
  const targetTopic = topic || subject || "Computer Science";
  const lower = targetTopic.toLowerCase();

  for (const [key, pool] of Object.entries(TOPIC_DESCRIPTIVE_POOLS)) {
    if (lower.includes(key) || key.includes(lower)) {
      const res = [];
      for (let i = 0; i < count; i++) {
        res.push(pool[i % pool.length]);
      }
      return res;
    }
  }

  // Dynamic descriptive question generator for any topic
  return [
    {
      question: `Define ${targetTopic} in the context of ${subject || "Computer Science"}. What core theoretical principles govern its operation?`,
      marks: 5,
      answer: `${targetTopic} is a foundational concept in ${subject || "Computer Science"}. It provides structured mechanics to organize state, optimize computational efficiency, and guarantee deterministic runtime execution across system components.`,
      topic: targetTopic,
    },
    {
      question: `Explain the step-by-step working mechanism of ${targetTopic}. Illustrate with a concrete architectural or algorithmic workflow.`,
      marks: 5,
      answer: `The execution lifecycle for ${targetTopic} consists of three stages: (1) Initialization of state structures and input boundary validation, (2) Core iterative or recursive execution conforming to safety invariants, and (3) Output verification and resource deallocation.`,
      topic: targetTopic,
    },
    {
      question: `Analyze the time and space complexity trade-offs associated with ${targetTopic}. What are the primary edge-case scenarios?`,
      marks: 5,
      answer: `Operations under ${targetTopic} are evaluated against best-case, average-case, and worst-case computational bounds. Primary edge-case scenarios occur when inputs exceed boundary limits, unbalanced data structures degrade performance, or resource contention introduces latency bottlenecks.`,
      topic: targetTopic,
    },
    {
      question: `Compare ${targetTopic} with alternative approaches. What are its principal advantages and limitations in university exam evaluations?`,
      marks: 5,
      answer: `Compared to alternative methods, ${targetTopic} achieves higher modularity, predictable execution profiles, and optimized memory utilization. However, it may require careful handling of concurrency synchronization and boundary constraints.`,
      topic: targetTopic,
    },
    {
      question: `Discuss the practical industry applications of ${targetTopic} and explain how common real-world errors can be avoided.`,
      marks: 5,
      answer: `Widely implemented in systems software, high-throughput database engines, and networking stacks. Common errors such as memory leaks, off-by-one boundary bugs, and thread contention can be prevented by rigorous unit tests and invariant checks.`,
      topic: targetTopic,
    },
  ];
}


const WEAK_TOPIC_KNOWLEDGE_BASE = {
  arrays: {
    analysis:
      "You are struggling with core Array data structures and traversal mechanics. Common difficulties stem from indexing boundaries (off-by-one errors), contiguous memory address calculation, element shift overhead in insertions/deletions O(N), and optimal subarray tracking techniques.",
    recommended: [
      "Contiguous Memory Layout & Direct Offset Address Calculations",
      "Two Pointers Technique (Opposite-ends & Fast/Slow pointers)",
      "Sliding Window Technique for Continuous Subarrays",
      "Kadane's Algorithm for Maximum Subarray Sum",
      "Prefix Sums & Frequency Hashing on Arrays",
    ],
    actionable_advice:
      "Solve 5 essential array problems (Two Sum, Kadane's Max Subarray, Move Zeroes, In-place Array Reversal, Subarray Sum Equals K). Trace index pointers on paper before writing code.",
    study_time_hours: 4,
  },
  array: {
    analysis:
      "You are struggling with core Array data structures and traversal mechanics. Common difficulties stem from indexing boundaries (off-by-one errors), contiguous memory address calculation, element shift overhead in insertions/deletions O(N), and optimal subarray tracking techniques.",
    recommended: [
      "Contiguous Memory Layout & Direct Offset Address Calculations",
      "Two Pointers Technique (Opposite-ends & Fast/Slow pointers)",
      "Sliding Window Technique for Continuous Subarrays",
      "Kadane's Algorithm for Maximum Subarray Sum",
      "Prefix Sums & Frequency Hashing on Arrays",
    ],
    actionable_advice:
      "Solve 5 essential array problems (Two Sum, Kadane's Max Subarray, Move Zeroes, In-place Array Reversal, Subarray Sum Equals K). Trace index pointers on paper before writing code.",
    study_time_hours: 4,
  },
  "linked lists": {
    analysis:
      "Your errors indicate difficulties with pointer manipulation and node reference updates. Common issues include mishandling boundary conditions (empty list, single node, deleting head or tail) and losing node references during traversal or reversal.",
    recommended: [
      "Singly vs Doubly Linked List Node Structure",
      "Iterative & Recursive Linked List Reversal",
      "Floyd's Tortoise and Hare Cycle Detection Algorithm",
      "Dummy Head Technique for Safe Node Deletion",
      "Merging Two Sorted Linked Lists",
    ],
    actionable_advice:
      "Draw box-and-arrow pointer diagrams for each node operation. Practice reversing a linked list iteratively without using extra memory.",
    study_time_hours: 4,
  },
  "linked list": {
    analysis:
      "Your errors indicate difficulties with pointer manipulation and node reference updates. Common issues include mishandling boundary conditions (empty list, single node, deleting head or tail) and losing node references during traversal or reversal.",
    recommended: [
      "Singly vs Doubly Linked List Node Structure",
      "Iterative & Recursive Linked List Reversal",
      "Floyd's Tortoise and Hare Cycle Detection Algorithm",
      "Dummy Head Technique for Safe Node Deletion",
      "Merging Two Sorted Linked Lists",
    ],
    actionable_advice:
      "Draw box-and-arrow pointer diagrams for each node operation. Practice reversing a linked list iteratively without using extra memory.",
    study_time_hours: 4,
  },
  stacks: {
    analysis:
      "You struggled with LIFO (Last-In, First-Out) stack operations and expression evaluation patterns. Key areas to review include monotonic stack traversals, parentheses matching, and converting infix expressions to postfix.",
    recommended: [
      "Stack Operations (Push, Pop, Peek) with Arrays & Linked Lists",
      "Monotonic Stack for Next Greater Element",
      "Balanced Parentheses & Bracket Validation",
      "Infix to Postfix Conversion & Postfix Evaluation",
    ],
    actionable_advice:
      "Solve the 'Valid Parentheses' and 'Next Greater Element' problems using a manual stack trace.",
    study_time_hours: 3,
  },
  queues: {
    analysis:
      "Errors were found in FIFO (First-In, First-Out) queuing mechanics, specifically in handling circular queue wrapping, deque operations, and breadth-first level order traversals.",
    recommended: [
      "Circular Queue Implementation with Modulo Arithmetic",
      "Double-Ended Queue (Deque) Operations",
      "Breadth-First Search (BFS) Level-Order Processing",
      "Priority Queue with Binary Heaps",
    ],
    actionable_advice:
      "Implement a Circular Queue from scratch using fixed-size arrays and modulo indexing `(rear + 1) % capacity`.",
    study_time_hours: 3,
  },
  trees: {
    analysis:
      "You missed questions involving hierarchical tree invariants, traversal orders, and recursion. Common stumbling blocks include confusing Preorder, Inorder, and Postorder sequences, calculating tree height/diameter, and leaf node counts.",
    recommended: [
      "Recursive DFS Traversals (Inorder, Preorder, Postorder)",
      "Breadth-First Level Order Traversal with Queues",
      "Binary Tree Properties (Max nodes 2^(h+1)-1, Leaf nodes n0 = n2 + 1)",
      "Lowest Common Ancestor (LCA) in Binary Trees",
    ],
    actionable_advice:
      "Write out the recursive call stack for Inorder traversal on a 5-node binary tree to understand how backtracking works.",
    study_time_hours: 4,
  },
  tree: {
    analysis:
      "You missed questions involving hierarchical tree invariants, traversal orders, and recursion. Common stumbling blocks include confusing Preorder, Inorder, and Postorder sequences, calculating tree height/diameter, and leaf node counts.",
    recommended: [
      "Recursive DFS Traversals (Inorder, Preorder, Postorder)",
      "Breadth-First Level Order Traversal with Queues",
      "Binary Tree Properties (Max nodes 2^(h+1)-1, Leaf nodes n0 = n2 + 1)",
      "Lowest Common Ancestor (LCA) in Binary Trees",
    ],
    actionable_advice:
      "Write out the recursive call stack for Inorder traversal on a 5-node binary tree to understand how backtracking works.",
    study_time_hours: 4,
  },
  "binary search tree": {
    analysis:
      "You struggled with the Binary Search Tree (BST) ordering property (Left < Root < Right). Key areas include finding predecessor/successor, handling node deletion with two children, and maintaining balanced height.",
    recommended: [
      "BST Invariant & Inorder Traversal Property (strictly sorted output)",
      "BST Search, Insertion, and Deletion with 2 Children (Inorder Successor)",
      "Validating a BST using min/max range constraints",
      "AVL Tree Rotations (LL, RR, LR, RL) for Self-Balancing",
    ],
    actionable_advice:
      "Practice deleting a node that has two children by replacing it with its inorder successor, then re-check tree validity.",
    study_time_hours: 4,
  },
  "cpu scheduling": {
    analysis:
      "You had difficulty with OS CPU Scheduling algorithms and scheduling criteria. Key concepts to review include preemptive vs non-preemptive execution, Gantt chart construction, calculating Turnaround Time (TAT = CT - AT) and Waiting Time (WT = TAT - BT), Convoy Effect in FCFS, and the Aging technique.",
    recommended: [
      "First-Come First-Served (FCFS) & The Convoy Effect",
      "Shortest Job First (SJF) & Shortest Remaining Time First (SRTF)",
      "Round Robin Scheduling & Time Quantum Selection Trade-offs",
      "Priority Scheduling & Starvation Prevention via Aging",
    ],
    actionable_advice:
      "Draw a Gantt chart for a set of 4 processes with given arrival and burst times, and calculate average waiting time manually.",
    study_time_hours: 4,
  },
  deadlock: {
    analysis:
      "Errors were identified in deadlock conditions and avoidance strategies. You need to solidify understanding of the 4 Coffman conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait) and safe state calculations in Banker's Algorithm.",
    recommended: [
      "The 4 Coffman Conditions (Must hold simultaneously)",
      "Resource Allocation Graphs (RAG) & Cycle Detection",
      "Deadlock Prevention by eliminating Circular Wait (Linear Ordering)",
      "Banker's Algorithm: Need = Max - Allocation & Safe Sequence Calculation",
    ],
    actionable_advice:
      "Practice solving a 3-process, 3-resource Banker's algorithm table to find whether a system is in a safe state.",
    study_time_hours: 4,
  },
  "virtual memory": {
    analysis:
      "You missed questions on Virtual Memory, Paging, and Page Replacement algorithms. Review page tables, Translation Lookaside Buffer (TLB) hit ratios, page fault handling, Belady's Anomaly, and LRU replacement.",
    recommended: [
      "Paging vs Segmentation Architecture & Address Translation",
      "Translation Lookaside Buffer (TLB) & Effective Memory Access Time",
      "Page Fault Frequency & Kernel Handling Steps",
      "Page Replacement Algorithms: FIFO, Optimal (OPT), Least Recently Used (LRU)",
    ],
    actionable_advice:
      "Trace the reference string 7, 0, 1, 2, 0, 3, 0, 4, 2, 3 with 3 memory frames under FIFO and LRU to count page faults.",
    study_time_hours: 4,
  },
  sql: {
    analysis:
      "You missed questions related to SQL query execution and relational database concepts. Review the differences between INNER, LEFT, RIGHT, and FULL OUTER joins, aggregate functions with GROUP BY/HAVING, and nested subqueries.",
    recommended: [
      "SQL Joins (INNER, LEFT, RIGHT, FULL OUTER) and Venn Diagram Logic",
      "GROUP BY vs HAVING Filtering Differences",
      "Subqueries vs Correlated Subqueries",
      "Indexes & Query Execution Plans",
    ],
    actionable_advice:
      "Write SQL queries for sample customer-orders tables testing INNER JOIN vs LEFT JOIN with NULL checks.",
    study_time_hours: 3,
  },
  joins: {
    analysis:
      "You struggled with SQL Join types and how unmatched rows are processed. Understand that INNER JOIN discards non-matching rows from both sides, while LEFT OUTER JOIN retains every record from the left table and fills missing right-table columns with NULL.",
    recommended: [
      "INNER JOIN vs LEFT/RIGHT OUTER JOIN Semantics",
      "FULL OUTER JOIN Behavior & Use-Cases",
      "Cross Join (Cartesian Product) & Self Joins",
      "Join Performance Optimization & Foreign Key Indexes",
    ],
    actionable_advice:
      "Draw the Venn diagrams for all 4 primary join types and write the SQL syntax for each.",
    study_time_hours: 3,
  },
  normalization: {
    analysis:
      "Your answers show confusion regarding functional dependencies and Normal Forms (1NF, 2NF, 3NF, BCNF). Focus on identifying partial dependencies (violates 2NF) and transitive dependencies (violates 3NF).",
    recommended: [
      "Functional Dependencies & Candidate Key Identification",
      "1NF: Atomic Attribute Values",
      "2NF: No Partial Dependencies on Composite Keys",
      "3NF: No Transitive Dependencies (X → Y, Y → Z)",
      "BCNF: Every Determinant Must Be a Superkey",
    ],
    actionable_advice:
      "Take an un-normalized schema with student, course, and instructor attributes, compute candidate keys, and decompose into 3NF step-by-step.",
    study_time_hours: 4,
  },
  "osi model": {
    analysis:
      "You struggled with the 7-layer OSI hierarchy and protocol mappings. Ensure you can identify which layer handles flow control, routing, framing, data representation, and session establishment.",
    recommended: [
      "OSI 7 Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application",
      "Data Link Framing & MAC vs Network Layer IP Routing",
      "Transport Layer End-to-End Reliability (TCP vs UDP)",
      "Packet Encapsulation and Decapsulation Flow",
    ],
    actionable_advice:
      "Create a cheat sheet associating each OSI layer with its Protocol Data Unit (Bits, Frames, Packets, Segments, Data) and common protocols.",
    study_time_hours: 3,
  },
  "tcp/ip": {
    analysis:
      "You missed networking fundamentals related to TCP connection lifecycle and reliability mechanisms. Review the 3-Way Handshake (SYN, SYN-ACK, ACK), 4-Way Connection Teardown, sequence numbers, and sliding window flow control.",
    recommended: [
      "TCP 3-Way Handshake Connection Establishment",
      "TCP 4-Way Teardown & TIME-WAIT State (2MSL)",
      "Sliding Window Flow Control (rwnd) vs Congestion Window (cwnd)",
      "TCP vs UDP: Reliability, Headers, and Use-cases",
    ],
    actionable_advice:
      "Draw the sequence diagram showing client-server state transitions (CLOSED → SYN-SENT → ESTABLISHED) and flag bits.",
    study_time_hours: 4,
  },
};

/**
 * Generate Weak Topic Intelligence Feedback
 */
function generateWeakTopicIntelligence(subject, topic, score, weakTopics = [], wrongQuestions = []) {
  if (score === 100 || wrongQuestions.length === 0) {
    return `🎉 Outstanding Performance: 100% Score!
Subject Mastery: ${topic || subject}

🔍 Comprehensive Analysis:
You demonstrated flawless mastery across all tested concepts in ${topic || subject}. Every question was solved with 100% precision, indicating complete comprehension of foundational theory and problem-solving patterns.

📚 Next Recommended Challenge:
• Take advanced/hard-difficulty timed quizzes.
• Explore complex edge-case problems and past university competitive exam questions.
• Continue your revision streak to maintain peak retention!`;
  }

  const primaryWeakTopic = weakTopics[0] || topic || subject || "Core Concepts";
  const lowerTopic = primaryWeakTopic.toLowerCase();

  // Find matching knowledge base entry
  let match = null;
  for (const [key, val] of Object.entries(WEAK_TOPIC_KNOWLEDGE_BASE)) {
    if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
      match = val;
      break;
    }
  }

  if (!match) {
    // Dynamic topic fallback
    match = {
      analysis: `You experienced difficulty with ${primaryWeakTopic} in ${subject}. Analysis of your missed answers reveals conceptual gaps in primary definitions, execution steps, and edge-case validation constraints.`,
      recommended: [
        `${primaryWeakTopic} Core Theoretical Definitions & Foundational Properties`,
        `Step-by-Step Mechanisms & Working Algorithms for ${primaryWeakTopic}`,
        `Time & Space Complexity Edge Cases for ${primaryWeakTopic}`,
        `High-Yield University Exam Questions & Common Pitfalls`,
      ],
      actionable_advice: `Review the lecture notes on ${primaryWeakTopic}, trace 3 representative problem solutions step-by-step on paper, and solve 10 targeted practice questions on this topic.`,
      study_time_hours: score < 40 ? 4 : 2,
    };
  }

  // Adjust study hours based on score
  let studyHours = match.study_time_hours || 3;
  if (score <= 20) studyHours = Math.max(studyHours, 4);
  else if (score >= 70) studyHours = Math.min(studyHours, 2);

  const multipleTopicsStr = weakTopics.length > 1
    ? `\nAdditional Focus Areas: ${weakTopics.slice(1).join(", ")}`
    : "";

  return `🎯 Performance Summary: Score ${score}%
Identified Weak Area: ${primaryWeakTopic} (${subject})${multipleTopicsStr}

🔍 Detailed Analysis:
${match.analysis}

📚 Recommended Topics to Master:
${match.recommended.map((t) => `• ${t}`).join("\n")}

💡 Actionable Practice Advice:
${match.actionable_advice}

⏱️ Recommended Study Time:
${studyHours} hours this week dedicated to ${primaryWeakTopic}`;
}

module.exports = {
  generateFallbackChatResponse,
  generateFallbackExplainResponse,
  generateFallbackStudyPlan,
  generateFallbackRoadmap,
  generateFallbackQuizQuestions,
  generateFallbackDescriptiveQuestions,
  generateWeakTopicIntelligence,
};

