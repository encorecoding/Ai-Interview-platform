/**
 * Question Banks for offline/fallback mode
 * Used when AI API key is not configured
 */

const questionBanks = {
  Technical: [
    // DSA
    { question: 'What is the difference between a stack and a queue? Give examples of when you would use each.', topic: 'DSA', difficulty: 'Easy', expectedConcepts: ['LIFO', 'FIFO', 'use cases'] },
    { question: 'Explain how a HashMap works internally. What happens during a hash collision?', topic: 'DSA', difficulty: 'Medium', expectedConcepts: ['hash function', 'buckets', 'chaining', 'open addressing'] },
    { question: 'What is the time and space complexity of merge sort? Explain how it works.', topic: 'DSA', difficulty: 'Medium', expectedConcepts: ['O(n log n)', 'divide and conquer', 'stable sort'] },
    { question: 'Explain Dijkstra\'s algorithm. When would you prefer Bellman-Ford instead?', topic: 'DSA', difficulty: 'Hard', expectedConcepts: ['shortest path', 'priority queue', 'negative weights'] },
    { question: 'What is dynamic programming? Explain with the coin change problem.', topic: 'DSA', difficulty: 'Hard', expectedConcepts: ['memoization', 'tabulation', 'optimal substructure'] },
    { question: 'Explain the concept of a balanced BST. How does an AVL tree maintain balance?', topic: 'DSA', difficulty: 'Hard', expectedConcepts: ['rotation', 'balance factor', 'O(log n)'] },
    { question: 'What is the difference between BFS and DFS? When would you use each?', topic: 'DSA', difficulty: 'Easy', expectedConcepts: ['breadth-first', 'depth-first', 'queue vs stack', 'use cases'] },
    { question: 'Explain heap data structure. What is heapify?', topic: 'DSA', difficulty: 'Medium', expectedConcepts: ['max-heap', 'min-heap', 'heapify', 'priority queue'] },
    // DBMS
    { question: 'Explain the four ACID properties of database transactions.', topic: 'DBMS', difficulty: 'Medium', expectedConcepts: ['atomicity', 'consistency', 'isolation', 'durability'] },
    { question: 'What are database indexes? When should you not use an index?', topic: 'DBMS', difficulty: 'Medium', expectedConcepts: ['B-tree', 'performance', 'write overhead', 'cardinality'] },
    { question: 'Explain database normalization. What are the first three normal forms?', topic: 'DBMS', difficulty: 'Medium', expectedConcepts: ['1NF', '2NF', '3NF', 'functional dependency'] },
    { question: 'What is the difference between SQL and NoSQL databases?', topic: 'DBMS', difficulty: 'Easy', expectedConcepts: ['relational', 'schema', 'scalability', 'use cases'] },
    { question: 'Explain database transactions and how deadlock occurs. How can it be prevented?', topic: 'DBMS', difficulty: 'Hard', expectedConcepts: ['locking', 'deadlock', 'prevention strategies'] },
    // OS
    { question: 'What is virtual memory? How does paging work?', topic: 'OS', difficulty: 'Medium', expectedConcepts: ['page table', 'page fault', 'swap space', 'TLB'] },
    { question: 'Explain the difference between process and thread. What is context switching?', topic: 'OS', difficulty: 'Easy', expectedConcepts: ['shared memory', 'overhead', 'PCB'] },
    { question: 'What are the necessary conditions for deadlock? State all four.', topic: 'OS', difficulty: 'Medium', expectedConcepts: ['mutual exclusion', 'hold and wait', 'no preemption', 'circular wait'] },
    { question: 'Explain CPU scheduling algorithms: Round Robin vs Priority Scheduling.', topic: 'OS', difficulty: 'Medium', expectedConcepts: ['time quantum', 'preemption', 'starvation'] },
    // OOP
    { question: 'Explain the four pillars of OOP with examples.', topic: 'OOP', difficulty: 'Easy', expectedConcepts: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction'] },
    { question: 'What is the SOLID principle? Explain each principle briefly.', topic: 'OOP', difficulty: 'Hard', expectedConcepts: ['SRP', 'OCP', 'LSP', 'ISP', 'DIP'] },
    { question: 'Explain design patterns: Singleton, Factory, and Observer.', topic: 'OOP', difficulty: 'Hard', expectedConcepts: ['creational', 'behavioral', 'use cases'] },
    // System Design
    { question: 'Design a URL shortener service like bit.ly. Walk me through the architecture.', topic: 'System Design', difficulty: 'Hard', expectedConcepts: ['hashing', 'database', 'caching', 'scalability'] },
    { question: 'How would you design a scalable notification system?', topic: 'System Design', difficulty: 'Hard', expectedConcepts: ['message queue', 'push/pull', 'fan-out', 'delivery guarantees'] },
    { question: 'What is CAP theorem? Give an example of each combination.', topic: 'System Design', difficulty: 'Hard', expectedConcepts: ['consistency', 'availability', 'partition tolerance', 'trade-offs'] },
    // Networking
    { question: 'Explain the TCP three-way handshake.', topic: 'Networking', difficulty: 'Medium', expectedConcepts: ['SYN', 'SYN-ACK', 'ACK', 'connection establishment'] },
    { question: 'What is the difference between HTTP and HTTPS?', topic: 'Networking', difficulty: 'Easy', expectedConcepts: ['TLS', 'encryption', 'certificates'] },
  ],
  HR: [
    { question: 'Tell me about yourself and your journey into software engineering.', topic: 'Introduction', difficulty: 'Easy' },
    { question: 'What are your greatest strengths as a developer?', topic: 'Strengths', difficulty: 'Easy' },
    { question: 'What is your biggest weakness and what are you doing to improve it?', topic: 'Weaknesses', difficulty: 'Medium' },
    { question: 'Where do you see yourself in 5 years?', topic: 'Career Goals', difficulty: 'Easy' },
    { question: 'Describe a challenging project you worked on. What made it challenging and how did you overcome it?', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'Tell me about a time you had a conflict with a team member. How did you resolve it?', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'Describe a time you had to learn a new technology quickly. How did you approach it?', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'You have a critical bug in production. Walk me through how you would handle it.', topic: 'Situational', difficulty: 'Medium' },
    { question: 'If you had to choose between delivering a feature on time with tech debt or delaying for clean code, what would you do?', topic: 'Situational', difficulty: 'Hard' },
  ],
  Mixed: [
    { question: 'Tell me about yourself and your most significant technical achievement.', topic: 'Introduction', difficulty: 'Easy' },
    { question: 'Explain the difference between REST and GraphQL. When would you choose one over the other?', topic: 'Technical', difficulty: 'Medium' },
    { question: 'Describe a time you had to learn a new technology quickly under pressure.', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'What is the time complexity of quicksort in the worst case, and how can it be mitigated?', topic: 'DSA', difficulty: 'Medium' },
    { question: 'How do you ensure code quality in a team environment?', topic: 'Behavioral', difficulty: 'Medium' },
    { question: 'Design a notification system that can handle millions of users.', topic: 'System Design', difficulty: 'Hard' },
    { question: 'Where do you want to be in your career in 3 years?', topic: 'Career Goals', difficulty: 'Easy' },
    { question: 'Explain the difference between SQL and NoSQL. When would you use each?', topic: 'DBMS', difficulty: 'Medium' },
  ],
};

module.exports = questionBanks;
