import { useQuery } from "@tanstack/react-query";
import { bikesApi } from "../api/bikes.api";
import { bikeDataFallback, normalizeBike } from "../data/bikeData";

export function useBikeData() {
  const { data, isLoading } = useQuery({
    queryKey: ["bike-active"],
    queryFn: bikesApi.getActive,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  return {
    bike: data ? normalizeBike(data) : bikeDataFallback,
    isLoading,
  };
}
