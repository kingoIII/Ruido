import { Badge } from "@/components/ui/badge";

const LICENSE_LABELS: Record<string, string> = {
  cc_by: "CC-BY",
  cc_by_sa: "CC-BY-SA",
  cc0: "CC0",
  custom: "Custom",
};

export function LicenseBadge({ license }: { license: string }) {
  return <Badge variant="outline">{LICENSE_LABELS[license] ?? license}</Badge>;
}
