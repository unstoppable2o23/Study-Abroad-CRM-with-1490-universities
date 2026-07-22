import { success } from "@/lib/api-response";

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Study Abroad CRM API",
    version: "1.0.0",
    description: "REST API for the Study Abroad CRM & Student Career Guidance Platform. Provides endpoints for identity, countries, universities, courses, careers, psychometric testing, AI services, documents, applications, CRM, visas, scholarships, and more.",
  },
  servers: [
    { url: "http://localhost:3000", description: "Development" },
    { url: "https://api.studyabroadcrm.com", description: "Production" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" }, limit: { type: "integer" },
          total: { type: "integer" }, totalPages: { type: "integer" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"], summary: "Login", description: "Authenticate user with email and password",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } }, required: ["email", "password"] } } } },
        responses: { 200: { description: "Login successful" }, 401: { description: "Invalid credentials" } },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"], summary: "Register", description: "Create a new user account",
        requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" }, fullName: { type: "string" } }, required: ["email", "password", "fullName"] } } } },
        responses: { 201: { description: "User created" }, 400: { description: "Validation error" } },
      },
    },
    "/api/auth/me": { get: { tags: ["Auth"], summary: "Get current user", responses: { 200: { description: "Current user profile" }, 401: { description: "Unauthorized" } } } },
    "/api/auth/refresh": { post: { tags: ["Auth"], summary: "Refresh access token", responses: { 200: { description: "New tokens" } } } },
    "/api/auth/logout": { post: { tags: ["Auth"], summary: "Logout", responses: { 200: { description: "Logged out" } } } },

    "/api/countries": { get: { tags: ["Countries"], summary: "List countries", parameters: [{ name: "search", in: "query", schema: { type: "string" } }, { name: "region", in: "query", schema: { type: "string" } }], responses: { 200: { description: "List of countries" } } }, post: { tags: ["Countries"], summary: "Create country", security: [{ bearerAuth: [] }], responses: { 201: { description: "Country created" } } } },
    "/api/countries/{id}": { get: { tags: ["Countries"], summary: "Get country details", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Country details" } } }, patch: { tags: ["Countries"], summary: "Update country", security: [{ bearerAuth: [] }], responses: { 200: { description: "Country updated" } } } },

    "/api/universities": { get: { tags: ["Universities"], summary: "List universities", parameters: [{ name: "search", in: "query", schema: { type: "string" } }, { name: "countryId", in: "query", schema: { type: "string" } }], responses: { 200: { description: "List of universities" } } } },
    "/api/universities/search": { get: { tags: ["Universities"], summary: "Search universities", parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Search results" } } } },
    "/api/universities/compare": { post: { tags: ["Universities"], summary: "Compare universities", requestBody: { content: { "application/json": { schema: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } }, required: ["ids"] } } } }, responses: { 200: { description: "Comparison results" } } } },

    "/api/courses": { get: { tags: ["Courses"], summary: "List courses", responses: { 200: { description: "List of courses" } } } },
    "/api/courses/search": { get: { tags: ["Courses"], summary: "Search courses", parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Search results" } } } },

    "/api/careers": { get: { tags: ["Careers"], summary: "List careers", responses: { 200: { description: "List of careers" } } } },
    "/api/careers/search": { get: { tags: ["Careers"], summary: "Search careers", parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Search results" } } } },

    "/api/scholarships": { get: { tags: ["Scholarships"], summary: "List scholarships", parameters: [{ name: "type", in: "query", schema: { type: "string" } }, { name: "countryId", in: "query", schema: { type: "string" } }], responses: { 200: { description: "List of scholarships" } } } },
    "/api/scholarships/search": { get: { tags: ["Scholarships"], summary: "Search scholarships", parameters: [{ name: "q", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Search results" } } } },

    "/api/psychometric/tests": { get: { tags: ["Psychometric"], summary: "List psychometric tests", responses: { 200: { description: "List of tests" } } } },
    "/api/psychometric/assignments": { get: { tags: ["Psychometric"], summary: "List assignments", responses: { 200: { description: "List of assignments" } } }, post: { tags: ["Psychometric"], summary: "Create assignment", responses: { 201: { description: "Assignment created" } } } },
    "/api/psychometric/assignments/{id}/submit": { post: { tags: ["Psychometric"], summary: "Submit test answers", responses: { 200: { description: "Test submitted" } } } },
    "/api/psychometric/reports": { get: { tags: ["Psychometric"], summary: "List reports", responses: { 200: { description: "List of reports" } } }, post: { tags: ["Psychometric"], summary: "Generate report", responses: { 201: { description: "Report generated" } } } },

    "/api/documents": { get: { tags: ["Documents"], summary: "List documents", responses: { 200: { description: "List of documents" } } }, post: { tags: ["Documents"], summary: "Upload document", responses: { 201: { description: "Document uploaded" } } } },
    "/api/documents/{id}/analyze": { post: { tags: ["Documents"], summary: "Analyze document with AI", responses: { 200: { description: "Document analyzed" } } } },
    "/api/documents/{id}/extract": { post: { tags: ["Documents"], summary: "Extract text from document", responses: { 200: { description: "Text extracted" } } } },
    "/api/documents/verify": { post: { tags: ["Documents"], summary: "Verify documents", responses: { 200: { description: "Documents verified" } } } },

    "/api/applications": { get: { tags: ["Applications"], summary: "List applications", responses: { 200: { description: "List of applications" } } }, post: { tags: ["Applications"], summary: "Create application", responses: { 201: { description: "Application created" } } } },
    "/api/applications/{id}": { get: { tags: ["Applications"], summary: "Get application details", responses: { 200: { description: "Application details" } } }, patch: { tags: ["Applications"], summary: "Update application", responses: { 200: { description: "Application updated" } } } },

    "/api/ai/chat": { post: { tags: ["AI"], summary: "Chat with AI assistant", responses: { 200: { description: "AI response" } } } },
    "/api/ai/university-recommendations": { get: { tags: ["AI"], summary: "AI university recommendations", responses: { 200: { description: "Recommendations" } } } },
    "/api/ai/career-recommendations": { get: { tags: ["AI"], summary: "AI career recommendations", responses: { 200: { description: "Recommendations" } } } },
    "/api/ai/sop/generate": { post: { tags: ["AI"], summary: "Generate SOP", responses: { 200: { description: "SOP generated" } } } },
    "/api/ai/resume/generate": { post: { tags: ["AI"], summary: "Generate resume", responses: { 200: { description: "Resume generated" } } } },
    "/api/ai/visa/guide": { post: { tags: ["AI"], summary: "AI visa guidance", responses: { 200: { description: "Visa guidance" } } } },

    "/api/countries/{id}/visa": { get: { tags: ["Visa"], summary: "Get visa overview", responses: { 200: { description: "Visa info" } } } },
    "/api/countries/{id}/visa/processes": { get: { tags: ["Visa"], summary: "List visa processes", responses: { 200: { description: "Visa processes" } } } },
    "/api/countries/{id}/visa/documents": { get: { tags: ["Visa"], summary: "List visa documents", responses: { 200: { description: "Visa documents" } } } },
    "/api/countries/{id}/visa/rejections": { get: { tags: ["Visa"], summary: "List visa rejection reasons", responses: { 200: { description: "Rejection reasons" } } } },
    "/api/countries/{id}/work": { get: { tags: ["Visa"], summary: "List work opportunities", responses: { 200: { description: "Work opportunities" } } } },
    "/api/countries/{id}/pr": { get: { tags: ["Visa"], summary: "List PR pathways", responses: { 200: { description: "PR pathways" } } } },

    "/api/notifications": { get: { tags: ["Notifications"], summary: "List notifications", parameters: [{ name: "unread", in: "query", schema: { type: "boolean" } }], responses: { 200: { description: "Notifications" } } }, patch: { tags: ["Notifications"], summary: "Mark as read", responses: { 200: { description: "Marked as read" } } } },
    "/api/notification-preferences": { get: { tags: ["Notifications"], summary: "Get notification preferences", responses: { 200: { description: "Preferences" } } }, patch: { tags: ["Notifications"], summary: "Update preferences", responses: { 200: { description: "Preferences updated" } } } },

    "/api/recommendations/scored": { get: { tags: ["Recommendations"], summary: "Get scored recommendations", parameters: [{ name: "type", in: "query", schema: { type: "string", enum: ["university", "course"] } }], responses: { 200: { description: "Scored recommendations" } } }, post: { tags: ["Recommendations"], summary: "Save recommendations", responses: { 200: { description: "Saved" } } } },
    "/api/student/dashboard": { get: { tags: ["Student"], summary: "Student dashboard", responses: { 200: { description: "Dashboard data" } } } },

    "/api/admin/dashboard": { get: { tags: ["Admin"], summary: "Admin dashboard", responses: { 200: { description: "Dashboard data" } } } },
    "/api/admin/analytics": { get: { tags: ["Admin"], summary: "Admin analytics", responses: { 200: { description: "Analytics data" } } } },

    "/api/super-admin/dashboard": { get: { tags: ["Super Admin"], summary: "Super admin dashboard", responses: { 200: { description: "Dashboard data" } } } },

    "/api/roles": { get: { tags: ["RBAC"], summary: "List roles", responses: { 200: { description: "Roles" } } }, post: { tags: ["RBAC"], summary: "Create role", responses: { 201: { description: "Role created" } } } },
    "/api/roles/{id}": { get: { tags: ["RBAC"], summary: "Get role", responses: { 200: { description: "Role details" } } }, patch: { tags: ["RBAC"], summary: "Update role", responses: { 200: { description: "Role updated" } } }, delete: { tags: ["RBAC"], summary: "Delete role", responses: { 200: { description: "Role deleted" } } } },
    "/api/permissions": { get: { tags: ["RBAC"], summary: "List all permissions", responses: { 200: { description: "Permissions" } } } },

    "/api/subscription": { get: { tags: ["Subscription"], summary: "Get subscription info", responses: { 200: { description: "Subscription details" } } }, patch: { tags: ["Subscription"], summary: "Update subscription", responses: { 200: { description: "Updated" } } } },
    "/api/subscription/reminders": { post: { tags: ["Subscription"], summary: "Generate expiry reminders", responses: { 200: { description: "Reminders sent" } } } },

    "/api/analytics/career-trends": { get: { tags: ["Analytics"], summary: "Career trends analytics", responses: { 200: { description: "Career trends" } } } },
    "/api/analytics/exports": { post: { tags: ["Analytics"], summary: "Export data", requestBody: { content: { "application/json": { schema: { type: "object", properties: { type: { type: "string" }, format: { type: "string", enum: ["csv", "json"] } }, required: ["type", "format"] } } } }, responses: { 200: { description: "File download" } } } },

    "/api/knowledge": { get: { tags: ["Knowledge"], summary: "List knowledge documents", responses: { 200: { description: "Documents" } } }, post: { tags: ["Knowledge"], summary: "Create knowledge document", responses: { 201: { description: "Created" } } } },
    "/api/knowledge/search": { get: { tags: ["Knowledge"], summary: "Search knowledge base", parameters: [{ name: "q", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Search results" } } } },

    "/api/imports/status": { get: { tags: ["Import"], summary: "Import status dashboard", responses: { 200: { description: "Import status" } } } },
    "/api/universities/import/csv": { post: { tags: ["Import"], summary: "Import universities from CSV", responses: { 201: { description: "Import results" } } } },
    "/api/courses/import/csv": { post: { tags: ["Import"], summary: "Import courses from CSV", responses: { 201: { description: "Import results" } } } },
    "/api/careers/import/csv": { post: { tags: ["Import"], summary: "Import careers from CSV", responses: { 201: { description: "Import results" } } } },
    "/api/scholarships/import/csv": { post: { tags: ["Import"], summary: "Import scholarships from CSV", responses: { 201: { description: "Import results" } } } },

    "/api/health": { get: { tags: ["System"], summary: "Health check", responses: { 200: { description: "OK" } } } },
    "/api/docs/openapi": { get: { tags: ["System"], summary: "OpenAPI specification", responses: { 200: { description: "OpenAPI JSON" } } } },
  },
};

export async function GET() {
  return success(openapi);
}
