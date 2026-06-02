import { extractArray } from "../../shared/utils/api-shapes";
import { guideRequestSchema } from "../../shared/schemas/guide-request";

export function normalizeGuideRequest(rawRequest) {
  const parsed = guideRequestSchema.safeParse(rawRequest);
  const request = parsed.success ? parsed.data : rawRequest;
  const id = request?.id ?? request?.requestId ?? Date.now();
  const touristName =
    request?.touristName ??
    request?.tourist?.name ??
    request?.tourist?.fullName ??
    request?.tourist?.userName ??
    request?.userName ??
    request?.touristId ??
    `#${id}`;

  return {
    id,
    touristName,
    tripType: request?.tripType ?? request?.title ?? request?.trip?.title ?? "-",
    location: request?.location ?? request?.destination ?? request?.trip?.destination ?? request?.trip?.location ?? "-",
    date: request?.date ?? request?.startDate ?? request?.createdAt ?? "-",
    people: request?.people ?? request?.numberOfPeople ?? request?.trip?.numberOfPeople ?? "-",
    conversationId: request?.conversationId ?? request?.conversation?.id ?? id,
    status: String(request?.status || "").toLowerCase(),
  };
}

export function normalizeGuideRequests(payload) {
  return extractArray(payload).map(normalizeGuideRequest);
}
