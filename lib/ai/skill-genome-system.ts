/**
 * SKILL GENOME SYSTEM
 * 
 * Interactive Skill Network Graph Intelligence Engine
 * - Extracts skills from roadmap deterministically
 * - Builds skill relationship graph
 * - Uses Groq AI for intelligent explanations
 * - Powers interactive visualization
 */

import Groq from 'groq-sdk'

// ═══════════════════════════════════════════════════════════════════
// 🧬 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export interface SkillNode {
  id: string
  name: string
  category: 'core' | 'support' | 'advanced' | 'optional'
  progress: number // 0-100
  importance: number // 1-5
  frequency: number // How many modules use this skill
  color: string
  description?: string
  importance_reason?: string
  relative_to_role?: string
  learning_resources?: string[]
  quick_tips?: string[] // Quick practical tips for this skill
}

export interface SkillEdge {
  source: string
  target: string
  type: 'dependency' | 'related' | 'complementary'
  strength: number // 0-1
}

export interface SkillGraph {
  nodes: SkillNode[]
  edges: SkillEdge[]
  role: string
  totalProgress: number
  coreSkillsProgress: number
  skillPercentages?: Record<string, number> // Maps skill name to importance percentage
}

export interface RoadmapModule {
  id: string
  title: string
  skills: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  completed?: boolean
  completionPercentage?: number
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 HARDCODED SKILL DESCRIPTIONS DATABASE (FALLBACK SYSTEM)
// Used when API is rate-limited or unavailable
// ═══════════════════════════════════════════════════════════════════

const SKILL_DESCRIPTIONS: Record<string, {
  relative_to_role: string
  importance_reason: string
  learning_resources: string[]
}> = {
  'HTML5': {
    relative_to_role: 'Fundamental markup language for building web structures and semantic content',
    importance_reason: 'Used in every web page to define content structure, accessibility, and SEO',
    learning_resources: ['MDN HTML Guide', 'HTML Living Standard', 'Web.dev HTML Basics'],
  },
  'CSS3': {
    relative_to_role: 'Modern styling language for creating responsive, visually appealing interfaces',
    importance_reason: 'Controls layout, colors, animations, and responsive behavior across all UI components',
    learning_resources: ['MDN CSS Reference', 'CSS-Tricks', 'Frontend Masters CSS Course'],
  },
  'JavaScript (ES6+)': {
    relative_to_role: 'Modern JavaScript bringing powerful language features and better code organization',
    importance_reason: 'Enables interactivity, state management, and object-oriented programming in applications',
    learning_resources: ['JavaScript.info', 'Eloquent JavaScript', 'Front-End Masters JS Course'],
  },
  'React': {
    relative_to_role: 'Industry-leading component library for building modern, interactive user interfaces',
    importance_reason: 'Used to structure UI components, manage state, and enable fast rendering with virtual DOM',
    learning_resources: ['React Official Docs', 'React Deep Dive', 'Epic React Course'],
  },
  'Node.js': {
    relative_to_role: 'JavaScript runtime for building scalable server-side applications and APIs',
    importance_reason: 'Enables JavaScript development outside the browser, powers most modern backend services',
    learning_resources: ['Node.js Official Guide', 'The Node Handbook', 'Node.js Design Patterns'],
  },
  'TypeScript': {
    relative_to_role: 'Superset of JavaScript adding static typing for better code quality and maintainability',
    importance_reason: 'Catches type errors at compile-time, improves IDE support, and reduces runtime bugs',
    learning_resources: ['TypeScript Official Docs', 'TypeScript Deep Dive', 'Effective TypeScript'],
  },
  'Python': {
    relative_to_role: 'Versatile, readable language essential for data science, ML, and automation',
    importance_reason: 'Powers data analysis libraries, ML frameworks, and is standard in AI/ML workflows',
    learning_resources: ['Python Official Docs', 'Automate the Boring Stuff', 'Real Python Tutorials'],
  },
  'SQL': {
    relative_to_role: 'Standard language for querying and managing relational databases',
    importance_reason: 'Required to extract, transform, and analyze data from databases in production systems',
    learning_resources: ['SQL Tutorial by W3Schools', 'Mode Analytics SQL Tutorial', 'LeetCode SQL Problems'],
  },
  'REST APIs': {
    relative_to_role: 'Architectural style for building scalable, stateless web services and data endpoints',
    importance_reason: 'Standard for client-server communication, enables frontend-backend integration',
    learning_resources: ['REST API Best Practices', 'RESTful API Design Rulebook', 'HTTP Protocol Guide'],
  },
  'Docker': {
    relative_to_role: 'Containerization platform for packaging applications with dependencies for consistency',
    importance_reason: 'Ensures applications run identically across development, testing, and production environments',
    learning_resources: ['Docker Official Docs', 'Docker for Developers', 'Play with Docker'],
  },
  'Kubernetes': {
    relative_to_role: 'Orchestration platform for automating deployment, scaling, and management of containers',
    importance_reason: 'Handles container orchestration at scale, enabling auto-scaling and high availability',
    learning_resources: ['Kubernetes Official Docs', 'Kubernetes in Action', 'Kubernetes by Google'],
  },
  'Git': {
    relative_to_role: 'Version control system for tracking code changes and enabling team collaboration',
    importance_reason: 'Essential for collaboration, code review, and maintaining code history in teams',
    learning_resources: ['Git Official Documentation', 'Git Branching Model', 'Learning Git Branching Game'],
  },
  'System Design': {
    relative_to_role: 'Art of designing scalable, reliable, and maintainable large-scale systems',
    importance_reason: 'Critical for architecting systems that handle millions of users and massive data volumes',
    learning_resources: ['Designing Data-Intensive Applications', 'System Design Interview', 'High Scalability Blog'],
  },
  'Machine Learning Algorithms': {
    relative_to_role: 'Core techniques for training models to learn patterns from data and make predictions',
    importance_reason: 'Foundation for building intelligent systems that improve with more data',
    learning_resources: ['Introduction to Statistical Learning', 'Machine Learning by Andrew Ng', 'Kaggle ML Courses'],
  },
  'Deep Learning': {
    relative_to_role: 'Advanced ML using neural networks with multiple layers for complex pattern recognition',
    importance_reason: 'Powers modern AI applications in computer vision, NLP, and recommendation systems',
    learning_resources: ['Deep Learning Book', 'Fast.ai Courses', 'Andrew Ng Deep Learning Specialization'],
  },
  'React Native / Flutter': {
    relative_to_role: 'Cross-platform frameworks for building iOS and Android apps from single codebase',
    importance_reason: 'Enables code sharing between iOS and Android, reducing development time and cost',
    learning_resources: ['React Native Official Docs', 'Flutter Codelabs', 'Udacity Mobile Nanodegree'],
  },
  'Component Architecture': {
    relative_to_role: 'Design pattern for building reusable, modular UI components with clear interfaces',
    importance_reason: 'Improves code maintainability, enables component reuse, and simplifies testing',
    learning_resources: ['React Design Patterns', 'Atomic Design Methodology', 'Component-Driven Development'],
  },
  'State Management (Redux/Context)': {
    relative_to_role: 'Patterns for managing application state centrally and predictably',
    importance_reason: 'Prevents state inconsistency, enables time-travel debugging, and simplifies data flow',
    learning_resources: ['Redux Official Docs', 'Getting Started with Redux', 'Redux Fundamentals Course'],
  },
  'Performance Optimization': {
    relative_to_role: 'Techniques for analyzing and improving application speed and responsiveness',
    importance_reason: 'Improves user experience, SEO rankings, and reduces server costs',
    learning_resources: ['Web Performance Working Group', 'High Performance JavaScript', 'Chrome DevTools Performance'],
  },
  'Testing (Unit & Integration)': {
    relative_to_role: 'Practice of writing automated tests to verify code behavior and catch bugs',
    importance_reason: 'Increases code reliability, enables refactoring safely, and accelerates development',
    learning_resources: ['Testing Library Docs', 'Jest Official Guide', 'Test Driven Development'],
  },
  'Accessibility (WCAG)': {
    relative_to_role: 'Standards for making applications usable for people with disabilities',
    importance_reason: 'Legal requirement, expands user base, and improves usability for all users',
    learning_resources: ['WCAG Guidelines', 'Web Accessibility by Google', 'Inclusive Components'],
  },
  'Cloud Platforms (AWS/GCP/Azure)': {
    relative_to_role: 'Major cloud providers offering compute, storage, and networking services at scale',
    importance_reason: 'Enables deployment to global infrastructure without managing physical servers',
    learning_resources: ['AWS Certified Solutions Architect', 'Google Cloud Certified Associate', 'Azure Fundamentals'],
  },
  'CI/CD Pipelines': {
    relative_to_role: 'Automated workflows for testing and deploying code changes to production',
    importance_reason: 'Accelerates release cycles, catches bugs early, and enables automated deployments',
    learning_resources: ['GitHub Actions Guide', 'GitLab CI/CD Docs', 'Jenkins Pipeline Documentation'],
  },
  'Database Design': {
    relative_to_role: 'Art of structuring data for efficient storage, retrieval, and querying',
    importance_reason: 'Directly impacts application performance, scalability, and data integrity',
    learning_resources: ['Database Design for Mere Mortals', 'Normalizing Database Design', 'Visual Database Design'],
  },
  'Microservices': {
    relative_to_role: 'Architecture pattern with independent, loosely-coupled services communicating via APIs',
    importance_reason: 'Enables teams to deploy independently, scale services individually, and isolate failures',
    learning_resources: ['Building Microservices (Newman)', 'Microservices Architecture Guide', 'AWS Microservices'],
  },
  'Security': {
    relative_to_role: 'Practices for protecting applications from attacks and unauthorized data access',
    importance_reason: 'Critical for protecting user data, maintaining trust, and complying with regulations',
    learning_resources: ['OWASP Top 10', 'Security Engineering (Anderson)', 'Security Headers'],
  },
  'DevOps': {
    relative_to_role: 'Practice of combining development and operations for faster CI/CD workflows',
    importance_reason: 'Improves collaboration between teams, accelerates deployments, and reduces outages',
    learning_resources: ['The Phoenix Project', 'DevOps Handbook', 'Linux Academy DevOps Course'],
  },
  'Linux/Unix': {
    relative_to_role: 'Operating system fundamental for servers, infrastructure, and development environments',
    importance_reason: 'Powers 96%+ of servers, essential for system administration and development',
    learning_resources: ['Linux Command Line Basics', 'UNIX and Linux System Administration', 'Linux Academy'],
  },
  'Networking': {
    relative_to_role: 'Foundation of how computers communicate via protocols, IP addresses, and routing',
    importance_reason: 'Required for understanding infrastructure, debugging connectivity issues, and system design',
    learning_resources: ['Computer Networking (Kurose/Ross)', 'Networking Essentials', 'CompTIA Network+'],
  },
  'Statistics & Probability': {
    relative_to_role: 'Mathematical foundation for data analysis, hypothesis testing, and statistical inference',
    importance_reason: 'Essential for interpreting data, building ML models, and A/B testing',
    learning_resources: ['Statistical Rethinking', 'Introduction to Statistical Learning', 'Bayesian Methods'],
  },
  'Data Visualization': {
    relative_to_role: 'Techniques for presenting data through charts, graphs, and interactive visualizations',
    importance_reason: 'Makes data insights accessible, aids decision-making, and communicates findings',
    learning_resources: ['D3.js Documentation', 'Storytelling with Data', 'Observable Notebooks'],
  },
  'Problem Solving': {
    relative_to_role: 'Foundational ability to break down complex problems and design solutions systematically',
    importance_reason: 'Core competency for all engineering roles, enables tackling novel challenges',
    learning_resources: ['How to Solve It (Polya)', 'Cracking the Coding Interview', 'LeetCode Problems'],
  },
  'Communication': {
    relative_to_role: 'Essential skill for explaining technical concepts, collaborating, and leading teams',
    importance_reason: 'Directly impacts team effectiveness, code review quality, and career progression',
    learning_resources: ['Crucial Conversations', 'Nonviolent Communication', 'Technical Writing Courses'],
  },
  'Teamwork': {
    relative_to_role: 'Ability to collaborate effectively, give feedback, and contribute to team success',
    importance_reason: 'Required for distributed teams, code reviews, and cross-functional projects',
    learning_resources: ['The 5 Dysfunctions of a Team', 'Extreme Programming Explained', 'Emotional Intelligence'],
  },
  'Leadership': {
    relative_to_role: 'Ability to inspire, guide, and empower others toward achieving common goals',
    importance_reason: 'Critical for tech leads, managers, and influencing technical decisions',
    learning_resources: ['The Effective Engineer', 'Management 3.0', 'Radical Candor'],
  },
  'Code Review': {
    relative_to_role: 'Process of systematically examining code changes for quality, style, and correctness',
    importance_reason: 'Improves code quality, spreads knowledge, and prevents bugs from reaching production',
    learning_resources: ['Code Review Best Practices', 'Thoughtful Code Review', 'GitHub Code Review Guides'],
  },
}

// ═══════════════════════════════════════════════════════════════════
// 🔐 COMPREHENSIVE ROLE TECH STACKS (ALL ~40 TECH JOB ROLES)
// ═══════════════════════════════════════════════════════════════════

interface RoleTechStack {
  core: string[]        // ~6-8 core technical skills
  support: string[]     // ~6-8 supporting skills
  advanced: string[]    // ~5-7 advanced specialized skills
  optional: string[]    // ~3-5 emerging/optional skills
}

const ROLE_TECH_STACKS: Record<string, RoleTechStack> = {
  // ══════════════════════════════════════════════════════════════════
  // FRONTEND & WEB
  // ══════════════════════════════════════════════════════════════════
  
  'frontend-software-engineer': {
    core: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'React', 'Component Architecture', 'JSX'],
    support: ['TypeScript', 'REST APIs', 'Git', 'Responsive Design', 'Browser DevTools', 'DOM Manipulation'],
    advanced: ['State Management (Redux/Context)', 'Performance Optimization', 'Unit Testing', 'Accessibility (A11y)', 'Web Performance', 'Code Splitting'],
    optional: ['Next.js', 'GraphQL', 'Web Animations', 'PWA Development', 'Micro Frontends'],
  },

