import { describe, it, expect } from "vitest";
import { success, error, paginated, unauthorized, forbidden, notFound, validationError } from "@/lib/api-response";

async function readResponse(response: Response) {
  const body = await response.json();
  return { status: response.status, body };
}

describe("api-response", () => {
  describe("success", () => {
    it("returns 200 with data", async () => {
      const res = success({ name: "test" });
      const { status, body } = await readResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ name: "test" });
    });

    it("returns custom status code", async () => {
      const res = success({ name: "test" }, 201);
      expect(res.status).toBe(201);
    });
  });

  describe("error", () => {
    it("returns 400 with error message", async () => {
      const res = error("Bad request");
      const { status, body } = await readResponse(res);
      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("Bad request");
    });

    it("returns custom status code", async () => {
      const res = error("Server error", 500);
      expect(res.status).toBe(500);
    });
  });

  describe("paginated", () => {
    it("returns paginated data with metadata", async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const res = paginated(data, 10, 1, 2);
      const { status, body } = await readResponse(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.pagination).toEqual({
        total: 10,
        page: 1,
        limit: 2,
        totalPages: 5,
      });
    });
  });

  describe("unauthorized", () => {
    it("returns 401 with default message", async () => {
      const res = unauthorized();
      const { status, body } = await readResponse(res);
      expect(status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("returns custom message", async () => {
      const res = unauthorized("Custom auth error");
      const { body } = await readResponse(res);
      expect(body.error).toBe("Custom auth error");
    });
  });

  describe("forbidden", () => {
    it("returns 403 with default message", async () => {
      const res = forbidden();
      const { status, body } = await readResponse(res);
      expect(status).toBe(403);
      expect(body.error).toBe("Forbidden");
    });
  });

  describe("notFound", () => {
    it("returns 404 with default message", async () => {
      const res = notFound();
      const { status, body } = await readResponse(res);
      expect(status).toBe(404);
      expect(body.error).toBe("Not found");
    });
  });

  describe("validationError", () => {
    it("returns 422 with errors object", async () => {
      const errors = { email: ["Invalid email"], name: ["Required"] };
      const res = validationError(errors);
      const { status, body } = await readResponse(res);
      expect(status).toBe(422);
      expect(body.success).toBe(false);
      expect(body.errors).toEqual(errors);
    });
  });
});
