import { Severity, FieldReportType, AiVerificationStatus } from '@prisma/client';

export interface VerificationResult {
  aiVerificationStatus: AiVerificationStatus;
  aiConfidence: number; // 0.0 - 1.0
  reason: string;
  verificationSource: string;
}

export interface FieldReportVerificationService {
  verifyReport(reportData: {
    reportType: FieldReportType;
    severity: Severity;
    description: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    hasMedia?: boolean;
  }): Promise<VerificationResult>;
}

export class DemoFieldReportVerificationService implements FieldReportVerificationService {
  public async verifyReport(reportData: {
    reportType: FieldReportType;
    severity: Severity;
    description: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    hasMedia?: boolean;
  }): Promise<VerificationResult> {
    let score = 0.5;
    const reasons: string[] = [];

    // Description detail rule
    if (reportData.description && reportData.description.length > 25) {
      score += 0.15;
      reasons.push('Detailed observation narrative supplied.');
    } else {
      reasons.push('Brief description provided.');
    }

    // Media evidence rule
    if (reportData.hasMedia) {
      score += 0.2;
      reasons.push('Photographic/video evidence attached.');
    } else {
      reasons.push('No media attached yet.');
    }

    // GPS accuracy rule
    if (reportData.accuracy && reportData.accuracy <= 20) {
      score += 0.1;
      reasons.push(`High GPS precision (${reportData.accuracy}m accuracy).`);
    }

    // High/Critical severity attention flag
    if (reportData.severity === 'CRITICAL' || reportData.severity === 'HIGH') {
      score += 0.05;
      reasons.push(`High severity (${reportData.severity}) flagged for priority authority review.`);
    }

    const confidence = Number(Math.min(0.98, Math.max(0.35, score)).toFixed(2));
    let status: AiVerificationStatus = 'PROCESSING';

    if (confidence >= 0.75) {
      status = 'VERIFIED';
    } else if (confidence >= 0.5) {
      status = 'FLAGGED';
    } else {
      status = 'NOT_PROCESSED';
    }

    return {
      aiVerificationStatus: status,
      aiConfidence: confidence,
      reason: reasons.join(' '),
      verificationSource: 'DEMO_RULES',
    };
  }
}

export const verificationService = new DemoFieldReportVerificationService();