  'full-stack-software-engineer': {
    core: ['JavaScript (ES6+)', 'React', 'Node.js', 'REST APIs', 'Database Design', 'HTML5'],
    support: ['TypeScript', 'Server Architecture', 'Authentication', 'Git', 'SQL/NoSQL', 'State Management'],
    advanced: ['System Design', 'Performance Optimization', 'Testing (Unit & Integration)', 'DevOps', 'Security', 'Microservices'],
    optional: ['Next.js', 'GraphQL', 'Docker', 'Cloud Platforms', 'Mobile Development'],
  },

  'backend-software-engineer': {
    core: ['Node.js', 'Server Architecture', 'REST API Design', 'Database Design', 'SQL', 'Authentication'],
    support: ['Express.js', 'NoSQL', 'Error Handling', 'Git', 'HTTP/HTTPS', 'Middleware Patterns'],
    advanced: ['Microservices', 'Caching', 'Message Queues', 'System Design', 'DB Optimization', 'CI/CD'],
    optional: ['Docker', 'Kubernetes', 'GraphQL', 'gRPC', 'Service Mesh'],
  },

  'devops-engineer': {
    core: ['Linux/Unix', 'Shell Scripting', 'Docker', 'CI/CD Pipelines', 'Kubernetes', 'Cloud Platforms (AWS/GCP/Azure)'],
    support: ['Infrastructure as Code (Terraform)', 'Monitoring & Logging', 'Git', 'Networking', 'System Administration'],
    advanced: ['Security & Compliance', 'Performance Tuning', 'Multi-cloud Architecture', 'GitOps', 'Container Orchestration'],
    optional: ['Ansible/Puppet', 'Service Mesh', 'Disaster Recovery', 'Cost Optimization'],
  },

  'database-engineer': {
    core: ['SQL', 'Database Design', 'Query Optimization', 'Indexing', 'Transactions', 'Data Modeling'],
    support: ['NoSQL Databases', 'Replication & Sharding', 'Backup & Recovery', 'Monitoring', 'Performance Analysis'],
    advanced: ['Advanced Optimization', 'Distributed Databases', 'Data Security', 'Cluster Management', 'Capacity Planning'],
    optional: ['Machine Learning Pipelines', 'Stream Processing', 'Graph DBs', 'Blockchain'],
  },

  'mobile-software-engineer': {
    core: ['React Native / Flutter', 'JavaScript/Kotlin/Swift', 'Mobile Architecture', 'REST APIs', 'State Management'],
    support: ['Git', 'Testing (Unit & UI)', 'Performance Optimization', 'Debugging Tools', 'Version Control'],
    advanced: ['Native Development', 'Networking', 'Security & Encryption', 'App Deployment', 'Background Services'],
    optional: ['CrossPlatform Frameworks', 'WebSockets', 'Push Notifications', 'AR/VR'],
  },

  'web-developer': {
    core: ['HTML5', 'CSS3', 'JavaScript', 'Web Design Basics', 'Responsive Web Design'],
    support: ['jQuery/Vanilla JS', 'Version Control', 'HTTP/HTTPS', 'SEO Basics', 'Accessibility'],
    advanced: ['Performance Optimization', 'Testing', 'Security (HTTPS, CSRF)', 'Web Standards', 'Progressive Enhancement'],
    optional: ['Vue.js', 'Angular', 'Static Site Generators', 'Web Components'],
  },

  'ux-developer': {
    core: ['HTML5', 'CSS3', 'JavaScript', 'User Interaction Design', 'Responsive Design'],
    support: ['Accessibility (WCAG)', 'Testing (User Research)', 'Design Tools', 'Animation', 'Performance'],
    advanced: ['Advanced CSS (Flexbox, Grid)', 'Micro-interactions', 'Usability Testing', 'Design Systems', 'Motion Design'],
    optional: ['WebGL', 'Canvas', 'Three.js', 'Gesture Handling'],
  },

  // ══════════════════════════════════════════════════════════════════
  // DATA & AI/ML
  // ══════════════════════════════════════════════════════════════════

  'data-scientist': {
    core: ['Python', 'Statistics & Probability', 'Machine Learning', 'Data Visualization', 'SQL', 'Pandas/NumPy'],
    support: ['Python Libraries (scikit-learn, TensorFlow)', 'Exploratory Data Analysis', 'Data Cleaning', 'Feature Engineering', 'Git'],
    advanced: ['Deep Learning', 'Model Evaluation & Tuning', 'Big Data Processing', 'Statistical Testing', 'A/B Testing'],
    optional: ['NLP', 'Computer Vision', 'Recommender Systems', 'Time Series Analysis'],
  },

  'machine-learning-engineer': {
    core: ['Python', 'Machine Learning Algorithms', 'Deep Learning', 'TensorFlow/PyTorch', 'SQL', 'Model Deployment'],
    support: ['Data Processing', 'Feature Engineering', 'Experiment Tracking', 'Git', 'Statistical Analysis'],
    advanced: ['Advanced DL Architectures', 'Production ML', 'Distributed Training', 'Model Optimization', 'MLOps'],
    optional: ['NLP', 'Computer Vision', 'Reinforcement Learning', 'Generative Models'],
  },

  'data-engineer': {
    core: ['SQL', 'Python/Scala', 'ETL/ELT Processes', 'Data Warehousing', 'Big Data Frameworks', 'Distributed Systems'],
    support: ['Spark', 'Hadoop', 'Airflow/Workflow Orchestration', 'Git', 'Data Modeling'],
    advanced: ['Streaming Data', 'Real-time Processing', 'Data Security', 'Performance Tuning', 'Cloud Data Platforms'],
    optional: ['Graph Databases', 'NoSQL Design', 'Machine Learning Pipelines', 'Blockchain'],
  },

  'ai-engineer': {
    core: ['Machine Learning', 'Deep Learning', 'Python', 'Neural Networks', 'Model Architecture', 'TensorFlow/PyTorch'],
    support: ['Natural Language Processing', 'Computer Vision', 'Algorithm Development', 'Mathematical Foundations'],
    advanced: ['Advanced ML Systems', 'AI Ethics', 'Production AI', 'Distributed AI', 'AI Security'],
    optional: ['Reinforcement Learning', 'Generative Models', 'NLP Transformers', 'Multimodal Models'],
  },

  // ══════════════════════════════════════════════════════════════════
  // CLOUD & INFRASTRUCTURE
  // ══════════════════════════════════════════════════════════════════

