import { vi } from "vitest";

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  organization: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  university: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  course: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  student: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  application: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  document: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  documentChunk: {
    findMany: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  notification: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  psychometricTest: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  psychometricAssignment: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  entranceExam: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  note: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  career: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  country: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  scholarship: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(((fns: any) => {
    if (Array.isArray(fns)) {
      return Promise.all(fns);
    }
    return fns();
  }) as any),
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

export { mockPrisma };
