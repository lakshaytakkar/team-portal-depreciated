import { useQuery } from "@tanstack/react-query";
import { portalEtsClient, storeSizeFromArea, type StoreSizeSqFt } from "./mock-data-portal-ets";

export function useEtsStoreSize(): { storeSize: StoreSizeSqFt; isLoading: boolean } {
  const clientId = portalEtsClient.id;

  const { data, isLoading } = useQuery<{ client: { storeArea?: number | null } }>({
    queryKey: ['/api/ets-portal/client', clientId],
  });

  const storeSize = storeSizeFromArea(data?.client?.storeArea);

  return { storeSize, isLoading };
}
