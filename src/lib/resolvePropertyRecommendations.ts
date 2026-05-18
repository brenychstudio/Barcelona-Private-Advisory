import { getBuyerIntent, getDistrictLens, type BuyerIntentId, type DistrictId } from "../data/barcelonaLens";
import type { Listing } from "../data/listings";

export type PropertyRecommendation = {
  property: Listing;
  score: number;
  isExactMatch: boolean;
  isIntentMatch: boolean;
  isDistrictMatch: boolean;
  rankLabel: string;
};

export type PropertyRecommendationResult = {
  featuredProperty: PropertyRecommendation;
  supportingProperties: PropertyRecommendation[];
  recommendations: PropertyRecommendation[];
  matchedCount: number;
  advisorPathLabel: string;
};

function scoreProperty(property: Listing, activeIntentId: BuyerIntentId, activeDistrictId: DistrictId) {
  const isIntentMatch = property.intentIds.includes(activeIntentId);
  const isDistrictMatch = property.districtId === activeDistrictId;
  const isExactMatch = isIntentMatch && isDistrictMatch;

  const score =
    (isExactMatch ? 1000 : 0) +
    (isIntentMatch ? 520 : 0) +
    (isDistrictMatch ? 300 : 0) +
    (100 - property.shortlistPriority);

  return {
    property,
    score,
    isExactMatch,
    isIntentMatch,
    isDistrictMatch,
    rankLabel: isExactMatch ? "primary match" : isIntentMatch ? "intent fit" : isDistrictMatch ? "district fit" : "control option",
  };
}

export function resolvePropertyRecommendations(
  properties: Listing[],
  activeIntentId: BuyerIntentId,
  activeDistrictId: DistrictId,
): PropertyRecommendationResult {
  const activeIntent = getBuyerIntent(activeIntentId);
  const activeDistrict = getDistrictLens(activeDistrictId);

  const recommendations = properties
    .map((property) => scoreProperty(property, activeIntentId, activeDistrictId))
    .sort((a, b) => b.score - a.score || a.property.shortlistPriority - b.property.shortlistPriority);

  const featuredProperty = recommendations[0] ?? scoreProperty(properties[0], activeIntentId, activeDistrictId);
  const supportingProperties = recommendations.filter((item) => item.property.id !== featuredProperty.property.id).slice(0, 3);
  const matchedCount = recommendations.filter((item) => item.isIntentMatch || item.isDistrictMatch).length;

  return {
    featuredProperty,
    supportingProperties,
    recommendations,
    matchedCount,
    advisorPathLabel: `${activeIntent.label} -> ${activeDistrict.name} -> ${featuredProperty.property.title} -> advisory action`,
  };
}
