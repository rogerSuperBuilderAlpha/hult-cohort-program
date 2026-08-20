import type { JurisdictionId } from '@/lib/energy/tariffs';
import type { PropertyType } from '@/lib/energy/calculator';

export type CrmContactInput = {
  companyName?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type CrmContact = {
  companyName: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
};

export type CrmLead = {
  id: string;
  recordedAt: string;
  platformUserId: string;
  sessionId: string;
  contact: CrmContact;
  calculator: {
    jurisdiction: JurisdictionId;
    propertyType: PropertyType;
    monthlyExpenditureUsd: number;
    monthlyExpenditureLocal: number | null;
    currencyCode: string | null;
    monthlyKwh: number | null;
    floorAreaSqm: number | null;
    weeklyOperatingHours: number | null;
    majorLoads: string[];
    auditReadinessScore: number;
    annualKwh: number | null;
    monthlySavingsLocal25Pct: number | null;
    bookNowUrl: string | null;
  };
};
