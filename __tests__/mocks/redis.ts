import { vi } from "vitest";

const mockRedisClient = {
  isOpen: true,
  connect: vi.fn().mockResolvedValue(undefined),
  quit: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  set: vi.fn(),
  setEx: vi.fn(),
  del: vi.fn(),
  keys: vi.fn().mockResolvedValue([]),
  incr: vi.fn().mockResolvedValue(1),
  expire: vi.fn().mockResolvedValue(true),
  ttl: vi.fn().mockResolvedValue(60),
  on: vi.fn(),
};

vi.mock("redis", () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

export { mockRedisClient };