  'cloud-architect': {
    core: ['Cloud Platforms (AWS/GCP/Azure)', 'System Architecture', 'Networking', 'Security', 'Scalability Design', 'Cost Optimization'],
    support: ['Infrastructure Design', 'Database Architecture', 'CI/CD', 'Monitoring & Logging', 'Disaster Recovery'],
    advanced: ['Multi-cloud Strategies', 'Compliance & Governance', 'Performance Optimization', 'Migration Planning', 'High Availability'],
    optional: ['Kubernetes', 'Serverless Architecture', 'Edge Computing', 'Quantum Cloud'],
  },

  'cloud-engineer': {
    core: ['AWS/GCP/Azure', 'Cloud Services', 'Networking', 'Security', 'Infrastructure Management', 'Monitoring'],
    support: ['Infrastructure as Code', 'Databases', 'Automation', 'Troubleshooting', 'Cost Management'],
    advanced: ['Advanced Networking', 'Security Implementation', 'Performance Tuning', 'Disaster Recovery', 'Multi-cloud'],
    optional: ['Kubernetes', 'Serverless', 'Edge Services', 'Advanced Security'],
  },

  'site-reliability-engineer': {
    core: ['Linux/Unix', 'Monitoring & Observability', 'Incident Response', 'System Architecture', 'Scripting', 'Cloud Platforms'],
    support: ['CI/CD', 'Infrastructure as Code', 'Networking', 'Database Administration', 'Security'],
    advanced: ['Advanced Troubleshooting', 'Performance Optimization', 'Capacity Planning', 'Disaster Recovery', 'Automation'],
    optional: ['Kubernetes', 'Service Mesh', 'Chaos Engineering', 'Cost Optimization'],
  },

  'systems-engineer': {
    core: ['Linux/Windows Administration', 'Networking', 'System Architecture', 'Security', 'Storage Systems', 'Virtualization'],
    support: ['Scripting (Bash, PowerShell)', 'Monitoring', 'Backup & Recovery', 'Troubleshooting', 'Documentation'],
    advanced: ['Advanced Networking', 'High Availability', 'Security Hardening', 'Performance Tuning', 'Capacity Planning'],
    optional: ['Cloud Integration', 'Kubernetes', 'Automation', 'Disaster Recovery'],
  },

  // ══════════════════════════════════════════════════════════════════
  // SECURITY & QUALITY
  // ══════════════════════════════════════════════════════════════════

  'security-engineer': {
    core: ['Network Security', 'Cryptography', 'Vulnerability Assessment', 'Secure Coding', 'Authentication/Authorization', 'Penetration Testing'],
    support: ['Compliance & Governance', 'Security Tools', 'Log Analysis', 'Incident Response', 'Threat Modeling'],
    advanced: ['Advanced Threat Analysis', 'Security Architecture', 'Cloud Security', 'Security Automation', 'Zero Trust'],
    optional: ['Biometric Security', 'Blockchain Security', 'Quantum Cryptography', 'AI Security'],
  },

  'qa-automation-engineer': {
    core: ['Automated Testing', 'Test Frameworks', 'Java/Python/JavaScript', 'API Testing', 'Debugging', 'Git'],
    support: ['CI/CD', 'Test Design Patterns', 'Performance Testing', 'Security Testing', 'Selenium/TestNG'],
    advanced: ['Advanced Automation Strategies', 'Mobile Testing', 'Visual Testing', 'Performance Analysis', 'Test Optimization'],
    optional: ['AI-driven Testing', 'Load Testing', 'Accessibility Testing', 'Contract Testing'],
  },

  'qa-engineer': {
    core: ['Test Planning & Design', 'Manual Testing', 'Bug Tracking', 'Quality Assurance', 'User Acceptance Testing'],
    support: ['Domain Knowledge', 'Automation Basics', 'Documentation', 'Communication', 'Risk Analysis'],
    advanced: ['Test Strategy', 'Quality Metrics', 'Process Improvement', 'Performance Testing', 'Security Testing'],
    optional: ['Automation', 'Mobile Testing', 'Accessibility', 'Compliance Testing'],
  },

  // ══════════════════════════════════════════════════════════════════
  // ARCHITECTURE & DESIGN
  // ══════════════════════════════════════════════════════════════════

  'software-architect': {
    core: ['System Design', 'Architectural Patterns', 'Scalability', 'Technology Selection', 'Design Principles', 'Domain-Driven Design'],
    support: ['Distributed Systems', 'Microservices', 'API Design', 'Database Design', 'Security Principles'],
    advanced: ['Enterprise Architecture', 'Performance Architecture', 'Resilience Patterns', 'Event-Driven Design', 'Cloud Architecture'],
    optional: ['Kubernetes Architecture', 'Serverless Design', 'GraphQL Architecture', 'DDD Implementation'],
  },

  'solutions-architect': {
    core: ['Business Analysis', 'System Architecture', 'Technology Solutions', 'Client Communication', 'Requirements Analysis'],
    support: ['Cloud Platforms', 'Integration Design', 'Cost Analysis', 'RFP Response', 'Documentation'],
    advanced: ['Enterprise Solutions', 'Complex Integrations', 'Risk Management', 'Vendor Management', 'Strategic Planning'],
    optional: ['Implementation Oversight', 'Change Management', 'Training Design', 'Optimization'],
  },

  // ══════════════════════════════════════════════════════════════════
  // SPECIALIZED ROLES
  // ══════════════════════════════════════════════════════════════════

  'blockchain-engineer': {
    core: ['Solidity/Smart Contracts', 'Blockchain Architecture', 'Cryptography', 'EVM', 'Web3.js', 'DeFi Concepts'],
    support: ['Ethereum/Other Blockchains', 'Gas Optimization', 'Testing Smart Contracts', 'Security Auditing'],
    advanced: ['Advanced Smart Contract Patterns', 'Protocol Development', 'Consensus Mechanisms', 'Scaling Solutions', 'ZK Proofs'],
    optional: ['NFT Development', 'DAO Design', 'Cross-chain Bridges', 'Layer 2 Solutions'],
  },

  'embedded-systems-engineer': {
    core: ['C/C++', 'Microcontrollers', 'Hardware Interfacing', 'Real-time Systems', 'Assembly', 'Embedded Linux'],
    support: ['FPGAs', 'Device Drivers', 'Debugging Embedded Systems', 'Power Management'],
    advanced: ['Advanced Hardware Design', 'IoT Integration', 'Security in Embedded Systems', 'Optimization', 'Real-time OS'],
    optional: ['Robotics', 'RTOS', 'Wireless Protocols', 'Edge Computing'],
  },

  'iot-engineer': {
    core: ['IoT Protocols (MQTT, CoAP)', 'Embedded Systems', 'Wireless Communication', 'Sensor Integration', 'Edge Computing'],
    support: ['Cloud Integration', 'Device Management', 'Security', 'Networking', 'Hardware Selection'],
    advanced: ['Advanced IoT Architectures', 'Scalable Systems', 'Real-time Data Processing', '5G Integration', 'Edge Analytics'],
    optional: ['AI at the Edge', 'Robotics', 'Industrial IoT', 'Smart Home Integration'],
  },

  'game-developer': {
    core: ['Game Engines (Unity/Unreal)', 'C#/C++', '3D Graphics', 'Game Architecture', 'Physics', 'Animation'],
    support: ['Audio Systems', 'AI (Game)', 'Networking (Multiplayer)', 'Performance Optimization', 'Version Control'],
    advanced: ['Advanced Graphics (Shaders)', 'Procedural Generation', 'Game Optimization', 'Advanced Networking', 'Tools Development'],
    optional: ['VR/AR Development', 'Cross-platform Development', 'Live Service Systems', 'Monetization Systems'],
  },

  'vr-ar-engineer': {
    core: ['VR/AR Development', 'Game Engines', '3D Modeling', 'Spatial Computing', 'User Interaction Design', 'Graphics'],
    support: ['Physics Simulation', 'Audio Design', 'Performance Optimization', 'Hardware Integration'],
    advanced: ['Advanced VR/AR Techniques', 'Spatial Tracking', 'Hand Gesture Recognition', 'Haptic Feedback', 'Multi-user Experiences'],
    optional: ['AI for VR', 'Advanced Graphics', 'Real-time Rendering', 'Social VR'],
  },

  'computer-vision-engineer': {
    core: ['Image Processing', 'CNN Architectures', 'Object Detection', 'Python', 'OpenCV', 'Deep Learning'],
    support: ['Video Processing', 'Feature Extraction', 'Neural Networks', 'TensorFlow/PyTorch', 'CUDA'],
    advanced: ['Advanced CV Models', '3D Vision', 'Real-time Processing', 'Edge Deployment', 'Domain Adaptation'],
    optional: ['NLP + Vision', 'Action Recognition', 'Medical Imaging', 'Autonomous Systems'],
  },

  'nlp-engineer': {
    core: ['NLP Fundamentals', 'Transformers (BERT, GPT)', 'Text Processing', 'Python', 'PyTorch/TensorFlow', 'Language Models'],
    support: ['Tokenization & Encoding', 'Word Embeddings', 'Sequence-to-Sequence Models', 'Evaluation Metrics'],
    advanced: ['Advanced LLMs', 'Fine-tuning Strategies', 'Prompt Engineering', 'Multimodal NLP', 'Efficient Inference'],
    optional: ['Reinforcement Learning (NLP)', 'Language Generation', 'Dialogue Systems', 'Knowledge Graphs'],
  },

  // ══════════════════════════════════════════════════════════════════
  // LEADERSHIP & MANAGEMENT
  // ══════════════════════════════════════════════════════════════════

  'technical-leader': {
    core: ['System Design', 'Team Leadership', 'Technical Strategy', 'Architecture', 'Mentoring', 'Code Review'],
    support: ['Communication', 'Stakeholder Management', 'Project Planning', 'Problem Solving', 'Technology Selection'],
    advanced: ['Organizational Strategy', 'Culture Building', 'High-performance Teams', 'Technical Vision', 'Cross-functional Leadership'],
    optional: ['Executive Communication', 'Change Management', 'Scaling Organizations', 'Innovation Strategy'],
  },

