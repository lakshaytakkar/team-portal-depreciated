import type { EtsPipelineStage, EtsOrderStatus, EtsProductCategory, EtsPackageTier, EtsClient, EtsProduct, EtsOrderDocument, EtsOrder, EtsPayment, EtsProposalBreakdownItem, EtsProposalTimeline, EtsProposalTemplate, EtsWhatsAppTemplate, EtsPriceSetting, EtsPriceInputs, EtsPriceResult, EtsCalcTemplate } from "@/types/ets";
export type { EtsPipelineStage, EtsOrderStatus, EtsProductCategory, EtsPackageTier, EtsClient, EtsProduct, EtsOrderDocument, EtsOrder, EtsPayment, EtsProposalBreakdownItem, EtsProposalTimeline, EtsProposalTemplate, EtsWhatsAppTemplate, EtsPriceSetting, EtsPriceInputs, EtsPriceResult, EtsCalcTemplate };

export const ETS_PIPELINE_STAGES = [
  "new-lead",
  "qualified",
  "token-paid",
  "store-design",
  "inventory-ordered",
  "in-transit",
  "launched",
  "reordering",
] as const;


export const ETS_STAGE_LABELS: Record<EtsPipelineStage, string> = {
  "new-lead": "New Lead",
  "qualified": "Qualified",
  "token-paid": "Token Paid",
  "store-design": "Store Design",
  "inventory-ordered": "Inventory Ordered",
  "in-transit": "In Transit",
  "launched": "Launched",
  "reordering": "Reordering",
};

export const ETS_ORDER_STATUSES = [
  "ordered",
  "factory-ready",
  "shipped",
  "customs",
  "warehouse",
  "dispatched",
] as const;

export const ETS_ORDER_STATUS_LABELS: Record<EtsOrderStatus, string> = {
  ordered: "Ordered",
  "factory-ready": "Factory Ready",
  shipped: "Shipped",
  customs: "In Customs",
  warehouse: "Delhi Warehouse",
  dispatched: "Dispatched",
};

export const ETS_PRODUCT_CATEGORIES = [
  "toys",
  "kitchenware",
  "stationery",
  "decor",
  "bags",
  "household",
  "gifts",
] as const;

export const ETS_CATEGORY_DUTY_RATES: Record<EtsProductCategory, { duty: number; igst: number }> = {
  toys: { duty: 20, igst: 18 },
  kitchenware: { duty: 15, igst: 12 },
  stationery: { duty: 10, igst: 18 },
  decor: { duty: 20, igst: 18 },
  bags: { duty: 20, igst: 18 },
  household: { duty: 15, igst: 12 },
  gifts: { duty: 20, igst: 18 },
};

export const ETS_MRP_BANDS = [29, 49, 79, 99, 129, 149, 199, 249, 299, 399, 499, 599, 799, 999];

function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }
function round1(n: number) { return Math.round(n * 10) / 10; }

