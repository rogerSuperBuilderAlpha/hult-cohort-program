import { NextResponse } from 'next/server';
import { readSession } from '@/lib/ludwitt/session';
import { runEnergyCalculator, type CalculatorInput } from '@/lib/energy/calculator';
import { appendCrmLead } from '@/lib/crm/store';
import { hasEventContact, normalizeCrmContact } from '@/lib/crm/validate';
import type { CrmContactInput } from '@/lib/crm/types';
import { isEventModeEnabled, isEventWindowOpen } from '@/lib/event/access';
import { getCurrencyInfo } from '@/lib/energy/currency';
import { CEAL_GREEN_BOOKING_URL } from '@/lib/energy/interventions';

type CalculatorRequestBody = CalculatorInput & {
  contact?: CrmContactInput;
  monthlyExpenditureLocal?: number;
};

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as CalculatorRequestBody;
  const { contact: contactInput, monthlyExpenditureLocal, ...calculatorInput } = body;

  let contact;
  try {
    contact = normalizeCrmContact(contactInput);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid contact details';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const eventActive = isEventModeEnabled() && isEventWindowOpen();
  if (eventActive && !hasEventContact(contact)) {
    return NextResponse.json(
      {
        error: 'Please enter your name/company and email so we can save your bill to the session spreadsheet.',
      },
      { status: 400 }
    );
  }

  const result = runEnergyCalculator(calculatorInput);
  const currency = getCurrencyInfo(calculatorInput.jurisdiction);
  const spendLocal =
    monthlyExpenditureLocal != null && monthlyExpenditureLocal > 0
      ? monthlyExpenditureLocal
      : result.currency.monthlyExpenditureLocal;

  let sheetSaved = false;
  try {
    await appendCrmLead({
      platformUserId: session.sub,
      sessionId: session.sessionId,
      contact,
      calculator: {
        jurisdiction: calculatorInput.jurisdiction,
        propertyType: calculatorInput.propertyType,
        monthlyExpenditureUsd: calculatorInput.monthlyExpenditureUsd,
        monthlyExpenditureLocal: spendLocal,
        currencyCode: currency.code,
        monthlyKwh: result.monthlyKwh,
        floorAreaSqm: calculatorInput.floorAreaSqm,
        weeklyOperatingHours: calculatorInput.weeklyOperatingHours,
        majorLoads: calculatorInput.majorLoads,
        auditReadinessScore: result.auditReadinessScore,
        annualKwh: result.annualKwh,
        monthlySavingsLocal25Pct: result.reductionTarget.monthlySavingsLocal,
        bookNowUrl: CEAL_GREEN_BOOKING_URL,
      },
    });
    sheetSaved = true;
  } catch (err) {
    console.error('CRM store error:', err instanceof Error ? err.message : err);
  }

  return NextResponse.json({
    result,
    contactSaved: hasEventContact(contact) || Boolean(contact.email || contact.companyName),
    sheetSaved,
    bookNowUrl: CEAL_GREEN_BOOKING_URL,
  });
}