  'engineering-manager': {
    core: ['Team Management', 'Technical Understanding', 'Leadership', 'Communication', 'Problem Solving', 'Hiring'],
    support: ['Project Management', 'Performance Management', 'Conflict Resolution', 'Budgeting', 'Strategic Planning'],
    advanced: ['Organizational Leadership', 'Change Management', 'Talent Development', 'Strategic Vision', 'Cross-team Coordination'],
    optional: ['Executive Leadership', 'Scaling Teams', 'Innovation Culture', 'Board Management'],
  },

  'product-engineer': {
    core: ['Software Development', 'Product Thinking', 'User Research', 'Analytics', 'Prototyping', 'Problem Solving'],
    support: ['UI/UX Basics', 'Database Design', 'APIs', 'Testing', 'Agile Methodologies'],
    advanced: ['Product Strategy', 'A/B Testing', 'Metrics & Analytics', 'Scalability', 'Cross-functional Collaboration'],
    optional: ['Machine Learning', 'Business Analysis', 'Growth Strategy', 'Monetization'],
  },

  // ══════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE & OPERATIONS
  // ══════════════════════════════════════════════════════════════════

  'infrastructure-engineer': {
    core: ['Infrastructure Design', 'Networking', 'Virtualization', 'Cloud Services', 'Storage', 'Scripting'],
    support: ['Automation', 'Monitoring', 'Security', 'Capacity Planning', 'Documentation'],
    advanced: ['Advanced Network Design', 'Disaster Recovery', 'Performance Optimization', 'Multi-datacenter', 'High Availability'],
    optional: ['Kubernetes', 'Infrastructure as Code', 'Service Mesh', 'Cost Optimization'],
  },

  'network-engineer': {
    core: ['Networking Fundamentals', 'TCP/IP', 'Routing & Switching', 'Network Security', 'Network Design', 'VPNs'],
    support: ['Firewalls', 'Load Balancing', 'WAN', 'Network Monitoring', 'Troubleshooting'],
    advanced: ['Advanced Security', 'SDN', 'Network Automation', 'Performance Optimization', 'Multi-cloud Networking'],
    optional: ['5G Networks', 'BGP Routing', 'Network Slicing', 'Zero Trust Networks'],
  },

  'database-administrator': {
    core: ['Database Administration', 'SQL', 'Backup & Recovery', 'Performance Tuning', 'Security', 'Replication'],
    support: ['Monitoring', 'Troubleshooting', 'Capacity Planning', 'Documentation', 'User Management'],
    advanced: ['Advanced Optimization', 'High Availability', 'Disaster Recovery', 'Security Hardening', 'Cloud Databases'],
    optional: ['Sharding/Partitioning', 'NoSQL Admin', 'Data Warehousing', 'Compliance'],
  },

  // ══════════════════════════════════════════════════════════════════
  // ADDITIONAL SPECIALIZED ROLES
  // ══════════════════════════════════════════════════════════════════

  'graphics-engineer': {
    core: ['3D Graphics', 'Graphics APIs (OpenGL, DirectX)', 'GLSL/HLSL', 'Rendering Algorithms', 'C++'],
    support: ['Linear Algebra', 'Physics Simulation', 'Optimization', 'Performance Analysis'],
    advanced: ['Advanced Rendering Techniques', 'Ray Tracing', 'Shaders', 'GPU Optimization', 'Real-time Rendering'],
    optional: ['Path Tracing', 'Procedural Generation', 'VR Graphics', 'Post-processing Effects'],
  },

  'audio-engineer': {
    core: ['Audio Processing', 'Digital Signal Processing', 'Audio APIs', 'Audio Formats', 'Acoustics'],
    support: ['Sound Design', 'Mixing', 'Synthesis', 'Tools (DAW)', 'Performance Optimization'],
    advanced: ['Spatial Audio', 'Advanced DSP', 'Real-time Audio', 'Audio Compression', 'Interactive Audio'],
    optional: ['3D Audio', 'Music Information Retrieval', 'Voice Processing', 'Binaural Audio'],
  },

  'platform-engineer': {
    core: ['Platform Architecture', 'Developer Tools', 'Scalability', 'Reliability', 'Performance', 'Infrastructure'],
    support: ['CI/CD', 'Monitoring', 'Security', 'Documentation', 'Developer Experience'],
    advanced: ['Advanced Architecture', 'Distributed Systems', 'Internal Tools', 'Scaling Solutions', 'Cost Optimization'],
    optional: ['Kubernetes Platforms', 'Service Mesh', 'GitOps', 'Serverless Platforms'],
  },

  'security-architect': {
    core: ['Security Architecture', 'Threat Modeling', 'Cryptography', 'Access Control', 'Network Security', 'Compliance'],
    support: ['Security Tools', 'Risk Assessment', 'Incident Response', 'Secure Coding', 'Security Testing'],
    advanced: ['Enterprise Security', 'Advanced Threat Protection', 'Zero Trust Architecture', 'Security Governance', 'Advanced Persistent Threats'],
    optional: ['Quantum Security', 'AI Security', 'Security Automation', 'Blockchain Security'],
  },

  'performance-engineer': {
    core: ['Performance Profiling', 'Benchmarking', 'Optimization Techniques', 'Systems Knowledge', 'Load Testing'],
    support: ['Monitoring & APM', 'Database Optimization', 'Network Optimization', 'Caching Strategies'],
    advanced: ['Advanced Profiling', 'Distributed Systems Performance', 'GPU Optimization', 'Memory Management', 'Capacity Planning'],
    optional: ['Machine Learning Optimization', 'Hardware-level Optimization', 'Compiler Optimization', 'Energy Efficiency'],
  },

  'integration-engineer': {
    core: ['API Integration', 'ERP Systems', 'Data Integration', 'ETL', 'Middleware', 'System Architecture'],
    support: ['REST/SOA', 'Message Queues', 'Workflow Automation', 'Testing', 'Documentation'],
    advanced: ['Complex Integrations', 'Microservices Integration', 'Real-time Integration', 'Data Transformation', 'Error Handling'],
    optional: ['iPaaS Platforms', 'Advanced Workflows', 'Blockchain Integration', 'AI-powered Integration'],
  },

  'research-engineer': {
    core: ['Research Methodology', 'Algorithm Implementation', 'Python/C++', 'Mathematics', 'Paper Implementation', 'Experimentation'],
    support: ['Machine Learning', 'Statistical Analysis', 'Data Processing', 'Visualization', 'Documentation'],
    advanced: ['Novel Algorithm Development', 'Advanced Mathematics', 'Distributed Computing', 'Hardware Optimization', 'Publishing'],
    optional: ['Academic Collaboration', 'Patent Development', 'Open Source Contribution', 'Cross-disciplinary Research'],
  },

  default: {
    core: ['Problem Solving', 'Logical Thinking', 'Programming Fundamentals', 'Data Structures', 'Algorithms'],
    support: ['Communication', 'Critical Thinking', 'Teamwork', 'Learning Agility', 'Version Control'],
    advanced: ['System Design', 'Architecture Patterns', 'Code Quality', 'Performance Analysis', 'Best Practices'],
    optional: ['Leadership', 'Project Management', 'Mentoring', 'Technical Writing'],
  },
}

// ═══════════════════════════════════════════════════════════════════
// 🔗 SKILL DEPENDENCY GRAPH (REAL LEARNING DEPENDENCIES FOR 30+ ROLES)
// ═══════════════════════════════════════════════════════════════════

interface SkillDependency {
  source: string
  target: string
  type: 'dependency' | 'related' | 'complementary'
  description: string
}

