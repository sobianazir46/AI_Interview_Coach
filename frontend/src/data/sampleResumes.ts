export interface SampleResume {
  id: string;
  role: string;
  title: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: "fullstack",
    role: "Full Stack Software Engineer",
    title: "Full Stack Engineer (3 YOE)",
    text: `ALEX RIVERA
Full Stack Software Engineer | alex.rivera@email.com | GitHub: github.com/arivera

SUMMARY
Passionate Full Stack Developer with 3 years of experience building scalable web applications using React, TypeScript, Node.js, Express, and PostgreSQL. Experienced in API design, microservices, state management, and CI/CD automation.

WORK EXPERIENCE
Software Engineer | TechStart Solutions (2024 - Present)
- Architected and deployed responsive React/TypeScript frontend components serving 100k+ active monthly users.
- Designed RESTful and GraphQL APIs in Express and Node.js, reducing server latency by 28%.
- Optimized PostgreSQL database queries and database indexing, decreasing average load time from 1.2s to 350ms.
- Integrated payment processing via Stripe API and automated user authentication with OAuth 2.0 & JWT.

Junior Web Developer | CloudCraft Labs (2023 - 2024)
- Developed modular React UI components using Tailwind CSS and Redux Toolkit.
- Built automated test suites using Jest and React Testing Library, achieving 85% unit test coverage.
- Collaborated in Agile sprints with product managers and designers to deliver bi-weekly feature releases.

EDUCATION
B.S. in Computer Science | State University (2019 - 2023)

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
Frameworks/Tools: React, Node.js, Express, Tailwind CSS, PostgreSQL, Docker, Git, Jest, Vite`
  },
  {
    id: "datascientist",
    role: "Data Scientist / AI Engineer",
    title: "Data Scientist (2 YOE)",
    text: `JORDAN CHEN
Data Scientist & ML Engineer | jordan.chen@email.com

SUMMARY
Data Scientist with 2+ years of experience in predictive modeling, natural language processing (NLP), and Gemini AI LLM integrations. Proficient in Python, PyTorch, SQL, Scikit-Learn, and cloud deployment.

WORK EXPERIENCE
Associate Data Scientist | DataPulse Analytics (2024 - Present)
- Built NLP classification models to evaluate customer sentiment with 92% precision across 500k reviews.
- Developed RAG (Retrieval-Augmented Generation) pipelines using Gemini embeddings and FAISS vector databases.
- Engineered automated Python ETL pipelines to process multi-gigabyte datasets from Google BigQuery.

Data Analyst Intern | Insights Corp (2023)
- Constructed interactive dashboards in Tableau and Streamlit to monitor key sales conversion metrics.
- Applied A/B testing statistical analysis to optimize landing page user journeys.

EDUCATION
M.S. in Data Science & Analytics | Tech Institute (2023 - 2024)
B.S. in Mathematics | State College (2019 - 2023)

TECHNICAL SKILLS
Python, SQL, R, PyTorch, Scikit-Learn, Pandas, NumPy, Gemini API, Docker, AWS, Git`
  },
  {
    id: "productmanager",
    role: "Product Manager",
    title: "Product Manager (Associate)",
    text: `MORGAN TAYLOR
Product Manager | morgan.taylor@email.com

SUMMARY
Customer-obsessed Product Manager with 2 years of experience leading cross-functional engineering and design teams to deliver high-impact SaaS software products.

WORK EXPERIENCE
Associate Product Manager | Nexus SaaS (2024 - Present)
- Led product roadmap definition and feature prioritization for a core B2B customer portal, growing ARR by 22%.
- Defined product requirements (PRDs), user stories, and acceptance criteria in Jira for 8-person engineering pod.
- Conducted 40+ user interviews and analyzed Product Analytics (Mixpanel) to reduce user churn by 14%.

Product Operations Analyst | ScaleUp Inc (2023 - 2024)
- Automated user feedback categorization using AI tools, saving 15 hours per week of manual synthesis.
- Coordinated cross-departmental product launches with Marketing, Sales, and Customer Success.

EDUCATION
B.A. in Business Administration | City University (2019 - 2023)`
  }
];

export const POPULAR_ROLES = [
  "Full Stack Software Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Data Scientist / AI Engineer",
  "Product Manager",
  "DevOps / Cloud Engineer",
  "Mobile App Developer (React Native/Flutter)",
  "UI/UX Designer",
  "Cybersecurity Analyst",
];
