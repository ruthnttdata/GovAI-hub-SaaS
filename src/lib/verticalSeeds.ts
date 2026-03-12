// Vertical template seed data for preloading when creating orgs
export const VERTICAL_SEED: Record<string, { risks: any[]; controls: any[]; requirements: any[] }> = {
  general: {
    risks: [
      { code: "R-001", name: "Data quality degradation", category: "Data Quality & Bias", impact: 3, probability: 3, iso_clause: "6.1.2", description: "AI outputs affected by poor or stale training data" },
      { code: "R-002", name: "Unauthorized data access", category: "Privacy & Data Protection", impact: 4, probability: 2, iso_clause: "6.1.2", annex_control: "A.7", description: "Personal data processed without consent or beyond scope" },
      { code: "R-003", name: "Model output unexplainability", category: "Transparency & Explainability", impact: 3, probability: 3, iso_clause: "8.4", annex_control: "A.8", description: "Inability to explain AI decisions to stakeholders" },
      { code: "R-004", name: "Third-party AI dependency", category: "Third-Party / Supply Chain", impact: 3, probability: 3, iso_clause: "6.1", annex_control: "A.10", description: "Over-reliance on external AI providers without fallback" },
    ],
    controls: [
      { name: "Data quality monitoring", iso_clause: "8.2", annex_control: "A.7", description: "Regular data quality checks and validation pipelines" },
      { name: "Privacy impact assessment", iso_clause: "8.4", annex_control: "A.5", description: "PIA before deploying any AI system handling personal data" },
      { name: "Explainability documentation", iso_clause: "8.1", annex_control: "A.8", description: "Document explanation methods for each AI system" },
      { name: "Supplier risk assessment", iso_clause: "6.1.3", annex_control: "A.10", description: "Evaluate and monitor third-party AI providers" },
    ],
    requirements: [
      { requirement_id: "REQ-4.1", requirement_name: "Context analysis documented", iso_clause: "4.1" },
      { requirement_id: "REQ-5.2", requirement_name: "AI Policy approved", iso_clause: "5.2" },
      { requirement_id: "REQ-6.1", requirement_name: "Risk register maintained", iso_clause: "6.1" },
      { requirement_id: "REQ-7.5", requirement_name: "Document control procedure", iso_clause: "7.5" },
      { requirement_id: "REQ-8.1", requirement_name: "Operational procedures defined", iso_clause: "8.1" },
      { requirement_id: "REQ-9.2", requirement_name: "Internal audit conducted", iso_clause: "9.2" },
    ],
  },
  saas_b2b: {
    risks: [
      { code: "R-001", name: "Customer data leakage via AI", category: "Privacy & Data Protection", impact: 5, probability: 2, iso_clause: "6.1.2", annex_control: "A.7", description: "AI model memorizes or exposes customer data across tenants" },
      { code: "R-002", name: "AI feature bias in SLA tiers", category: "Fairness & Non-discrimination", impact: 3, probability: 3, iso_clause: "8.4", annex_control: "A.5", description: "AI recommendations differ unfairly across customer tiers" },
      { code: "R-003", name: "MLOps deployment failures", category: "Reliability & Safety", impact: 4, probability: 3, iso_clause: "8.1", annex_control: "A.6", description: "Model deployment pipeline failures causing service degradation" },
      { code: "R-004", name: "API abuse / adversarial inputs", category: "Security & Robustness", impact: 4, probability: 3, iso_clause: "6.1.2", annex_control: "A.6", description: "Malicious inputs via API causing unexpected AI behavior" },
    ],
    controls: [
      { name: "Tenant data isolation", iso_clause: "8.1", annex_control: "A.7", description: "Enforce strict data isolation between tenants in AI pipelines" },
      { name: "Fairness testing pre-release", iso_clause: "8.4", annex_control: "A.5", description: "Automated fairness metrics testing before each model release" },
      { name: "CI/CD model validation", iso_clause: "8.1", annex_control: "A.6", description: "Automated validation gates in MLOps deployment pipeline" },
      { name: "Input validation & rate limiting", iso_clause: "8.2", annex_control: "A.6", description: "Validate and sanitize all AI API inputs" },
    ],
    requirements: [
      { requirement_id: "REQ-4.1", requirement_name: "SaaS context and multi-tenancy scope", iso_clause: "4.1" },
      { requirement_id: "REQ-5.2", requirement_name: "AI Policy covering SaaS delivery", iso_clause: "5.2" },
      { requirement_id: "REQ-6.1", requirement_name: "Risk register with SaaS-specific risks", iso_clause: "6.1" },
      { requirement_id: "REQ-8.1", requirement_name: "MLOps procedures documented", iso_clause: "8.1" },
      { requirement_id: "REQ-8.4", requirement_name: "Impact assessment per AI feature", iso_clause: "8.4" },
      { requirement_id: "REQ-9.1", requirement_name: "AI KPIs monitored (latency, accuracy, fairness)", iso_clause: "9.1" },
    ],
  },
  services_bpo: {
    risks: [
      { code: "R-001", name: "Client confidentiality breach via AI", category: "Privacy & Data Protection", impact: 5, probability: 2, iso_clause: "6.1.2", annex_control: "A.7", description: "AI tools processing client data without proper isolation" },
      { code: "R-002", name: "Inconsistent AI-assisted advice", category: "Accountability", impact: 4, probability: 3, iso_clause: "8.4", description: "AI recommendations vary inconsistently across consultants" },
      { code: "R-003", name: "Over-reliance on AI outputs", category: "Human Oversight", impact: 3, probability: 4, iso_clause: "8.1", annex_control: "A.9", description: "Staff accepting AI outputs without human review" },
      { code: "R-004", name: "Regulatory non-compliance in AI use", category: "Accountability", impact: 5, probability: 2, iso_clause: "4.2", description: "AI tools not compliant with client's regulatory requirements" },
    ],
    controls: [
      { name: "Client data segregation", iso_clause: "8.1", annex_control: "A.7", description: "Separate AI processing environments per client engagement" },
      { name: "Human-in-the-loop mandate", iso_clause: "8.1", annex_control: "A.9", description: "All AI outputs require human review before client delivery" },
      { name: "Regulatory compliance checklist", iso_clause: "4.2", annex_control: "A.2", description: "Pre-engagement AI compliance check per jurisdiction" },
      { name: "AI usage training program", iso_clause: "7.2", annex_control: "A.3", description: "Mandatory training for all staff using AI tools" },
    ],
    requirements: [
      { requirement_id: "REQ-4.2", requirement_name: "Client and regulatory requirements mapped", iso_clause: "4.2" },
      { requirement_id: "REQ-5.3", requirement_name: "RACI for AI in service delivery", iso_clause: "5.3" },
      { requirement_id: "REQ-7.2", requirement_name: "AI competency training records", iso_clause: "7.2" },
      { requirement_id: "REQ-8.1", requirement_name: "Service delivery AI procedures", iso_clause: "8.1" },
      { requirement_id: "REQ-9.3", requirement_name: "Management review of AI usage", iso_clause: "9.3" },
    ],
  },
};