const SKILL_DEPENDENCIES: SkillDependency[] = [
  // ══════════════════════════════════════════════════════════════════
  // FRONTEND/WEB DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'HTML5', target: 'DOM Manipulation', type: 'dependency', description: 'HTML is foundation for DOM interaction' },
  { source: 'CSS3', target: 'Responsive Web Design', type: 'dependency', description: 'CSS is required for responsive design' },
  { source: 'HTML5', target: 'Accessibility (WCAG)', type: 'related', description: 'HTML semantics enable accessibility' },
  { source: 'JavaScript (ES6+)', target: 'React', type: 'dependency', description: 'JS is core language for React' },
  { source: 'JavaScript (ES6+)', target: 'User Interaction Design', type: 'related', description: 'JS enables interactivity' },
  { source: 'React', target: 'State Management (Redux/Context)', type: 'dependency', description: 'React apps need centralized state' },
  { source: 'React', target: 'Component Architecture', type: 'related', description: 'React is fundamentally component-based' },
  { source: 'Component Architecture', target: 'Advanced CSS (Flexbox, Grid)', type: 'complementary', description: 'Modern CSS layouts for components' },
  { source: 'React', target: 'Unit Testing (Jest/React Testing Library)', type: 'related', description: 'Testing React components' },
  { source: 'JavaScript (ES6+)', target: 'TypeScript', type: 'related', description: 'TypeScript extends JavaScript with types' },
  { source: 'TypeScript', target: 'Advanced CSS (Flexbox, Grid)', type: 'complementary', description: 'Both improve code quality' },
  { source: 'REST APIs', target: 'State Management (Redux/Context)', type: 'complementary', description: 'State management handles API data' },
  { source: 'Performance Optimization', target: 'Code Splitting & Lazy Loading', type: 'related', description: 'Lazy loading improves performance' },
  { source: 'React', target: 'Next.js', type: 'dependency', description: 'Next.js builds on React' },
  { source: 'HTML5', target: 'Web Components', type: 'related', description: 'Web components are native HTML' },
  { source: 'CSS3', target: 'Web Animations', type: 'related', description: 'Animations use CSS/JS' },

  // ══════════════════════════════════════════════════════════════════
  // BACKEND/NODE DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Node.js', target: 'REST API Design', type: 'dependency', description: 'Node.js hosts APIs' },
  { source: 'Node.js', target: 'Express.js', type: 'dependency', description: 'Express is the primary Node framework' },
  { source: 'REST API Design', target: 'Authentication & Security', type: 'dependency', description: 'APIs require auth mechanisms' },
  { source: 'REST API Design', target: 'API Development', type: 'related', description: 'Both are API concepts' },
  { source: 'Database Design', target: 'SQL', type: 'dependency', description: 'SQL used to design databases' },
  { source: 'Database Design', target: 'NoSQL Databases', type: 'related', description: 'Both are database paradigms' },
  { source: 'Server Architecture', target: 'Microservices Architecture', type: 'related', description: 'Microservices is an architectural pattern' },
  { source: 'Server Architecture', target: 'Caching Strategies', type: 'related', description: 'Caching improves server performance' },
  { source: 'HTTP/HTTPS Protocols', target: 'REST API Design', type: 'dependency', description: 'HTTP underlies REST' },
  { source: 'Middleware Patterns', target: 'Error Handling', type: 'related', description: 'Middleware handles errors' },
  { source: 'Node.js', target: 'Logging & Monitoring', type: 'related', description: 'Node servers need logging' },

  // ══════════════════════════════════════════════════════════════════
  // DATA & ML DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Python', target: 'Pandas/NumPy', type: 'dependency', description: 'Python is foundation for data libraries' },
  { source: 'Python', target: 'Machine Learning Algorithms', type: 'dependency', description: 'Python is key ML language' },
  { source: 'SQL', target: 'Data Cleaning', type: 'dependency', description: 'SQL queries prepare data' },
  { source: 'Statistics & Probability', target: 'Machine Learning Algorithms', type: 'dependency', description: 'Stats foundation for ML' },
  { source: 'Pandas/NumPy', target: 'Exploratory Data Analysis', type: 'related', description: 'EDA uses pandas tools' },
  { source: 'Feature Engineering', target: 'Machine Learning Algorithms', type: 'dependency', description: 'Features input to ML models' },
  { source: 'Machine Learning Algorithms', target: 'Deep Learning', type: 'related', description: 'DL is advanced ML' },
  { source: 'TensorFlow/PyTorch', target: 'Deep Learning', type: 'dependency', description: 'Frameworks for DL implementation' },
  { source: 'Machine Learning Algorithms', target: 'Model Evaluation & Tuning', type: 'related', description: 'Tuning improves models' },
  { source: 'Data Visualization', target: 'Exploratory Data Analysis', type: 'related', description: 'Visualization helps EDA' },
  { source: 'Statistics & Probability', target: 'A/B Testing', type: 'dependency', description: 'Stats foundation for testing' },

  // ══════════════════════════════════════════════════════════════════
  // DATA ENGINEERING DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'SQL', target: 'ETL/ELT Processes', type: 'dependency', description: 'SQL is used in ETL' },
  { source: 'Python/Scala', target: 'Big Data Frameworks', type: 'dependency', description: 'Languages for Spark/Hadoop' },
  { source: 'Distributed Systems', target: 'Big Data Frameworks', type: 'related', description: 'Big data uses distributed computing' },
  { source: 'Data Warehousing', target: 'Data Modeling', type: 'related', description: 'Modeling designs warehouses' },
  { source: 'Spark', target: 'ETL/ELT Processes', type: 'related', description: 'Spark powers ETL' },
  { source: 'Airflow/Workflow Orchestration', target: 'ETL/ELT Processes', type: 'related', description: 'Orchestration manages ETL jobs' },
  { source: 'Real-time Processing', target: 'Streaming Data', type: 'dependency', description: 'Streaming requires real-time tech' },

  // ══════════════════════════════════════════════════════════════════
  // DEVOPS/CLOUD DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Linux/Unix', target: 'Shell Scripting', type: 'dependency', description: 'Linux foundation for shell' },
  { source: 'Docker', target: 'Kubernetes', type: 'dependency', description: 'Kubernetes orchestrates containers' },
  { source: 'Docker', target: 'CI/CD Pipelines', type: 'related', description: 'Containers enable CI/CD' },
  { source: 'CI/CD Pipelines', target: 'Monitoring & Logging', type: 'related', description: 'CI/CD deployments need monitoring' },
  { source: 'Cloud Platforms (AWS/GCP/Azure)', target: 'Infrastructure as Code', type: 'related', description: 'IaC provisions cloud resources' },
  { source: 'Kubernetes', target: 'Container Orchestration', type: 'dependency', description: 'K8s orchestrates containers' },
  { source: 'Linux/Unix', target: 'System Administration', type: 'related', description: 'Linux core to sysadmin' },
  { source: 'Networking', target: 'Cloud Platforms (AWS/GCP/Azure)', type: 'related', description: 'Networking underlies cloud' },
  { source: 'Terraform', target: 'Infrastructure as Code', type: 'dependency', description: 'Terraform is IaC tool' },
  { source: 'Monitoring & Logging', target: 'Incident Response', type: 'related', description: 'Logs help incident response' },
  { source: 'Infrastructure as Code', target: 'CI/CD Pipelines', type: 'related', description: 'IaC integrates with CI/CD' },

  // ══════════════════════════════════════════════════════════════════
  // SECURITY DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Network Security', target: 'Cryptography', type: 'related', description: 'Both protect data' },
  { source: 'Cryptography', target: 'Authentication/Authorization', type: 'dependency', description: 'Crypto enables secure auth' },
  { source: 'Secure Coding', target: 'Authentication & Security', type: 'related', description: 'Both prevent vulnerabilities' },
  { source: 'Penetration Testing', target: 'Vulnerability Assessment', type: 'related', description: 'Both find security issues' },
  { source: 'HTTP/HTTPS Protocols', target: 'Network Security', type: 'related', description: 'HTTPS secures HTTP' },
  { source: 'Compliance & Governance', target: 'Data Security', type: 'related', description: 'Compliance requires security' },

  // ══════════════════════════════════════════════════════════════════
  // TESTING DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Automated Testing', target: 'Test Frameworks', type: 'dependency', description: 'Frameworks enable automation' },
  { source: 'Java/Python/JavaScript', target: 'Automated Testing', type: 'dependency', description: 'Languages for test code' },
  { source: 'API Testing', target: 'REST APIs', type: 'related', description: 'Testing covers APIs' },
  { source: 'Performance Testing', target: 'Benchmarking', type: 'related', description: 'Benchmarking measures performance' },
  { source: 'Unit Testing (Jest/React Testing Library)', target: 'Code Quality & Refactoring', type: 'related', description: 'Tests ensure quality' },

  // ══════════════════════════════════════════════════════════════════
  // ARCHITECTURE/DESIGN DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'System Design', target: 'Architectural Patterns', type: 'dependency', description: 'Patterns guide system design' },
  { source: 'Microservices Architecture', target: 'System Design', type: 'related', description: 'Microservices is design pattern' },
  { source: 'Scalability', target: 'System Design', type: 'related', description: 'Scalability is design goal' },
  { source: 'Domain-Driven Design', target: 'System Design', type: 'related', description: 'DDD is design approach' },
  { source: 'API Design', target: 'REST API Design', type: 'dependency', description: 'REST is API design style' },

  // ══════════════════════════════════════════════════════════════════
  // SPECIALIZED TECH DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Blockchain Architecture', target: 'Cryptography', type: 'dependency', description: 'Crypto essential for blockchain' },
  { source: 'Smart Contracts', target: 'Solidity/Smart Contracts', type: 'dependency', description: 'Solidity for smart contracts' },
  { source: 'Solidity/Smart Contracts', target: 'EVM', type: 'related', description: 'Solidity runs on EVM' },
  { source: 'Embedded Systems', target: 'C/C++', type: 'dependency', description: 'C/C++ for embedded' },
  { source: 'Microcontrollers', target: 'Hardware Interfacing', type: 'related', description: 'Microcontrollers need hardware knowledge' },
  { source: 'IoT Protocols (MQTT, CoAP)', target: 'Wireless Communication', type: 'related', description: 'Protocols for IoT' },
  { source: 'Game Engines (Unity/Unreal)', target: 'C#/C++', type: 'dependency', description: 'Game engines use these langs' },
  { source: '3D Graphics', target: 'Rendering Algorithms', type: 'dependency', description: 'Graphics uses rendering' },
  { source: 'Graphics APIs (OpenGL, DirectX)', target: 'GLSL/HLSL', type: 'dependency', description: 'Shaders required for graphics APIs' },
  { source: 'Neural Networks', target: 'Deep Learning', type: 'dependency', description: 'NNs foundation of DL' },
  { source: 'Natural Language Processing', target: 'Machine Learning', type: 'dependency', description: 'NLP uses ML techniques' },

  // ══════════════════════════════════════════════════════════════════
  // GENERAL & CROSS-CUTTING DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Git & Version Control', target: 'CI/CD Pipelines', type: 'related', description: 'Git feeds CI/CD systems' },
  { source: 'Problem Solving', target: 'Algorithms', type: 'dependency', description: 'Algorithms solve problems' },
  { source: 'Data Structures', target: 'Algorithms', type: 'dependency', description: 'Structures used by algorithms' },
  { source: 'Logical Thinking', target: 'Problem Solving', type: 'dependency', description: 'Logic foundation for problem-solving' },
  { source: 'Communication', target: 'Team Leadership', type: 'related', description: 'Communication essential for leadership' },
  { source: 'Technical Understanding', target: 'Team Management', type: 'dependency', description: 'Need technical knowledge to manage' },
  { source: 'Code Review', target: 'Code Quality & Refactoring', type: 'related', description: 'Reviews ensure quality' },
  { source: 'Testing Mindset', target: 'Code Quality & Refactoring', type: 'related', description: 'Testing improves quality' },
  
  // ══════════════════════════════════════════════════════════════════
  // PLATFORM-SPECIFIC DEPENDENCIES
  // ══════════════════════════════════════════════════════════════════
  { source: 'Mobile Architecture', target: 'React Native / Flutter', type: 'dependency', description: 'Architecture guides mobile dev' },
  { source: 'JavaScript/Kotlin/Swift', target: 'Mobile Architecture', type: 'related', description: 'Languages for mobile' },
  { source: 'VR/AR Development', target: 'Game Engines (Unity/Unreal)', type: 'related', description: 'Engines support VR/AR' },
  { source: 'Spatial Computing', target: '3D Graphics', type: 'dependency', description: '3D graphics for spatial computing' },
]

// ═══════════════════════════════════════════════════════════════════
// 🔐 GROQ CLIENT SETUP (BEST PRACTICE FROM ROADMAP)
// ═══════════════════════════════════════════════════════════════════

