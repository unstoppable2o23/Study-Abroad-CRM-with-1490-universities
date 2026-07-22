import { success } from "@/lib/api-response";

export async function GET() {
  return success({
    status: "ok",
    service: "study-abroad-crm-v2",
    timestamp: new Date().toISOString(),
  });
}
