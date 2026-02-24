import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.board.deleteMany();

  const board1 = await prisma.board.create({
    data: {
      name: "Project Alpha",
      description: "Main development project for Q1 2026",
      color: "#58A6FF",
      tasks: {
        create: [
          { title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", status: "done", priority: "high" },
          { title: "Design database schema", description: "Create ERD and define all tables for the application", status: "done", priority: "high" },
          { title: "Build authentication module", description: "Implement JWT-based auth with refresh tokens", status: "in_progress", priority: "high" },
          { title: "Create API documentation", description: "Document all REST endpoints using OpenAPI spec", status: "in_progress", priority: "medium" },
          { title: "Write unit tests", description: "Achieve 80% code coverage for core modules", status: "todo", priority: "medium" },
          { title: "Performance optimization", description: "Profile and optimize slow database queries", status: "todo", priority: "low" },
          { title: "Set up error monitoring", description: "Integrate Sentry for production error tracking", status: "todo", priority: "high" },
          { title: "Implement rate limiting", description: "Add rate limiting middleware to all API endpoints", status: "todo", priority: "medium" },
          { title: "Build user dashboard", description: "Create dashboard page with analytics and recent activity", status: "in_progress", priority: "high" },
          { title: "Configure staging environment", description: "Set up staging server mirroring production", status: "done", priority: "medium" },
        ],
      },
    },
  });

  const board2 = await prisma.board.create({
    data: {
      name: "Mobile App v2",
      description: "React Native mobile app redesign and feature update",
      color: "#3FB950",
      tasks: {
        create: [
          { title: "Migrate to React Navigation 7", description: "Update navigation library and fix breaking changes", status: "done", priority: "high" },
          { title: "Redesign onboarding flow", description: "New 3-step onboarding with animations", status: "in_progress", priority: "high" },
          { title: "Implement push notifications", description: "Set up Firebase Cloud Messaging for iOS and Android", status: "in_progress", priority: "high" },
          { title: "Add biometric login", description: "Support Face ID and fingerprint authentication", status: "todo", priority: "medium" },
          { title: "Offline mode support", description: "Cache data locally and sync when connection is restored", status: "todo", priority: "high" },
          { title: "Dark mode toggle", description: "Allow users to switch between light and dark themes", status: "done", priority: "low" },
          { title: "Fix crash on image upload", description: "App crashes when uploading images larger than 10MB", status: "in_progress", priority: "high" },
          { title: "Integrate in-app purchases", description: "Set up StoreKit for iOS and Google Play Billing", status: "todo", priority: "medium" },
          { title: "Accessibility audit", description: "Ensure app meets WCAG 2.1 AA standards", status: "todo", priority: "medium" },
          { title: "App Store screenshots", description: "Create new promotional screenshots for both stores", status: "todo", priority: "low" },
        ],
      },
    },
  });

  const board3 = await prisma.board.create({
    data: {
      name: "Marketing Website",
      description: "Company landing page and blog redesign",
      color: "#D29922",
      tasks: {
        create: [
          { title: "Design hero section", description: "New hero with animated gradient background", status: "done", priority: "high" },
          { title: "Build pricing page", description: "Create responsive pricing table with toggle for monthly/yearly", status: "done", priority: "high" },
          { title: "SEO optimization", description: "Add meta tags, sitemap, and structured data", status: "in_progress", priority: "medium" },
          { title: "Integrate blog CMS", description: "Set up headless CMS for blog content management", status: "in_progress", priority: "medium" },
          { title: "Contact form with validation", description: "Build contact form with email notifications", status: "done", priority: "medium" },
          { title: "Add testimonials section", description: "Carousel component with customer quotes and logos", status: "todo", priority: "low" },
          { title: "Performance audit", description: "Run Lighthouse and fix performance issues to hit 90+ score", status: "todo", priority: "high" },
          { title: "Set up analytics", description: "Integrate Google Analytics 4 and conversion tracking", status: "in_progress", priority: "high" },
          { title: "Create 404 page", description: "Design custom 404 page with navigation links", status: "todo", priority: "low" },
          { title: "A/B test CTA buttons", description: "Test different copy and colors for signup buttons", status: "todo", priority: "medium" },
        ],
      },
    },
  });

  const board4 = await prisma.board.create({
    data: {
      name: "DevOps & Infrastructure",
      description: "Cloud infrastructure, monitoring, and automation",
      color: "#F85149",
      tasks: {
        create: [
          { title: "Migrate to Kubernetes", description: "Containerize services and deploy to K8s cluster", status: "in_progress", priority: "high" },
          { title: "Set up Terraform configs", description: "Infrastructure as code for all cloud resources", status: "done", priority: "high" },
          { title: "Configure auto-scaling", description: "Set up HPA for API and worker pods", status: "todo", priority: "high" },
          { title: "Implement log aggregation", description: "Set up ELK stack for centralized logging", status: "in_progress", priority: "medium" },
          { title: "Database backup automation", description: "Scheduled daily backups with 30-day retention", status: "done", priority: "high" },
          { title: "SSL certificate rotation", description: "Automate cert renewal with cert-manager", status: "done", priority: "medium" },
          { title: "Set up Grafana dashboards", description: "Create monitoring dashboards for all services", status: "in_progress", priority: "medium" },
          { title: "Disaster recovery plan", description: "Document and test failover procedures", status: "todo", priority: "high" },
          { title: "Optimize Docker images", description: "Reduce image sizes with multi-stage builds", status: "todo", priority: "low" },
          { title: "Network security audit", description: "Review firewall rules and security groups", status: "todo", priority: "high" },
          { title: "Set up CDN", description: "Configure CloudFront for static assets", status: "done", priority: "medium" },
        ],
      },
    },
  });

  const board5 = await prisma.board.create({
    data: {
      name: "Design System",
      description: "Shared component library and design tokens",
      color: "#BC8CFF",
      tasks: {
        create: [
          { title: "Define color tokens", description: "Create semantic color palette with light/dark variants", status: "done", priority: "high" },
          { title: "Build Button component", description: "Primary, secondary, ghost, and destructive variants", status: "done", priority: "high" },
          { title: "Build Modal component", description: "Accessible modal with focus trap and animations", status: "done", priority: "high" },
          { title: "Build Table component", description: "Sortable, filterable data table with pagination", status: "in_progress", priority: "medium" },
          { title: "Create icon library", description: "Curate and export consistent SVG icon set", status: "in_progress", priority: "medium" },
          { title: "Write Storybook stories", description: "Document all components with interactive examples", status: "in_progress", priority: "medium" },
          { title: "Typography scale", description: "Define heading and body text sizes with line heights", status: "done", priority: "high" },
          { title: "Build Form components", description: "Input, Select, Checkbox, Radio with validation states", status: "todo", priority: "high" },
          { title: "Spacing and layout tokens", description: "Define consistent spacing scale and grid system", status: "done", priority: "medium" },
          { title: "Publish to npm", description: "Set up package build pipeline and publish v1.0", status: "todo", priority: "high" },
        ],
      },
    },
  });

  const boards = [board1, board2, board3, board4, board5];
  for (const b of boards) {
    console.log(`Seeded board: ${b.name} (${b.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