function getSkillGenomeClient(): Groq | null {
  // Use dedicated GROQ_SKILL_GENOME_KEY for skill genome operations
  const apiKey = process.env.GROQ_SKILL_GENOME_KEY
  
  if (!apiKey) {
    console.warn('⚠️ GROQ_SKILL_GENOME_KEY not set, using fallback skill descriptions from database')
    return null
  }

  try {
    console.log('✅ Groq client initialized with GROQ_SKILL_GENOME_KEY')
    return new Groq({ apiKey })
  } catch (error) {
    console.error('❌ Failed to create Groq client:', error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🧠 SKILL EXTRACTION - Deterministic from Roadmap
// ═══════════════════════════════════════════════════════════════════

interface SkillWithFrequency {
  name: string
  frequency: number
  importance: number
  categories: string[]
}

function extractSkillsFromRoadmap(modules: RoadmapModule[]): SkillWithFrequency[] {
  const skillMap = new Map<string, SkillWithFrequency>()
  
  console.log('📦 Extracting from', modules.length, 'modules')

  if (modules.length === 0) {
    console.log('⚠️ No modules provided, will use role-based skills')
    return []
  }

  const difficultyWeights: Record<string, number> = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
  }

  modules.forEach((module) => {
    const diffWeight = difficultyWeights[module.difficulty] || 2

    // Use module skills if available, otherwise use module title as skill
    const skillsToProcess = module.skills && module.skills.length > 0 ? module.skills : [module.title]

    skillsToProcess.forEach((skill) => {
      if (!skill || skill.trim().length === 0) return

      const normalized = skill.trim().toLowerCase()

      if (skillMap.has(normalized)) {
        const existing = skillMap.get(normalized)!
        existing.frequency += 1
        existing.importance = Math.max(existing.importance, diffWeight)
      } else {
        skillMap.set(normalized, {
          name: skill.trim(),
          frequency: 1,
          importance: diffWeight,
          categories: [],
        })
      }
    })
  })

  console.log(`   → Found ${skillMap.size} unique skills from modules`)
  return Array.from(skillMap.values())
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 GET ROLE SKILLS (Comprehensive tech stack per role)
// ═══════════════════════════════════════════════════════════════════

function getRoleSkills(role: string): SkillWithFrequency[] {
  const normalizedRole = role.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-')
  
  const techStack = ROLE_TECH_STACKS[normalizedRole] || ROLE_TECH_STACKS['default']
  
  const allSkills: SkillWithFrequency[] = []
  
  // Add core skills
  techStack.core.forEach((skill) => {
    allSkills.push({
      name: skill,
      frequency: 1,
      importance: 5,
      categories: ['core'],
    })
  })
  
  // Add support skills
  techStack.support.forEach((skill) => {
    allSkills.push({
      name: skill,
      frequency: 1,
      importance: 3.5,
      categories: ['support'],
    })
  })
  
  // Add advanced skills
  techStack.advanced.forEach((skill) => {
    allSkills.push({
      name: skill,
      frequency: 1,
      importance: 2.5,
      categories: ['advanced'],
    })
  })
  
  // Add optional skills
  techStack.optional.forEach((skill) => {
    allSkills.push({
      name: skill,
      frequency: 1,
      importance: 1.5,
      categories: ['optional'],
    })
  })

  console.log(`📚 Loaded ${allSkills.length} skills from role profile: ${role}`)
  console.log(`   → Core: ${techStack.core.length} | Support: ${techStack.support.length} | Advanced: ${techStack.advanced.length} | Optional: ${techStack.optional.length}`)

  return allSkills
}

// ═══════════════════════════════════════════════════════════════════
// 🤖 COMPREHENSIVE SKILL GENOME AI CALL (SINGLE EFFICIENT CALL)
// Gets everything in ONE API request: suggestions + descriptions + resources
// ═══════════════════════════════════════════════════════════════════

async function enrichSkillsWithAISingleCall(
  skills: SkillNode[],
  role: string
): Promise<SkillNode[]> {
  const groqClient = getSkillGenomeClient()

  if (!groqClient) {
    console.log('📋 Using hardcoded skill descriptions database (API key unavailable)')
    return applyFallbackDescriptions(skills)
  }

  try {
    console.log('🤖 Making COMPREHENSIVE AI call for rich skill data (descriptions, tips, resources)...')
    
    const skillNames = skills.map(s => s.name)
    
    // OPTIMIZED PROMPT: Concise but rich, fewer tokens
    const prompt = `Expert career coach for ${role}. For each skill, provide:
1. Why it matters (1 sentence)
2. How to use it (1-2 sentences) 
3. 3 learning resources
4. 3 quick tips

Skills for ${role}:
${skillNames.map((s, i) => `${i + 1}. ${s}`).join(', ')}

Return ONLY valid JSON:
{
  "skills": [
    {
      "name": "Skill Name",
      "relative_to_role": "Why it matters",
      "importance_reason": "How to use",
      "learning_resources": ["Resource 1", "Resource 2", "Resource 3"],
      "quick_tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  ]
}

Return ALL ${skillNames.length} skills. Only return JSON.`

    try {
      // Try each model in order of token efficiency
      const models = ['mixtral-8x7b-32768', 'llama-3.1-70b-versatile', 'llama-3.3-70b-versatile']
      let response = null
      
      for (const model of models) {
        try {
          console.log(`   → Trying ${model}...`)
          response = await groqClient.chat.completions.create({
            model,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 4000, // Reduced from 8000 to save tokens
          })

          if (response?.choices?.[0]?.message?.content) {
            console.log(`   ✅ Success with ${model}`)
            break
          }
        } catch (modelError: any) {
          console.log(`   ⚠️ ${model} failed, trying next...`)
          continue
        }
      }

      if (!response?.choices?.[0]?.message?.content) {
        console.log('⚠️ Empty response from Groq, using fallback')
        return applyFallbackDescriptions(skills)
      }

      const content = response.choices[0].message.content
      const parsed = parseJSON(content)

      if (parsed?.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        console.log(`✅ Groq AI returned comprehensive data for ${parsed.skills.length} skills`)
        console.log(`   → Includes descriptions, tips, and resources (1 efficient API call!)`)
        
        // Match and apply comprehensive descriptions
        parsed.skills.forEach((skillData: any) => {
          const skill = skills.find(s => s.name === skillData.name || s.name.toLowerCase() === skillData.name.toLowerCase())
          if (skill) {
            skill.description = skillData.description || skill.description
            skill.relative_to_role = skillData.relative_to_role || skill.relative_to_role
            skill.importance_reason = skillData.importance_reason || skill.importance_reason
            skill.learning_resources = skillData.learning_resources || skill.learning_resources
            skill.quick_tips = skillData.quick_tips || skill.quick_tips
          }
        })

        // Apply fallback for any missing descriptions
        return applyFallbackForMissingDescriptions(skills)
      } else {
        console.log('⚠️ Invalid response format from Groq, using fallback')
        return applyFallbackDescriptions(skills)
      }
    } catch (error: any) {
      // Log the actual error for debugging
      const errorMessage = error?.message || String(error)
      const errorStatus = error?.status || error?.response?.status
      
      console.error('❌ Groq API error details:', {
        status: errorStatus,
        message: errorMessage,
        type: error?.code || error?.type,
      })
      
      // Check for rate limit errors specifically
      if (errorStatus === 429 || 
          errorMessage?.includes('rate_limit') || 
          errorMessage?.includes('429') ||
          errorMessage?.includes('Limit') ||
          errorMessage?.includes('exceeded')) {
        console.log('⚠️ Groq rate limit reached - Using fallback descriptions')
      } else if (errorMessage?.includes('API key') || errorMessage?.includes('unauthorized') || errorMessage?.includes('401')) {
        console.log('⚠️ Groq API key issue (invalid/expired) - Using fallback descriptions')
      } else if (errorMessage?.includes('timeout') || errorMessage?.includes('500') || errorMessage?.includes('503')) {
        console.log('⚠️ Groq service temporarily unavailable - Using fallback descriptions')
      } else {
        console.log(`⚠️ Groq API error (${errorStatus || 'unknown'}): ${errorMessage.substring(0, 100)} - Using fallback`)
      }
      return applyFallbackDescriptions(skills)
    }
  } catch (error) {
    console.error('❌ Skill enrichment failed:', error)
    return applyFallbackDescriptions(skills)
  }
}

async function getAISuggestions(
  baseSkills: string[],
  roleSkills: string[],
  role: string
): Promise<string[]> {
  // Try to get Groq client
  const groqClient = getSkillGenomeClient()

  // If no Groq client, return empty array (graceful degradation)
  if (!groqClient) {
    console.log('⚠️ Skipping AI suggestions (Groq unavailable)')
    return []
  }

  try {
    const existingSkills = new Set<string>()
    baseSkills.forEach(s => existingSkills.add(s.toLowerCase().trim()))
    roleSkills.forEach(s => existingSkills.add(s.toLowerCase().trim()))
    
    if (existingSkills.size === 0) {
      console.log('⚠️ No base skills to enhance')
      return []
    }

    const skillsList = Array.from(existingSkills)
      .slice(0, 20)
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n')
    
    const prompt = `You are a career education expert. Given this role and existing skills, suggest ONLY the most critical 5-8 MISSING skills.

ROLE: ${role}

EXISTING SKILLS:
${skillsList}

Return ONLY this exact JSON format with no markdown or extra text:
{"suggestions": ["skill1", "skill2", "skill3"]}`

    // Try multiple Groq models for maximum compatibility
    let response = null
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768']
    
    for (const model of models) {
      try {
        response = await groqClient.chat.completions.create({
          model,
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        })
        
        if (response?.choices?.[0]?.message?.content) {
          console.log(`✅ Groq API succeeded with model: ${model}`)
          break // Success - exit loop
        }
      } catch (modelError) {
        console.log(`⚠️ Model ${model} failed, trying next...`)
        continue
      }
    }

    if (!response?.choices?.[0]?.message?.content) {
      console.log('⚠️ No response from any Groq model')
      return []
    }

    const responseText = response.choices[0].message.content

    if (!responseText) {
      console.log('⚠️ Empty response from Groq')
      return []
    }

    const parsed = JSON.parse(responseText)
    
    // Return only suggestions that aren't already in existing skills (max 10)
    const newSuggestions = (parsed.suggestions || [])
      .filter((s: string) => !existingSkills.has(s.toLowerCase()))
      .slice(0, 10)

    console.log(`✨ AI suggested ${newSuggestions.length} additional skills`)
    return newSuggestions
  } catch (error) {
    console.error('❌ AI suggestion failed:', error)
    return []
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🔒 INTELLIGENT MERGE - Combine hardcoded + AI with smart categorization
// ═══════════════════════════════════════════════════════════════════

function safeMergeSkills(
  baseSkills: SkillWithFrequency[],
  roleSkills: SkillWithFrequency[],
  aiSuggestions: string[]
): SkillWithFrequency[] {
  const skillMap = new Map<string, SkillWithFrequency>()

  // Add base skills (highest priority)
  baseSkills.forEach((skill) => {
    const key = skill.name.toLowerCase().trim()
    skillMap.set(key, skill)
  })

  // Add role skills (mid priority)
  roleSkills.forEach((skill) => {
    const key = skill.name.toLowerCase().trim()
    if (!skillMap.has(key)) {
      skillMap.set(key, skill)
    }
  })

  // Add AI suggestions (lowest priority, only new ones)
  // Smart categorization for AI suggestions based on keyword matching
  aiSuggestions.forEach((skill) => {
    const key = skill.toLowerCase().trim()
    if (!skillMap.has(key)) {
      // Intelligent categorization for AI-suggested skills
      let category = 'advanced'
      let importance = 2.5
      
      // Check if it's a core technical skill
      const coreTechs = ['javascript', 'python', 'java', 'c++', 'rust', 'go', 'typescript', 'react', 'node', 'database', 'sql', 'api']
      const supportTechs = ['git', 'docker', 'testing', 'monitoring', 'logging', 'debugging']
      const optionalTechs = ['blockchain', 'quantum', 'vr', 'ar', 'nft', 'web3']
      
      if (coreTechs.some(tech => key.includes(tech))) {
        category = 'core'
        importance = 4.5
      } else if (supportTechs.some(tech => key.includes(tech))) {
        category = 'support'
        importance = 3.2
      } else if (optionalTechs.some(tech => key.includes(tech))) {
        category = 'optional'
        importance = 1.8
      }
      
      skillMap.set(key, {
        name: skill,
        frequency: 1.5, // AI suggestions slightly lower than hardcoded
        importance,
        categories: [category],
      })
    }
  })

  // Validate: ensure we have between 5-35 skills
  let final = Array.from(skillMap.values())
  
  if (final.length < 5) {
    console.warn(`⚠️ Only ${final.length} skills found, may need more data`)
  }
  
  if (final.length > 35) {
    console.warn(`⚠️ Too many skills (${final.length}), trimming to top 35`)
    // Keep core > support > advanced > optional
    final = final.sort((a, b) => {
      const catOrder = { core: 0, support: 1, advanced: 2, optional: 3 }
      const catA = a.categories[0] || 'optional'
      const catB = b.categories[0] || 'optional'
      
      if (catOrder[catA as keyof typeof catOrder] !== catOrder[catB as keyof typeof catOrder]) {
        return catOrder[catA as keyof typeof catOrder] - catOrder[catB as keyof typeof catOrder]
      }
      return b.importance - a.importance
    })
    return final.slice(0, 35)
  }

  return final
}

// ═══════════════════════════════════════════════════════════════════
// 📚 SKILL CATEGORIZATION (Respects pre-assigned categories)
// ═══════════════════════════════════════════════════════════════════

function categorizeSkills(skills: SkillWithFrequency[]): Map<string, SkillWithFrequency[]> {
  const categories = new Map<string, SkillWithFrequency[]>()
  categories.set('core', [])
  categories.set('support', [])
  categories.set('advanced', [])
  categories.set('optional', [])

  skills.forEach((skill) => {
    // Skills from role stacks already have categories assigned
    if (skill.categories && skill.categories.length > 0) {
      skill.categories.forEach((cat) => {
        if (categories.has(cat)) {
          categories.get(cat)!.push(skill)
        }
      })
    } else {
      // Fallback for skills without pre-assigned category
      // Sort by importance
      if (skill.importance >= 4) {
        categories.get('core')!.push(skill)
      } else if (skill.importance >= 2.5) {
        categories.get('support')!.push(skill)
      } else if (skill.importance >= 2) {
        categories.get('advanced')!.push(skill)
      } else {
        categories.get('optional')!.push(skill)
      }
    }
  })

  return categories
}

// ═══════════════════════════════════════════════════════════════════
// 🔗 BUILD SKILL GRAPH (Intelligent edge creation + percentages)
// ═══════════════════════════════════════════════════════════════════

function buildSkillGraph(
  categorized: Map<string, SkillWithFrequency[]>,
  moduleProgress: Map<string, number>
): { nodes: SkillNode[]; edges: SkillEdge[]; percentages: Record<string, number> } {
  const nodes: SkillNode[] = []
  const skillIdMap = new Map<string, string>()
  const skillNameToNode = new Map<string, SkillNode>()
  const percentages: Record<string, number> = {}
  
  const categoryColors: Record<string, string> = {
    core: '#00D9FF', // Cyan glow
    support: '#0B5FFF', // Blue
    advanced: '#9D00FF', // Purple
    optional: '#FF6B00', // Orange
  }

  let skillId = 0

  // Ensure categorized map has all required keys
  if (!categorized.has('core')) categorized.set('core', [])
  if (!categorized.has('support')) categorized.set('support', [])
  if (!categorized.has('advanced')) categorized.set('advanced', [])
  if (!categorized.has('optional')) categorized.set('optional', [])

  // Calculate total importance for percentage calculations
  let totalImportance = 0
  categorized.forEach((skills) => {
    skills.forEach((skill) => {
      totalImportance += skill.importance
    })
  })
  totalImportance = Math.max(totalImportance, 1) // Avoid division by zero

  // Create nodes for each skill
  ;(['core', 'support', 'advanced', 'optional'] as const).forEach((category) => {
    const skills = categorized.get(category) || []

    skills.forEach((skill) => {
      const id = `skill-${skillId++}`
      skillIdMap.set(skill.name.toLowerCase(), id)

      // Calculate progress based on modules containing this skill
      let progress = 0
      let moduleCount = 0
      moduleProgress.forEach((moduleProg) => {
        progress += moduleProg
        moduleCount += 1
      })
      progress = moduleCount > 0 ? Math.round(progress / moduleCount) : 0

      // Calculate skill percentage (based on importance)
      const percentage = Math.round((skill.importance / totalImportance) * 100)
      percentages[skill.name] = percentage

      const node: SkillNode = {
        id,
        name: skill.name,
        category,
        progress,
        importance: Math.min(5, skill.importance),
        frequency: skill.frequency,
        color: categoryColors[category],
        description: `${skill.frequency} module${skill.frequency !== 1 ? 's' : ''} use this skill • ${percentage}% importance`,
        mastery: progress,
      }

      nodes.push(node)
      skillNameToNode.set(skill.name.toLowerCase(), node)
    })
  })

  // Build edges with intelligent fallback strategy
  const edges: SkillEdge[] = []
  const addedEdges = new Set<string>()

  // PHASE 1: Add edges from SKILL_DEPENDENCIES (exact matches)
  SKILL_DEPENDENCIES.forEach((dep) => {
    const sourceId = skillIdMap.get(dep.source.toLowerCase())
    const targetId = skillIdMap.get(dep.target.toLowerCase())
    
    if (sourceId && targetId) {
      const edgeKey = `${sourceId}-${targetId}`
      if (!addedEdges.has(edgeKey)) {
        edges.push({
          source: sourceId,
          target: targetId,
          type: dep.type,
          strength: dep.type === 'dependency' ? 0.8 : dep.type === 'related' ? 0.6 : 0.4,
        })
        addedEdges.add(edgeKey)
      }
    }
  })

  // PHASE 2: Add intelligent cross-category edges for unmapped skills
  const coreNodes = nodes.filter(n => n.category === 'core')
  const supportNodes = nodes.filter(n => n.category === 'support')
  const advancedNodes = nodes.filter(n => n.category === 'advanced')
  const optionalNodes = nodes.filter(n => n.category === 'optional')

  // Core → Support (learning path)
  for (let i = 0; i < Math.min(coreNodes.length, 3); i++) {
    const targetIdx = Math.min(i, supportNodes.length - 1)
    if (supportNodes[targetIdx]) {
      const edgeKey = `${coreNodes[i].id}-${supportNodes[targetIdx].id}`
      if (!addedEdges.has(edgeKey)) {
        edges.push({
          source: coreNodes[i].id,
          target: supportNodes[targetIdx].id,
          type: 'dependency',
          strength: 0.7,
        })
        addedEdges.add(edgeKey)
      }
    }
  }

  // Support → Advanced (progression)
  for (let i = 0; i < Math.min(supportNodes.length, 3); i++) {
    const targetIdx = Math.min(i, advancedNodes.length - 1)
    if (advancedNodes[targetIdx]) {
      const edgeKey = `${supportNodes[i].id}-${advancedNodes[targetIdx].id}`
      if (!addedEdges.has(edgeKey)) {
        edges.push({
          source: supportNodes[i].id,
          target: advancedNodes[targetIdx].id,
          type: 'related',
          strength: 0.6,
        })
        addedEdges.add(edgeKey)
      }
    }
  }

  // Advanced → Optional (specialization)
  for (let i = 0; i < Math.min(advancedNodes.length, 2); i++) {
    const targetIdx = Math.min(i, optionalNodes.length - 1)
    if (optionalNodes[targetIdx]) {
      const edgeKey = `${advancedNodes[i].id}-${optionalNodes[targetIdx].id}`
      if (!addedEdges.has(edgeKey)) {
        edges.push({
          source: advancedNodes[i].id,
          target: optionalNodes[targetIdx].id,
          type: 'complementary',
          strength: 0.4,
        })
        addedEdges.add(edgeKey)
      }
    }
  }

  // PHASE 3: Add within-category edges (tight clustering)
  ;(['core', 'support', 'advanced'] as const).forEach((category) => {
    const categorySkills = nodes.filter((n) => n.category === category)
    
    // Connect skills within same category (max 2 per skill for clarity)
    for (let i = 0; i < categorySkills.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, categorySkills.length); j++) {
        const edgeKey = `${categorySkills[i].id}-${categorySkills[j].id}`
        if (!addedEdges.has(edgeKey)) {
          edges.push({
            source: categorySkills[i].id,
            target: categorySkills[j].id,
            type: 'related',
            strength: 0.3,
          })
          addedEdges.add(edgeKey)
          break // Only 1 within-category edge per skill to avoid overcrowding
        }
      }
    }
  })

  console.log('🔍 Skill Graph Summary:', {
    coreSkillsCount: nodes.filter(n => n.category === 'core').length,
    supportSkillsCount: nodes.filter(n => n.category === 'support').length,
    advancedSkillsCount: nodes.filter(n => n.category === 'advanced').length,
    optionalSkillsCount: nodes.filter(n => n.category === 'optional').length,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    avgEdgesPerNode: (edges.length / nodes.length).toFixed(2),
  })

  return { nodes, edges, percentages }
}

// ═══════════════════════════════════════════════════════════════════
// 🤖 GROQ AI - Skill Explanations & Learning Guidance
// ═══════════════════════════════════════════════════════════════════

async function enhanceSkillsWithAI(
  skills: SkillNode[],
  role: string
): Promise<SkillNode[]> {
  // ⚡ PRIORITY: Use hardcoded descriptions database (ALWAYS reliable)
  console.log('📋 Step 7: Applying skill descriptions from database')
  return applyFallbackDescriptions(skills)
}

// Alternative function for optional AI enrichment (not in main flow)
async function enhanceSkillsWithAIOptional(
  skills: SkillNode[],
  role: string
): Promise<SkillNode[]> {
  const groqClient = getSkillGenomeClient()

  if (!groqClient) {
    console.log('⚠️ Groq unavailable, using hardcoded skill descriptions')
    return applyFallbackDescriptions(skills)
  }

  try {
    // Batch skills into groups of 5 for efficiency
    const batchSize = 5
    const skillNames = skills.map((s) => s.name)
    let apiSuccess = false

    for (let i = 0; i < skillNames.length; i += batchSize) {
      const batch = skillNames.slice(i, i + batchSize)
      const batchSkills = skills.slice(i, i + batchSize)

      const prompt = `You are a career education expert. For the role "${role}", provide brief explanations for these skills:

${batch.map((skill, idx) => `${idx + 1}. ${skill}`).join('\n')}

For each skill, provide ONLY valid JSON with NO markdown or extra text:
{
  "skills": [
    {
      "name": "Skill Name",
      "relative_to_role": "Why this skill matters specifically for ${role} (1 sentence)",
      "importance_reason": "How this skill is applied in ${role} work (1 sentence)",
      "learning_resources": ["resource 1", "resource 2"]
    }
  ]
}

Be specific to ${role}. Return only the JSON.`

      try {
        // Try multiple Groq models for maximum compatibility
        let response = null
        const models = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768']
        
        for (const model of models) {
          try {
            response = await groqClient.chat.completions.create({
              model,
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              max_tokens: 1000,
            })
            
            if (response?.choices?.[0]?.message?.content) {
              console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} used model: ${model}`)
              apiSuccess = true
              break // Success - exit loop
            }
          } catch (modelError: any) {
            // Check for rate limit error
            if (modelError?.status === 429 || modelError?.message?.includes('rate_limit')) {
              console.log(`⚠️ Rate limit detected - Using fallback descriptions instead`)
              return applyFallbackDescriptions(skills)
            }
            console.log(`⚠️ Model ${model} failed for batch ${Math.floor(i / batchSize) + 1}, trying next...`)
            continue
          }
        }

        if (!response?.choices?.[0]?.message?.content) {
          console.warn(`⚠️ Batch ${Math.floor(i / batchSize) + 1} - No response from any Groq model`)
          continue
        }

        const content = response.choices[0].message.content
        const parsed = parseJSON(content)

        if (parsed?.skills && Array.isArray(parsed.skills)) {
          parsed.skills.forEach((explanations: any, idx: number) => {
            if (batchSkills[idx]) {
              batchSkills[idx].relative_to_role = explanations.relative_to_role
              batchSkills[idx].importance_reason = explanations.importance_reason
              batchSkills[idx].learning_resources = explanations.learning_resources
            }
          })
        }
      } catch (error: any) {
        if (apiSuccess) {
          // Only log if we had some success before
          console.warn(`⚠️ Batch ${Math.floor(i / batchSize) + 1} failed, will apply fallback`)
        }
      }

      // Delay to avoid rate limiting
      if (i + batchSize < skillNames.length && apiSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    // If some batches failed, apply fallback to skills without descriptions
    return applyFallbackForMissingDescriptions(skills)
  } catch (error: any) {
    console.error('❌ Skill enhancement error:', error instanceof Error ? error.message : error)
    return applyFallbackDescriptions(skills)
  }
}

// ═══════════════════════════════════════════════════════════════════
// 📋 FALLBACK DESCRIPTION SYSTEM (When API unavailable or rate-limited)
// ═══════════════════════════════════════════════════════════════════

function applyFallbackDescriptions(skills: SkillNode[]): SkillNode[] {
  console.log('📋 Applying fallback skill descriptions database')
  
  return skills.map((skill) => {
    const description = SKILL_DESCRIPTIONS[skill.name]
    
    if (description) {
      return {
        ...skill,
        relative_to_role: description.relative_to_role,
        importance_reason: description.importance_reason,
        learning_resources: description.learning_resources,
        quick_tips: getDefaultQuickTips(skill.name, skill.category),
      }
    }

    // For skills not in database, generate intelligent fallback
    return {
      ...skill,
      relative_to_role: `Essential competency for modern professional development`,
      importance_reason: `Directly contributes to job effectiveness and career growth`,
      learning_resources: ['Official Documentation', 'Online Courses', 'Practice Projects'],
      quick_tips: getDefaultQuickTips(skill.name, skill.category),
    }
  })
}

function applyFallbackForMissingDescriptions(skills: SkillNode[]): SkillNode[] {
  return skills.map((skill) => {
    // If already has comprehensive data from API, keep it
    if (skill.relative_to_role && skill.importance_reason && skill.quick_tips) {
      return skill
    }

    // Otherwise apply fallback
    const description = SKILL_DESCRIPTIONS[skill.name]
    if (description) {
      return {
        ...skill,
        relative_to_role: skill.relative_to_role || description.relative_to_role,
        importance_reason: skill.importance_reason || description.importance_reason,
        learning_resources: skill.learning_resources || description.learning_resources,
        quick_tips: skill.quick_tips || getDefaultQuickTips(skill.name, skill.category),
      }
    }

    // Generic fallback with smart defaults
    return {
      ...skill,
      relative_to_role: skill.relative_to_role || `Critical skill for ${skill.category === 'core' ? 'core competency building' : skill.category === 'support' ? 'professional support' : 'advanced expertise'}`,
      importance_reason: skill.importance_reason || `Essential for excelling in ${skill.category} areas of the role`,
      learning_resources: skill.learning_resources || ['Official Documentation', 'Industry Courses', 'Hands-on Projects'],
      quick_tips: skill.quick_tips || getDefaultQuickTips(skill.name, skill.category),
    }
  })
}

// Helper function to generate sensible quick tips for any skill
function getDefaultQuickTips(skillName: string, category: string): string[] {
  return [
    `Start with fundamentals: Build a solid foundation in ${skillName}`,
    `Practice consistently: Dedicate time daily to strengthen your ${skillName}`,
    `Build projects: Create hands-on projects to apply your ${skillName} knowledge`,
    `Join communities: Connect with others learning ${skillName} for support and insights`,
  ]
}

// ═══════════════════════════════════════════════════════════════════
// 🛠️ UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function parseJSON(text: string): any {
  try {
    return JSON.parse(text)
  } catch (e1) {
    // Try extracting from markdown
    const mdMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (mdMatch) {
      try {
        return JSON.parse(mdMatch[1])
      } catch (e2) {
        // Try finding JSON object
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}')
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          try {
            return JSON.parse(text.substring(jsonStart, jsonEnd + 1))
          } catch (e3) {
            return null
          }
        }
      }
    }
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🎯 MAIN SKILL GENOME BUILDER
// ═══════════════════════════════════════════════════════════════════

export async function buildSkillGenome(
  role: string,
  modules: RoadmapModule[],
  moduleProgress?: Map<string, number>
): Promise<SkillGraph> {
  console.log(`🧬 Building Skill Genome for: ${role}`)

  // ✅ STEP 1: Extract base skills from roadmap (DETERMINISTIC)
  console.log('📊 Step 1: Extracting base skills from roadmap modules')
  const baseSkills = extractSkillsFromRoadmap(modules)
  console.log(`   → Found ${baseSkills.length} base skills from modules`)

  // ✅ STEP 2: Get role skill map as base
  console.log('📚 Step 2: Loading role skill map')
  const roleSkills = getRoleSkills(role)
  console.log(`   → Found ${roleSkills.length} skills from role profile`)

  // ✅ STEP 3: Safe merge base + role skills (NO AI suggestions - already comprehensive)
  console.log('🔒 Step 3: Merging skill sources')
  const mergedSkills = safeMergeSkills(baseSkills, roleSkills, [])
  console.log(`   → Final skill count: ${mergedSkills.length}`)

  // ✅ STEP 4: Categorize merged skills
  console.log('📂 Step 4: Categorizing skills by importance')
  const categorized = categorizeSkills(mergedSkills)

  // ✅ STEP 5: Build graph structure (DETERMINISTIC)
  console.log('🔗 Step 5: Building skill relationship graph')
  const progress = moduleProgress || new Map()
  const { nodes, edges, percentages } = buildSkillGraph(categorized, progress)

  // ✅ STEP 6: SINGLE comprehensive AI call for descriptions + resources (ONE API CALL ONLY)
  console.log('✨ Step 6: Enriching skills with AI descriptions')
  const enhancedNodes = await enrichSkillsWithAISingleCall(nodes, role)

  // Calculate overall progress
  const totalProgress = Math.round(
    enhancedNodes.reduce((sum, node) => sum + node.progress, 0) / Math.max(enhancedNodes.length, 1)
  )

  const coreNodes = enhancedNodes.filter((n) => n.category === 'core')
  const coreProgress = Math.round(
    coreNodes.reduce((sum, node) => sum + node.progress, 0) / Math.max(coreNodes.length, 1)
  )

  const skillGraph: SkillGraph = {
    nodes: enhancedNodes,
    edges,
    role,
    totalProgress,
    coreSkillsProgress: coreProgress,
    skillPercentages: percentages,
  }

  console.log(`✅ Skill Genome built: ${enhancedNodes.length} skills, ${edges.length} relationships`)
  console.log(`   → Core: ${coreNodes.length} | Support: ${enhancedNodes.filter(n => n.category === 'support').length} | Advanced: ${enhancedNodes.filter(n => n.category === 'advanced').length}`)

  return skillGraph
}

// Export for use in API routes
export { getSkillGenomeClient }