export function calculateEtsPrices(inputs: EtsPriceInputs): EtsPriceResult {
  const fobYuan = inputs.exwPriceYuan * (1 + inputs.sourcingCommission / 100);
  const fobInr = fobYuan * inputs.exchangeRate;

  const cbmPerCarton = (inputs.cartonLengthCm * inputs.cartonWidthCm * inputs.cartonHeightCm) / 1000000;
  const cbmPerUnit = inputs.unitsPerCarton > 0 ? cbmPerCarton / inputs.unitsPerCarton : 0;
  const freightPerUnit = cbmPerUnit * inputs.freightPerCbm;

  const insuranceInr = fobInr * (inputs.insurancePercent / 100);
  const cifInr = fobInr + freightPerUnit + insuranceInr;

  const customsDuty = cifInr * (inputs.categoryDutyPercent / 100);
  const swSurcharge = customsDuty * (inputs.swSurchargePercent / 100);
  const assessableValue = cifInr + customsDuty + swSurcharge;
  const igst = assessableValue * (inputs.categoryIgstPercent / 100);

  const chaPortCost = assessableValue * ((inputs.chaPortPercent ?? 2) / 100);
  const mrpTaggingCost = inputs.mrpTaggingCostPerUnit ?? 5;

  const totalLandedCostBeforeDomFreight = assessableValue + igst + chaPortCost + mrpTaggingCost;
  const domesticFreightCost = totalLandedCostBeforeDomFreight * ((inputs.domesticFreightPercent ?? 3) / 100);
  const totalLandedCost = totalLandedCostBeforeDomFreight + domesticFreightCost;

  const storeLandingPrice = totalLandedCost * (1 + inputs.ourMarkupPercent / 100);
  const openingInventoryPrice = totalLandedCost * (1 + (inputs.openingInventoryMarkup ?? 20) / 100);

  const targetMarginFraction = (inputs.targetStoreMargin || 35) / 100;
  let suggestedMrp = ETS_MRP_BANDS[ETS_MRP_BANDS.length - 1];
  for (const band of ETS_MRP_BANDS) {
    const margin = (band - storeLandingPrice) / band;
    if (band >= storeLandingPrice && margin >= targetMarginFraction) {
      suggestedMrp = band;
      break;
    }
  }

  const storeMarginRs = suggestedMrp - storeLandingPrice;
  const storeMarginPercent = suggestedMrp > 0 ? (storeMarginRs / suggestedMrp) * 100 : 0;

  return {
    fobPriceYuan: round2(fobYuan),
    fobPriceInr: round2(fobInr),
    cbmPerUnit: round4(cbmPerUnit),
    freightPerUnit: round2(freightPerUnit),
    cifPriceInr: round2(cifInr),
    customsDuty: round2(customsDuty),
    swSurcharge: round2(swSurcharge),
    igst: round2(igst),
    chaPortCost: round2(chaPortCost),
    domesticFreightCost: round2(domesticFreightCost),
    mrpTaggingCost: round2(mrpTaggingCost),
    totalLandedCost: round2(totalLandedCost),
    storeLandingPrice: round2(storeLandingPrice),
    openingInventoryPrice: round2(openingInventoryPrice),
    suggestedMrp,
    storeMarginPercent: round1(storeMarginPercent),
    storeMarginRs: round2(storeMarginRs),
    marginWarning: storeMarginPercent < (inputs.targetStoreMargin || 35),
  };
}

export const defaultPriceSettings: EtsPriceSetting[] = [
  { key: "exchange_rate", value: 12.0, label: "Exchange Rate", unit: "₹/¥" },
  { key: "sourcing_commission", value: 5, label: "Sourcing Commission", unit: "%" },
  { key: "freight_per_cbm", value: 8000, label: "Freight per CBM", unit: "₹" },
  { key: "insurance_percent", value: 0.5, label: "Insurance", unit: "%" },
  { key: "sw_surcharge_percent", value: 10, label: "SW Surcharge", unit: "%" },
  { key: "cha_port_percent", value: 2, label: "CHA / Port Handling", unit: "%" },
  { key: "domestic_freight_percent", value: 3, label: "Domestic Freight", unit: "%" },
  { key: "mrp_tagging_cost_per_unit", value: 5, label: "MRP Tagging Cost", unit: "₹/unit" },
  { key: "our_markup_percent", value: 25, label: "Replenishment Markup", unit: "%" },
  { key: "opening_inventory_markup", value: 20, label: "Opening Inventory Markup", unit: "%" },
  { key: "target_store_margin", value: 50, label: "Target Store Margin", unit: "%" },
];

export function getDefaultPriceInputs(product: EtsProduct): EtsPriceInputs {
  return {
    exwPriceYuan: product.exwPriceYuan,
    unitsPerCarton: product.unitsPerCarton,
    cartonLengthCm: product.cartonLength,
    cartonWidthCm: product.cartonWidth,
    cartonHeightCm: product.cartonHeight,
    categoryDutyPercent: product.dutyPercent,
    categoryIgstPercent: product.igstPercent,
    exchangeRate: 12.0,
    sourcingCommission: 5,
    freightPerCbm: 8000,
    insurancePercent: 0.5,
    swSurchargePercent: 10,
    ourMarkupPercent: 25,
    targetStoreMargin: 50,
  };
}
